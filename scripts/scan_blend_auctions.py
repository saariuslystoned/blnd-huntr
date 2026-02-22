"""
scan_blend_auctions.py — Focused scan for Blend Pool auction fills
Queries Horizon for both liquidator accounts, finds all invoke_host_function
operations (Soroban calls) after the exploit, and extracts asset flow details.
"""

import requests
import json
import time
import sys

HORIZON = "https://horizon.stellar.org"
BLEND_POOL = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS"
EXPLOIT_TIME = "2026-02-22T00:24:27Z"

ACCOUNTS = [
    ("GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ", "Primary (GAPU4...XLIQ)"),
    ("GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF", "Secondary (GAIN2...YHNF)"),
]


def get_all_txs(account):
    """Get ALL transactions for an account, paginated."""
    txs = []
    url = f"{HORIZON}/accounts/{account}/transactions"
    params = {"limit": 200, "order": "desc"}  # Start from most recent
    
    while url:
        try:
            resp = requests.get(url, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  Error: {e}", file=sys.stderr)
            break
        
        records = data.get("_embedded", {}).get("records", [])
        if not records:
            break
        
        for tx in records:
            created = tx.get("created_at", "")
            # Only include txs after exploit
            if created >= EXPLOIT_TIME:
                txs.append(tx)
            else:
                # We've gone past the exploit time, stop
                return txs
        
        # Get next page
        next_link = data.get("_links", {}).get("next", {}).get("href", "")
        if next_link and len(records) == 200:
            url = next_link
            params = None
        else:
            break
        
        time.sleep(0.3)
    
    return txs


def get_tx_effects(tx_hash):
    """Get all effects for a transaction."""
    url = f"{HORIZON}/transactions/{tx_hash}/effects?limit=100"
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return resp.json().get("_embedded", {}).get("records", [])
    except:
        return []


def get_tx_operations(tx_hash):
    """Get all operations for a transaction."""
    url = f"{HORIZON}/transactions/{tx_hash}/operations?limit=100"
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return resp.json().get("_embedded", {}).get("records", [])
    except:
        return []


def analyze_effects(effects, account):
    """Extract payment flows from effects."""
    paid = {}  # What liquidator sent (debits)
    received = {}  # What liquidator received (credits)
    involves_blend = False
    
    for eff in effects:
        etype = eff.get("type", "")
        asset = eff.get("asset_code", "XLM") if eff.get("asset_type") != "native" else "XLM"
        amount = float(eff.get("amount", 0))
        contract = eff.get("contract", "")
        acct = eff.get("account", "")
        
        if contract == BLEND_POOL:
            involves_blend = True
        
        # Debits from liquidator account (payments to pool)
        if etype == "account_debited" and acct == account:
            paid[asset] = paid.get(asset, 0) + amount
        elif etype == "contract_credited" and contract == BLEND_POOL:
            # This confirms payment TO the Blend Pool
            involves_blend = True
        
        # Credits to liquidator account (received from pool)
        if etype == "account_credited" and acct == account:
            received[asset] = received.get(asset, 0) + amount
        elif etype == "contract_debited" and contract == BLEND_POOL and acct == account:
            received[asset] = received.get(asset, 0) + amount
    
    return paid, received, involves_blend


def main():
    all_auctions = []
    
    for account, label in ACCOUNTS:
        print(f"\n{'='*70}", file=sys.stderr)
        print(f"Scanning: {label} ({account})", file=sys.stderr)
        print(f"{'='*70}", file=sys.stderr)
        
        txs = get_all_txs(account)
        print(f"  Found {len(txs)} transactions after exploit", file=sys.stderr)
        
        # Filter for Soroban calls (invoke_host_function)
        soroban_txs = []
        for tx in txs:
            op_count = tx.get("operation_count", 0)
            tx_hash = tx.get("hash", "")
            # Check operations
            ops = get_tx_operations(tx_hash)
            is_soroban = any(op.get("type") == "invoke_host_function" for op in ops)
            
            if is_soroban:
                soroban_txs.append(tx)
                print(f"  ✓ Soroban TX: {tx_hash[:16]}... @ {tx.get('created_at', '')}", file=sys.stderr)
            
            time.sleep(0.15)
        
        print(f"  Found {len(soroban_txs)} Soroban transactions", file=sys.stderr)
        
        # Analyze each Soroban tx
        for tx in soroban_txs:
            tx_hash = tx["hash"]
            effects = get_tx_effects(tx_hash)
            paid, received, involves_blend = analyze_effects(effects, account)
            
            if involves_blend or paid or received:
                auction = {
                    "tx_hash": tx_hash,
                    "time": tx.get("created_at", ""),
                    "ledger": tx.get("ledger", 0),
                    "liquidator": label,
                    "paid": paid,
                    "received": received,
                    "involves_blend_pool": involves_blend,
                }
                all_auctions.append(auction)
                
                paid_str = ", ".join(f"{v:,.2f} {k}" for k, v in paid.items())
                recv_str = ", ".join(f"{v:,.2f} {k}" for k, v in received.items())
                print(f"    📋 Paid: {paid_str or 'N/A'}", file=sys.stderr)
                print(f"    📋 Received: {recv_str or 'N/A'}", file=sys.stderr)
            
            time.sleep(0.2)
    
    # Output final results
    print(f"\n\n{'='*70}", file=sys.stderr)
    print(f"TOTAL BLEND POOL AUCTION FILLS: {len(all_auctions)}", file=sys.stderr)
    print(f"{'='*70}", file=sys.stderr)
    
    # Summary
    total_paid_usd = 0
    total_received_xlm = 0
    for a in all_auctions:
        for asset, amount in a["paid"].items():
            if asset in ("USDC", "EURC"):
                total_paid_usd += amount
            elif asset == "USTRY":
                total_paid_usd += amount * 1.06
        for asset, amount in a["received"].items():
            if asset == "XLM":
                total_received_xlm += amount
    
    print(f"Total liabilities paid: ~${total_paid_usd:,.0f} USD equivalent", file=sys.stderr)
    print(f"Total XLM received: {total_received_xlm:,.0f} XLM", file=sys.stderr)
    
    # Output JSON
    print(json.dumps(all_auctions, indent=2, default=str))


if __name__ == "__main__":
    main()
