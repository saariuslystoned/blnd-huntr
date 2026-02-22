#!/usr/bin/env python3
"""
blnd-huntr/scripts/monitor_evm.py
─────────────────────────────────
Monitors EVM-side attacker wallets across Ethereum, Base, and BSC.

Priority targets (from Agent Playbook):
  🔴 CRITICAL  — Accumulator 0x0b2B16E1...3eC6  (Ethereum, $591K parked)
  🟠 HIGH      — BSC wallet   0x2d1ce29b...6482  (38.7K USDC untouched)
  🔵 ACTIVE    — Base wallet  0x2d1ce29b...6482  ($787K, swapping via UniswapX)

Usage:
  python scripts/monitor_evm.py                     # one-shot all chains
  python scripts/monitor_evm.py --chain ethereum     # single chain
  python scripts/monitor_evm.py --watch 120          # poll every 2 min
  python scripts/monitor_evm.py --accumulator        # accumulator only (critical)
"""

import argparse
import sys
import time
from datetime import datetime, timezone
from decimal import Decimal

import requests
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from config import (
    ACCUMULATOR,
    EVM_ATTACKER,
    EVM_CHAINS,
    PHISHING_WALLETS,
    VANITY_RING_1,
    VANITY_RING_2,
)

console = Console()

# Known addresses for labeling
KNOWN_LABELS: dict[str, str] = {
    EVM_ATTACKER.lower(): "🎯 Main Attacker",
    ACCUMULATOR.lower(): "💰 ACCUMULATOR",
}
for label, addr in PHISHING_WALLETS.items():
    KNOWN_LABELS[addr.lower()] = f"🚩 {label}"
for addr in VANITY_RING_1:
    KNOWN_LABELS[addr.lower()] = "👻 Vanity Ring #1"
for addr in VANITY_RING_2:
    KNOWN_LABELS[addr.lower()] = "👻 Vanity Ring #2"


# ──────────────────────────────────────────────
# EVM Scanner Helpers
# ──────────────────────────────────────────────

def etherscan_get(chain: str, module: str, action: str, extra: dict | None = None) -> dict:
    """Generic Etherscan-compatible API call."""
    cfg = EVM_CHAINS.get(chain)
    if not cfg:
        raise ValueError(f"Unknown chain: {chain}")

    params = {
        "module": module,
        "action": action,
        "apikey": cfg["key"],
    }
    if extra:
        params.update(extra)

    resp = requests.get(cfg["api"], params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if data.get("status") == "0" and data.get("message") == "NOTOK":
        raise RuntimeError(f"API error ({chain}): {data.get('result', 'unknown')}")

    return data


def get_eth_balance(chain: str, address: str) -> Decimal:
    """Get native token balance (ETH/BNB) in ether units."""
    data = etherscan_get(chain, "account", "balance", {"address": address, "tag": "latest"})
    wei = Decimal(data.get("result", "0"))
    return wei / Decimal("1e18")


def get_token_balance(chain: str, address: str, contract: str) -> Decimal:
    """Get ERC-20 token balance."""
    data = etherscan_get(chain, "account", "tokenbalance", {
        "address": address,
        "contractaddress": contract,
        "tag": "latest",
    })
    raw = Decimal(data.get("result", "0"))
    return raw / Decimal("1e6")  # USDC uses 6 decimals


def get_normal_txs(chain: str, address: str, limit: int = 25) -> list[dict]:
    """Get normal (external) transactions."""
    data = etherscan_get(chain, "account", "txlist", {
        "address": address,
        "startblock": 0,
        "endblock": 99999999,
        "page": 1,
        "offset": limit,
        "sort": "desc",
    })
    return data.get("result", []) if isinstance(data.get("result"), list) else []


def get_internal_txs(chain: str, address: str, limit: int = 25) -> list[dict]:
    """Get internal transactions."""
    data = etherscan_get(chain, "account", "txlistinternal", {
        "address": address,
        "startblock": 0,
        "endblock": 99999999,
        "page": 1,
        "offset": limit,
        "sort": "desc",
    })
    return data.get("result", []) if isinstance(data.get("result"), list) else []


def get_token_txs(chain: str, address: str, limit: int = 25) -> list[dict]:
    """Get ERC-20 token transfer events."""
    data = etherscan_get(chain, "account", "tokentx", {
        "address": address,
        "startblock": 0,
        "endblock": 99999999,
        "page": 1,
        "offset": limit,
        "sort": "desc",
    })
    return data.get("result", []) if isinstance(data.get("result"), list) else []


# ──────────────────────────────────────────────
# Display Functions
# ──────────────────────────────────────────────

def label_addr(address: str) -> str:
    """Return a label for known addresses, or truncated address."""
    addr_lower = address.lower()
    if addr_lower in KNOWN_LABELS:
        return f"{KNOWN_LABELS[addr_lower]} ({address[:8]}...)"
    return f"{address[:10]}...{address[-4:]}"


def display_balance(chain: str, address: str, native_balance: Decimal, label: str = ""):
    """Show a balance panel."""
    cfg = EVM_CHAINS[chain]
    native_name = "BNB" if chain == "bsc" else "ETH"
    title = f"{label or label_addr(address)} on {cfg['name']}"

    # Estimate USD (rough)
    eth_price = 2700 if chain != "bsc" else 300
    usd_est = float(native_balance) * eth_price

    style = "bold red" if usd_est > 100_000 else "yellow" if usd_est > 10_000 else "green"
    console.print(Panel(
        f"[{style}]{native_balance:.6f} {native_name}  (~${usd_est:,.0f} USD est.)[/]\n"
        f"[dim]Explorer: {cfg['explorer']}/address/{address}[/]",
        title=f"💰 {title}",
        border_style=style,
    ))


def display_txs(txs: list[dict], chain: str, title: str = "Transactions"):
    """Pretty-print a list of transactions."""
    if not txs:
        console.print(f"[dim]No {title.lower()} found.[/]")
        return

    table = Table(title=f"📋 {title}")
    table.add_column("Time", style="cyan", no_wrap=True)
    table.add_column("Dir", style="bold", width=4)
    table.add_column("From", style="white", max_width=30)
    table.add_column("To", style="white", max_width=30)
    table.add_column("Value", style="green", justify="right")
    table.add_column("Hash", style="dim", max_width=14)

    for tx in txs[:15]:  # Cap display
        ts = int(tx.get("timeStamp", 0))
        time_str = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%m-%d %H:%M") if ts else "?"

        from_addr = tx.get("from", "")
        to_addr = tx.get("to", "")
        value_wei = Decimal(tx.get("value", "0"))
        native_name = "BNB" if chain == "bsc" else "ETH"
        value = value_wei / Decimal("1e18")
        tx_hash = tx.get("hash", "")[:14]

        direction = "→" if from_addr.lower() == EVM_ATTACKER.lower() or from_addr.lower() == ACCUMULATOR.lower() else "←"
        dir_style = "red" if direction == "→" else "green"

        table.add_row(
            time_str,
            f"[{dir_style}]{direction}[/]",
            label_addr(from_addr),
            label_addr(to_addr),
            f"{value:.6f} {native_name}" if value > 0 else "[dim]0[/]",
            tx_hash,
        )

    console.print(table)


def display_token_txs(txs: list[dict], chain: str):
    """Pretty-print ERC-20 token transfers."""
    if not txs:
        console.print("[dim]No token transfers found.[/]")
        return

    # Filter out junk/spam tokens by checking for known scam indicators
    filtered = [
        tx for tx in txs
        if tx.get("tokenSymbol", "").upper() not in ("FLASHLOAN", "ROBO", "")
    ]

    if not filtered:
        console.print("[dim]Only junk token spam found (filtered).[/]")
        return

    table = Table(title="🪙 Token Transfers")
    table.add_column("Time", style="cyan", no_wrap=True)
    table.add_column("Token", style="magenta")
    table.add_column("From", style="white", max_width=24)
    table.add_column("To", style="white", max_width=24)
    table.add_column("Amount", style="green", justify="right")

    for tx in filtered[:15]:
        ts = int(tx.get("timeStamp", 0))
        time_str = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%m-%d %H:%M") if ts else "?"

        decimals = int(tx.get("tokenDecimal", 18))
        raw = Decimal(tx.get("value", "0"))
        amount = raw / Decimal(10 ** decimals)

        table.add_row(
            time_str,
            tx.get("tokenSymbol", "?"),
            label_addr(tx.get("from", "")),
            label_addr(tx.get("to", "")),
            f"{amount:,.4f}",
        )

    console.print(table)


# ──────────────────────────────────────────────
# Alert Logic
# ──────────────────────────────────────────────

def check_accumulator_alerts(chain: str, normal_txs: list[dict], internal_txs: list[dict]) -> list[str]:
    """
    🔴 CRITICAL: Check if the accumulator has ANY outgoing transactions.
    """
    alerts = []
    for tx in normal_txs:
        if tx.get("from", "").lower() == ACCUMULATOR.lower():
            value = Decimal(tx.get("value", "0")) / Decimal("1e18")
            to = tx.get("to", "?")
            alerts.append(
                f"🔴🔴🔴 ACCUMULATOR OUTGOING TX DETECTED! 🔴🔴🔴\n"
                f"   Hash: {tx.get('hash', '?')}\n"
                f"   To: {label_addr(to)}\n"
                f"   Value: {value:.6f} ETH\n"
                f"   ⚡ DROP EVERYTHING — TRACE THIS OUTPUT NOW"
            )
    return alerts


def check_chain_alerts(chain: str, address: str, normal_txs: list[dict], token_txs: list[dict]) -> list[str]:
    """Check for noteworthy activity on a chain."""
    alerts = []
    for tx in normal_txs:
        if tx.get("from", "").lower() == address.lower():
            value = Decimal(tx.get("value", "0")) / Decimal("1e18")
            if value > 0.01:
                to = tx.get("to", "?")
                alerts.append(
                    f"🟡 Outgoing TX on {EVM_CHAINS[chain]['name']}: "
                    f"{value:.4f} ETH/BNB → {label_addr(to)}"
                )

    # Check for new token transfers
    for tx in token_txs:
        symbol = tx.get("tokenSymbol", "").upper()
        if symbol in ("USDC", "USDT", "DAI", "WETH"):
            decimals = int(tx.get("tokenDecimal", 18))
            amount = Decimal(tx.get("value", "0")) / Decimal(10 ** decimals)
            if amount > 1000:
                direction = "OUT" if tx.get("from", "").lower() == address.lower() else "IN"
                alerts.append(
                    f"🟠 Token transfer [{direction}] on {EVM_CHAINS[chain]['name']}: "
                    f"{amount:,.2f} {symbol}"
                )

    return alerts


# ──────────────────────────────────────────────
# Chain Monitor
# ──────────────────────────────────────────────

def monitor_chain(chain: str, address: str, verbose: bool = True) -> dict:
    """Monitor a single address on a single chain."""
    cfg = EVM_CHAINS.get(chain)
    if not cfg:
        console.print(f"[red]Unknown chain: {chain}[/]")
        return {}

    if not cfg["key"]:
        console.print(f"[yellow]⚠️  No API key for {cfg['name']} — set {chain.upper()}SCAN_API_KEY in .env[/]")
        return {}

    results: dict = {"chain": chain, "address": address}

    console.print(f"\n[bold blue]━━━ {cfg['name']} ━━━[/]")

    # Balance
    try:
        balance = get_eth_balance(chain, address)
        results["native_balance"] = float(balance)
        if verbose:
            display_balance(chain, address, balance)
    except Exception as e:
        console.print(f"[red]Balance error: {e}[/]")

    # Normal TXs
    try:
        normal = get_normal_txs(chain, address, limit=15)
        results["normal_txs"] = len(normal)
        if verbose:
            display_txs(normal, chain, f"Normal TXs ({cfg['name']})")
    except Exception as e:
        console.print(f"[red]TX fetch error: {e}[/]")
        normal = []

    # Internal TXs
    try:
        internal = get_internal_txs(chain, address, limit=10)
        results["internal_txs"] = len(internal)
        if verbose and internal:
            display_txs(internal, chain, f"Internal TXs ({cfg['name']})")
    except Exception as e:
        internal = []

    # Token transfers
    try:
        tokens = get_token_txs(chain, address, limit=15)
        results["token_txs"] = len(tokens)
        if verbose:
            display_token_txs(tokens, chain)
    except Exception as e:
        console.print(f"[red]Token TX error: {e}[/]")
        tokens = []

    # Alerts
    all_alerts = check_chain_alerts(chain, address, normal, tokens)
    if address.lower() == ACCUMULATOR.lower():
        all_alerts.extend(check_accumulator_alerts(chain, normal, internal))

    if all_alerts:
        console.print(Panel(
            "\n".join(all_alerts),
            title=f"⚡ ALERTS — {cfg['name']}",
            border_style="bold red",
        ))

    results["alerts"] = all_alerts
    return results


def monitor_accumulator(verbose: bool = True) -> dict:
    """🔴 CRITICAL — Monitor ONLY the accumulator wallet."""
    console.print(Panel(
        f"[bold red]Monitoring ACCUMULATOR wallet — $591K parked ETH[/]\n"
        f"Address: [cyan]{ACCUMULATOR}[/]\n"
        f"Status: ZERO outgoing TXs expected\n"
        f"[bold]If this wallet moves → DROP EVERYTHING[/]",
        title="🔴 CRITICAL TARGET",
        border_style="bold red",
    ))
    return monitor_chain("ethereum", ACCUMULATOR, verbose=verbose)


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Monitor EVM attacker wallets")
    parser.add_argument(
        "--chain", "-c",
        choices=["ethereum", "base", "bsc", "all"],
        default="all",
        help="Which chain to monitor (default: all)",
    )
    parser.add_argument(
        "--accumulator",
        action="store_true",
        help="Monitor ONLY the accumulator wallet (🔴 critical)",
    )
    parser.add_argument(
        "--watch", "-w",
        type=int,
        default=0,
        metavar="SECONDS",
        help="Poll interval in seconds (0 = one-shot)",
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Only print alerts",
    )
    args = parser.parse_args()

    console.print(Panel(
        f"[bold]blnd-huntr[/] — EVM Chain Monitor\n"
        f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
        title="🔭 EVM Monitor",
        border_style="blue",
    ))

    def do_check():
        if args.accumulator:
            return monitor_accumulator(verbose=not args.quiet)

        chains = ["ethereum", "base", "bsc"] if args.chain == "all" else [args.chain]
        all_results = {}
        for chain in chains:
            address = ACCUMULATOR if chain == "ethereum" else EVM_ATTACKER
            # Always check accumulator on ethereum
            if chain == "ethereum":
                monitor_accumulator(verbose=not args.quiet)
            result = monitor_chain(chain, EVM_ATTACKER, verbose=not args.quiet)
            all_results[chain] = result
        return all_results

    if args.watch > 0:
        console.print(f"[dim]Polling every {args.watch}s — Ctrl+C to stop[/]")
        while True:
            try:
                do_check()
                console.print(f"\n[dim]── Next check in {args.watch}s ──[/]\n")
                time.sleep(args.watch)
            except KeyboardInterrupt:
                console.print("\n[yellow]Stopped.[/]")
                break
    else:
        do_check()


if __name__ == "__main__":
    main()
