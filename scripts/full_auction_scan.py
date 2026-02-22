"""
full_auction_scan.py — Scan ONLY fill_auction events from the Blend Pool contract.

Filters Soroban RPC events by the 'fill_auction' topic to ensure we capture
ONLY actual auction fills, not supply/borrow/repay/withdraw/backstop operations.

fill_auction topic[0] base64: AAAADwAAAAxmaWxsX2F1Y3Rpb24=
"""
import requests
import json
import time
import sys
from collections import defaultdict

HORIZON = "https://horizon.stellar.org"
SOROBAN_RPC = "https://soroban-rpc.mainnet.stellar.gateway.fm"
BLEND_POOL = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS"
EXPLOIT_LEDGER = 61340408

# Base64-encoded ScVal for "fill_auction" function name
FILL_AUCTION_TOPIC = "AAAADwAAAAxmaWxsX2F1Y3Rpb24="

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def get_fill_auction_tx_hashes():
    """Get ONLY tx hashes that contain fill_auction events."""
    fill_hashes = set()
    all_events_count = 0
    fill_events_count = 0
    cursor = None
    page = 0
    
    # Also collect event metadata per tx for context
    tx_event_data = {}
    
    while page < 100:
        page += 1
        payload = {
            'jsonrpc': '2.0',
            'id': page,
            'method': 'getEvents',
            'params': {
                'filters': [{'type': 'contract', 'contractIds': [BLEND_POOL]}],
                'pagination': {'limit': 100}
            }
        }
        if cursor:
            payload['params']['pagination']['cursor'] = cursor
        else:
            payload['params']['startLedger'] = EXPLOIT_LEDGER
        
        resp = requests.post(SOROBAN_RPC, json=payload, timeout=30)
        data = resp.json()
        
        if 'error' in data:
            log(f"RPC error: {data['error']}")
            break
        
        events = data.get('result', {}).get('events', [])
        if not events:
            break
        
        for e in events:
            all_events_count += 1
            topics = e.get('topic', [])
            tx_hash = e.get('txHash', '')
            
            # Check if first topic matches fill_auction
            if topics and topics[0] == FILL_AUCTION_TOPIC:
                fill_events_count += 1
                fill_hashes.add(tx_hash)
                
                # Store auction type from topic[1] if available
                auction_type = topics[1] if len(topics) > 1 else 'unknown'
                tx_event_data[tx_hash] = {
                    'auction_type': auction_type,
                    'ledger': e.get('ledger', 0),
                }
        
        cursor = data.get('result', {}).get('cursor')
        if not cursor:
            break
        
        log(f"  Page {page}: {all_events_count} total events, {fill_events_count} fill_auction events, {len(fill_hashes)} unique fill txs")
        time.sleep(0.2)
    
    log(f"\n  Total events scanned: {all_events_count}")
    log(f"  fill_auction events: {fill_events_count}")
    log(f"  Unique fill txs: {len(fill_hashes)}")
    
    return fill_hashes, tx_event_data

def fetch_tx_effects(tx_hash):
    """Fetch tx details and effects from Horizon."""
    try:
        tx_resp = requests.get(f"{HORIZON}/transactions/{tx_hash}", timeout=15)
        if tx_resp.status_code != 200:
            return None, None
        tx = tx_resp.json()
        
        eff_resp = requests.get(f"{HORIZON}/transactions/{tx_hash}/effects?limit=50", timeout=15)
        if eff_resp.status_code != 200:
            return tx, []
        effects = eff_resp.json().get('_embedded', {}).get('records', [])
        
        return tx, effects
    except Exception:
        return None, None

def extract_asset_flows(source, effects):
    """Extract paid/received asset flows for the source account."""
    paid = {}
    received = {}
    
    for e in effects:
        etype = e.get('type', '')
        account = e.get('account', '')
        
        asset_code = e.get('asset_code', '')
        asset_type = e.get('asset_type', '')
        if asset_type == 'native':
            asset_code = 'XLM'
        elif not asset_code:
            continue
        
        amount = float(e.get('amount', 0))
        if amount == 0:
            continue
        
        if account == source:
            if etype in ('account_debited', 'trustline_debited'):
                paid[asset_code] = paid.get(asset_code, 0) + amount
            elif etype in ('account_credited', 'trustline_credited'):
                received[asset_code] = received.get(asset_code, 0) + amount
    
    return paid, received

def main():
    log("=" * 60)
    log("BLEND POOL fill_auction EVENT SCAN (v3 — verified)")
    log("=" * 60)
    
    # Step 1: Get ONLY fill_auction tx hashes
    log("\n[1/3] Filtering fill_auction events from Soroban RPC...")
    fill_hashes, event_data = get_fill_auction_tx_hashes()
    
    # Step 2: Fetch effects for each fill tx
    log(f"\n[2/3] Fetching effects for {len(fill_hashes)} verified fill_auction txs...")
    
    all_fills = []
    errors = 0
    
    for i, tx_hash in enumerate(sorted(fill_hashes)):
        if (i + 1) % 25 == 0:
            log(f"  Progress: {i+1}/{len(fill_hashes)} | errors: {errors}")
        
        tx, effects = fetch_tx_effects(tx_hash)
        if not tx:
            errors += 1
            continue
        
        source = tx.get('source_account', '')
        paid, received = extract_asset_flows(source, effects or [])
        
        fill = {
            'tx_hash': tx_hash,
            'source': source,
            'time': tx.get('created_at', ''),
            'ledger': tx.get('ledger', 0),
            'paid': paid,
            'received': received,
        }
        all_fills.append(fill)
        time.sleep(0.1)
    
    log(f"\n  Verified fills: {len(all_fills)}")
    log(f"  Errors: {errors}")
    
    # Step 3: Summary
    log(f"\n[3/3] Building summary...")
    
    by_account = defaultdict(list)
    for fill in all_fills:
        by_account[fill['source']].append(fill)
    
    log(f"\n{'='*60}")
    log(f"VERIFIED RESULTS: {len(all_fills)} fill_auction txs from {len(by_account)} accounts")
    log(f"{'='*60}")
    
    # Time range
    if all_fills:
        times = [f['time'] for f in all_fills if f['time']]
        log(f"  Time range: {min(times)} to {max(times)}")
    
    account_summaries = []
    for acct, fills in sorted(by_account.items(), key=lambda x: -len(x[1])):
        tp = defaultdict(float)
        tr = defaultdict(float)
        for f in fills:
            for a, v in f['paid'].items(): tp[a] += v
            for a, v in f['received'].items(): tr[a] += v
        
        summary = {
            'account': acct,
            'fill_count': len(fills),
            'total_paid': dict(tp),
            'total_received': dict(tr),
            'first_fill': min(f['time'] for f in fills),
            'last_fill': max(f['time'] for f in fills),
        }
        account_summaries.append(summary)
        
        paid_str = ", ".join(f"{v:,.2f} {k}" for k, v in sorted(tp.items(), key=lambda x: -x[1])) or "—"
        recv_str = ", ".join(f"{v:,.2f} {k}" for k, v in sorted(tr.items(), key=lambda x: -x[1])) or "—"
        log(f"\n  {acct}")
        log(f"    Fills: {len(fills)} | {fills[0]['time'][:10]} to {fills[-1]['time'][:10]}")
        log(f"    Paid: {paid_str}")
        log(f"    Recv: {recv_str}")
    
    # Global totals
    gp = defaultdict(float)
    gr = defaultdict(float)
    for f in all_fills:
        for a, v in f['paid'].items(): gp[a] += v
        for a, v in f['received'].items(): gr[a] += v
    
    log(f"\n{'='*60}")
    log("GLOBAL TOTALS (VERIFIED fill_auction ONLY)")
    log(f"{'='*60}")
    log("Paid (liabilities settled by liquidators):")
    for k, v in sorted(gp.items(), key=lambda x: -x[1]):
        log(f"  {k}: {v:,.2f}")
    log("Received (collateral claimed by liquidators):")
    for k, v in sorted(gr.items(), key=lambda x: -x[1]):
        log(f"  {k}: {v:,.2f}")
    log("\nNET (received - paid):")
    all_assets = sorted(set(list(gp.keys()) + list(gr.keys())))
    for asset in all_assets:
        net = gr.get(asset, 0) - gp.get(asset, 0)
        log(f"  {asset}: {net:+,.2f}")
    
    # JSON output
    output = {
        'scan_type': 'fill_auction_events_only',
        'total_fills': len(all_fills),
        'total_accounts': len(by_account),
        'account_summaries': account_summaries,
        'fills': all_fills,
        'global_paid': dict(gp),
        'global_received': dict(gr),
    }
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
