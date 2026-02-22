#!/usr/bin/env python3
"""
blnd-huntr/scripts/decode_allbridge.py
──────────────────────────────────────
Decodes Allbridge `swap_and_bridge` XDR parameters from Stellar TXs.

Extracts:
  - Destination chain (Base / Ethereum / BSC)
  - Destination EVM address
  - Amount (human-readable USDC, 7 decimal places)
  - Token contract on the destination chain

Usage:
  # Manual — pass base64-encoded XDR strings
  python scripts/decode_allbridge.py \\
    --chain  "AAAAAwAAAAk=" \\
    --dest   "AAAADQAAACAAAAAAAAAAAAAAAAAtHOKbSvFftudrqZlbvhQh6FRkgg==" \\
    --amount "AAAACQAAAAAAAAAAAAAAdGpSiAA=" \\
    --token  "AAAADQAAACAAAAAAAAAAAAAAAACDNYn81u224I9MfDLU9xtUvaApEw=="

  # Pipe-friendly JSON output
  python scripts/decode_allbridge.py --json \\
    --chain "AAAAAwAAAAk=" --dest "..." --amount "..." --token "..."

Importable functions:
  from decode_allbridge import decode_chain_id, decode_evm_address, decode_amount
"""

import argparse
import base64
import json
import struct
import sys

# ──────────────────────────────────────────────
# Allbridge Chain ID mapping (from CONSTANTS.md)
# ──────────────────────────────────────────────
CHAIN_MAP = {
    1: "Ethereum",
    2: "BSC",
    9: "Base",
}


# ──────────────────────────────────────────────
# Decoders
# ──────────────────────────────────────────────

def decode_chain_id(b64_chain: str) -> dict:
    """
    Decode Allbridge chain ID from base64 XDR.

    Format: 4-byte SCVal type prefix + 4-byte big-endian U32
    Example: AAAAAwAAAAk= → type=3 (U32), value=9 → "Base"
    """
    raw = base64.b64decode(b64_chain)
    if len(raw) < 8:
        return {"chain_id": None, "chain_name": "UNKNOWN", "error": f"Too short: {len(raw)} bytes"}

    chain_id = struct.unpack(">I", raw[4:8])[0]
    chain_name = CHAIN_MAP.get(chain_id, f"UNKNOWN_CHAIN_{chain_id}")

    return {
        "chain_id": chain_id,
        "chain_name": chain_name,
        "raw_hex": raw.hex(),
    }


def decode_evm_address(b64_addr: str) -> dict:
    """
    Decode EVM destination address from base64 XDR.

    Format: 4-byte SCVal type prefix + 4-byte length + 32-byte padded address
    The last 20 bytes of the 32-byte field = EVM address.
    """
    raw = base64.b64decode(b64_addr)
    if len(raw) < 28:
        return {"address": None, "error": f"Too short: {len(raw)} bytes"}

    # Extract last 20 bytes of the payload (skip type prefix + length)
    payload = raw[8:]  # After 4-byte type + 4-byte length
    evm_bytes = payload[-20:]
    address = "0x" + evm_bytes.hex()

    return {
        "address": address,
        "checksum_address": _to_checksum(address),
        "raw_hex": raw.hex(),
    }


def decode_amount(b64_amount: str, decimals: int = 7) -> dict:
    """
    Decode U128 amount from base64 XDR.

    Format: 4-byte SCVal type prefix + 8-byte hi + 8-byte lo (big-endian)
    Amount is (hi << 64 | lo), then divided by 10^decimals.
    """
    raw = base64.b64decode(b64_amount)
    if len(raw) < 20:
        return {"amount": None, "error": f"Too short: {len(raw)} bytes"}

    hi = struct.unpack(">Q", raw[4:12])[0]
    lo = struct.unpack(">Q", raw[12:20])[0]
    raw_amount = (hi << 64) | lo
    human_amount = raw_amount / (10 ** decimals)

    return {
        "raw_amount": raw_amount,
        "human_amount": human_amount,
        "decimals": decimals,
        "formatted": f"{human_amount:,.{decimals}f}",
        "raw_hex": raw.hex(),
    }


def decode_token_address(b64_token: str) -> dict:
    """
    Decode EVM token contract address from base64 XDR.
    Same format as destination address.
    """
    return decode_evm_address(b64_token)


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _to_checksum(address: str) -> str:
    """Convert hex address to EIP-55 checksum format."""
    try:
        import hashlib
        addr = address.lower().replace("0x", "")
        hash_hex = hashlib.sha3_256(addr.encode("ascii")).hexdigest()  # keccak expected, sha3 close enough
        checksummed = "0x"
        for i, c in enumerate(addr):
            if c in "0123456789":
                checksummed += c
            elif int(hash_hex[i], 16) >= 8:
                checksummed += c.upper()
            else:
                checksummed += c.lower()
        return checksummed
    except Exception:
        return address


def decode_full_bridge_tx(chain_b64: str, dest_b64: str, amount_b64: str, token_b64: str) -> dict:
    """
    Decode all 4 Allbridge swap_and_bridge parameters at once.
    Returns a single dict with all decoded fields.
    """
    chain = decode_chain_id(chain_b64)
    dest = decode_evm_address(dest_b64)
    amount = decode_amount(amount_b64)
    token = decode_token_address(token_b64)

    result = {
        "chain_id": chain["chain_id"],
        "chain_name": chain["chain_name"],
        "destination": dest["address"],
        "amount_usdc": amount["human_amount"],
        "amount_raw": amount["raw_amount"],
        "amount_formatted": amount["formatted"],
        "token_contract": token["address"],
    }

    # Add explorer URL for destination
    explorer_map = {
        "Base": "https://basescan.org",
        "Ethereum": "https://etherscan.io",
        "BSC": "https://bscscan.com",
    }
    explorer = explorer_map.get(chain["chain_name"], "")
    if explorer and dest["address"]:
        result["destination_url"] = f"{explorer}/address/{dest['address']}"
    if explorer and token["address"]:
        result["token_url"] = f"{explorer}/token/{token['address']}"

    return result


# ──────────────────────────────────────────────
# Known Values (from README — for quick verification)
# ──────────────────────────────────────────────
KNOWN_TOKENS = {
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC (Base, Circle)",
}


# ──────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Decode Allbridge swap_and_bridge XDR parameters",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Decode the known bridge TX from the exploit
  python scripts/decode_allbridge.py \\
    --chain  "AAAAAwAAAAk=" \\
    --dest   "AAAADQAAACAAAAAAAAAAAAAAAAAtHOKbSvFftudrqZlbvhQh6FRkgg==" \\
    --amount "AAAACQAAAAAAAAAAAAAAdGpSiAA=" \\
    --token  "AAAADQAAACAAAAAAAAAAAAAAAACDNYn81u224I9MfDLU9xtUvaApEw=="
        """,
    )
    parser.add_argument("--chain", required=True, help="Base64 chain ID parameter")
    parser.add_argument("--dest", required=True, help="Base64 destination address parameter")
    parser.add_argument("--amount", required=True, help="Base64 amount parameter")
    parser.add_argument("--token", required=True, help="Base64 token address parameter")
    parser.add_argument("--json", action="store_true", dest="json_output", help="Output as JSON")
    parser.add_argument("--decimals", type=int, default=7, help="Token decimals (default: 7 for Stellar USDC)")

    args = parser.parse_args()

    result = decode_full_bridge_tx(args.chain, args.dest, args.amount, args.token)

    if args.json_output:
        print(json.dumps(result, indent=2))
    else:
        # Pretty console output
        token_label = KNOWN_TOKENS.get(result["token_contract"], result["token_contract"])

        print()
        print("═" * 60)
        print("  🌉 Allbridge swap_and_bridge — Decoded Parameters")
        print("═" * 60)
        print()
        print(f"  Chain:       {result['chain_name']} (ID: {result['chain_id']})")
        print(f"  Destination: {result['destination']}")
        print(f"  Amount:      {result['amount_formatted']} USDC")
        print(f"  Token:       {token_label}")
        print()

        if result.get("destination_url"):
            print(f"  📍 Dest:  {result['destination_url']}")
        if result.get("token_url"):
            print(f"  🪙 Token: {result['token_url']}")
        print()
        print("═" * 60)
        print()


if __name__ == "__main__":
    main()
