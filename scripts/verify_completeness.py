"""
scan_contract_calls.py — Scan every transaction that touched the Blend Pool contract
after the exploit ledger to find all liquidators.
"""
import requests
import json
import time

HORIZON = "https://horizon.stellar.org"
BLEND_POOL = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS"
EXPLOIT_LEDGER = 61340408

def main():
    liquidators = set()
    all_fill_txs = []
    
    url = f"{HORIZON}/accounts/{BLEND_POOL}/transactions"
    params = {"limit": 200, "order": "asc", "cursor": f"{EXPLOIT_LEDGER*4294967296}"}
    
    print(f"Scanning all transactions for contract {BLEND_POOL} after ledger {EXPLOIT_LEDGER}...")
    
    while url:
        resp = requests.get(url, params=params if params else None).json()
        records = resp.get("_embedded", {}).get("records", [])
        if not records:
            break
            
        for tx in records:
            if tx['ledger'] < EXPLOIT_LEDGER:
                continue
            
            tx_hash = tx['hash']
            # Fetch operations to find the actual contract call and source
            op_resp = requests.get(f"{HORIZON}/transactions/{tx_hash}/operations").json()
            ops = op_resp.get("_embedded", {}).get("records", [])
            
            for op in ops:
                if op.get("type") == "invoke_host_function":
                    source = op.get("source_account") or tx.get("source_account")
                    liquidators.add(source)
                    all_fill_txs.append({
                        "hash": tx_hash,
                        "ledger": tx['ledger'],
                        "source": source,
                        "time": tx['created_at']
                    })
        
        url = resp.get("_links", {}).get("next", {}).get("href")
        params = None
        time.sleep(0.2)

    print(f"\nFound {len(all_fill_txs)} contract interactions.")
    print(f"Unique accounts interacting with Blend Pool: {liquidators}")

if __name__ == "__main__":
    main()
