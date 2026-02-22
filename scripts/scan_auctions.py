"""
scan_auctions.py — Scan Horizon for ALL liquidation auction fills on the Blend Pool
after the exploit at ledger 61340408 (2026-02-22 00:24:27 UTC).

Strategy:
1. Query operations for both known liquidator accounts (GAPU4...XLIQ and GAIN2...YHNF)
2. Filter for invoke_host_function operations (Soroban calls to Blend Pool)
3. For each tx, fetch the full transaction to get details (memo, operations, effects)
4. Output a comprehensive CSV of all auction fills
"""

import requests
import json
import csv
import time
import sys
from datetime import datetime

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────
HORIZON = "https://horizon.stellar.org"
BLEND_POOL = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS"
EXPLOIT_TIME = "2026-02-22T00:24:27Z"
EXPLOIT_LEDGER = 61340408

LIQUIDATORS = {
    "GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ": "Primary (GAPU4...XLIQ)",
    "GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF": "Secondary (GAIN2...YHNF)",
}

# We'll also scan for other potential liquidators by looking at pool transactions
# But first, let's get what we know from the two known accounts

def fetch_all_operations(account, after_ledger=None):
    """Fetch all operations for an account, optionally after a given ledger."""
    operations = []
    url = f"{HORIZON}/accounts/{account}/transactions"
    params = {
        "limit": 200,
        "order": "asc",
    }
    
    page_count = 0
    while url:
        page_count += 1
        print(f"  Fetching page {page_count} for {account[:8]}...", file=sys.stderr)
        
        try:
            resp = requests.get(url, params=params if page_count == 1 else None, timeout=30)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  Error fetching: {e}", file=sys.stderr)
            break
        
        records = data.get("_embedded", {}).get("records", [])
        if not records:
            break
        
        for tx in records:
            ledger = tx.get("ledger", 0)
            created = tx.get("created_at", "")
            tx_hash = tx.get("hash", "")
            op_count = tx.get("operation_count", 0)
            successful = tx.get("successful", False)
            
            # Only include transactions after exploit
            if ledger < EXPLOIT_LEDGER:
                continue
            
            if successful:
                operations.append({
                    "tx_hash": tx_hash,
                    "ledger": ledger,
                    "created_at": created,
                    "operation_count": op_count,
                    "source_account": tx.get("source_account", ""),
                    "fee_charged": tx.get("fee_charged", ""),
                    "memo_type": tx.get("memo_type", ""),
                    "memo": tx.get("memo", ""),
                })
        
        # Next page
        next_link = data.get("_links", {}).get("next", {}).get("href", "")
        if next_link and records:
            url = next_link
            params = None
        else:
            break
        
        time.sleep(0.3)  # Rate limit
    
    return operations


def fetch_tx_operations(tx_hash):
    """Fetch operations for a specific transaction."""
    url = f"{HORIZON}/transactions/{tx_hash}/operations?limit=50"
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("_embedded", {}).get("records", [])
    except Exception as e:
        print(f"  Error fetching ops for {tx_hash[:12]}: {e}", file=sys.stderr)
        return []


def fetch_tx_effects(tx_hash):
    """Fetch effects for a specific transaction."""
    url = f"{HORIZON}/transactions/{tx_hash}/effects?limit=50"
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("_embedded", {}).get("records", [])
    except Exception as e:
        print(f"  Error fetching effects for {tx_hash[:12]}: {e}", file=sys.stderr)
        return []


def analyze_auction_tx(tx_info, operations, effects):
    """Analyze a transaction to determine if it's an auction fill and extract details."""
    is_soroban = False
    involves_blend = False
    
    for op in operations:
        if op.get("type") == "invoke_host_function":
            is_soroban = True
            # Check if it invokes the Blend Pool
            func = op.get("function", "")
            if BLEND_POOL in json.dumps(op):
                involves_blend = True
    
    # Parse effects for asset transfers
    payments = []
    for eff in effects:
        eff_type = eff.get("type", "")
        if eff_type in ["account_credited", "account_debited"]:
            payments.append({
                "type": eff_type,
                "asset_type": eff.get("asset_type", "native"),
                "asset_code": eff.get("asset_code", "XLM"),
                "asset_issuer": eff.get("asset_issuer", ""),
                "amount": eff.get("amount", "0"),
                "account": eff.get("account", ""),
            })
    
    return {
        "is_soroban": is_soroban,
        "involves_blend": involves_blend,
        "payments": payments,
    }


def main():
    all_auction_txs = []
    
    for account, label in LIQUIDATORS.items():
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"Scanning: {label}", file=sys.stderr)
        print(f"Account: {account}", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        
        txs = fetch_all_operations(account, EXPLOIT_LEDGER)
        print(f"  Found {len(txs)} transactions after exploit", file=sys.stderr)
        
        for i, tx in enumerate(txs):
            tx_hash = tx["tx_hash"]
            print(f"  [{i+1}/{len(txs)}] Analyzing {tx_hash[:16]}... (ledger {tx['ledger']})", file=sys.stderr)
            
            ops = fetch_tx_operations(tx_hash)
            effects = fetch_tx_effects(tx_hash)
            analysis = analyze_auction_tx(tx, ops, effects)
            
            # Summarize payments
            credits = {}
            debits = {}
            for p in analysis["payments"]:
                asset = p["asset_code"]
                amount = float(p["amount"])
                if p["type"] == "account_credited" and p["account"] == account:
                    credits[asset] = credits.get(asset, 0) + amount
                elif p["type"] == "account_debited" and p["account"] == account:
                    debits[asset] = debits.get(asset, 0) + amount
            
            result = {
                "tx_hash": tx_hash,
                "time": tx["created_at"],
                "ledger": tx["ledger"],
                "liquidator": label,
                "liquidator_address": account,
                "is_soroban": analysis["is_soroban"],
                "op_count": tx["operation_count"],
                "credits": json.dumps(credits) if credits else "",
                "debits": json.dumps(debits) if debits else "",
            }
            all_auction_txs.append(result)
            
            time.sleep(0.25)  # Rate limit
    
    # Output results
    print(f"\n\n{'='*60}", file=sys.stderr)
    print(f"RESULTS: {len(all_auction_txs)} total transactions found", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    
    # Write CSV
    output_file = "/home/bobbybones/src/git/bobbybones/blnd-huntr/data/auction_fills.csv"
    if all_auction_txs:
        fieldnames = ["tx_hash", "time", "ledger", "liquidator", "liquidator_address", 
                       "is_soroban", "op_count", "credits", "debits"]
        with open(output_file, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_auction_txs)
        print(f"\nCSV written to {output_file}", file=sys.stderr)
    
    # Also output JSON summary to stdout
    print(json.dumps(all_auction_txs, indent=2))


if __name__ == "__main__":
    main()
