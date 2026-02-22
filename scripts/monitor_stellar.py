#!/usr/bin/env python3
"""
blnd-huntr/scripts/monitor_stellar.py
──────────────────────────────────────
Monitors the Stellar attacker wallet for new activity.

Checks:
  1. Current XLM balance
  2. Latest operations (payments, path payments, manage offers, invocations)
  3. New swap_and_bridge calls (Allbridge outbound)
  4. Any new trustlines or offer changes

Usage:
  python scripts/monitor_stellar.py                  # one-shot check
  python scripts/monitor_stellar.py --watch 60       # poll every 60s
  python scripts/monitor_stellar.py --address <addr> # override address
"""

import argparse
import json
import sys
import time
from datetime import datetime, timezone

import requests
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from config import (
    ATTACKER,
    BLEND_POOL,
    COUNTERPARTY,
    EXPLOIT_LEDGER,
    HORIZON_BASE,
    STELLAR_EXPERT_ACCOUNT,
    STELLAR_EXPERT_TX,
)

console = Console()

# ──────────────────────────────────────────────
# Horizon Helpers
# ──────────────────────────────────────────────

def horizon_get(path: str, params: dict | None = None) -> dict:
    """Make a GET request to Horizon."""
    url = f"{HORIZON_BASE}{path}"
    resp = requests.get(url, params=params or {}, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_account(address: str) -> dict:
    """Fetch account details (balances, sequence, etc.)."""
    return horizon_get(f"/accounts/{address}")


def get_operations(address: str, limit: int = 25, order: str = "desc") -> list[dict]:
    """Fetch recent operations for an account."""
    data = horizon_get(f"/accounts/{address}/operations", {
        "limit": limit,
        "order": order,
    })
    return data.get("_embedded", {}).get("records", [])


def get_payments(address: str, limit: int = 25, order: str = "desc") -> list[dict]:
    """Fetch recent payments for an account."""
    data = horizon_get(f"/accounts/{address}/payments", {
        "limit": limit,
        "order": order,
    })
    return data.get("_embedded", {}).get("records", [])


def get_trades(address: str, limit: int = 25, order: str = "desc") -> list[dict]:
    """Fetch recent trades for an account."""
    data = horizon_get(f"/accounts/{address}/trades", {
        "limit": limit,
        "order": order,
    })
    return data.get("_embedded", {}).get("records", [])


# ──────────────────────────────────────────────
# Display Functions
# ──────────────────────────────────────────────

def display_balances(account_data: dict, address: str):
    """Pretty-print account balances."""
    table = Table(title=f"💰 Balances — {address[:12]}...{address[-4:]}")
    table.add_column("Asset", style="cyan", no_wrap=True)
    table.add_column("Balance", style="green", justify="right")
    table.add_column("Type", style="dim")

    for bal in account_data.get("balances", []):
        asset_type = bal.get("asset_type", "native")
        if asset_type == "native":
            asset_name = "XLM"
        else:
            code = bal.get("asset_code", "?")
            issuer = bal.get("asset_issuer", "")
            asset_name = f"{code} ({issuer[:8]}...)"

        balance = float(bal.get("balance", 0))
        table.add_row(asset_name, f"{balance:,.4f}", asset_type)

    console.print(table)

    # Highlight XLM balance
    xlm_balance = next(
        (float(b["balance"]) for b in account_data["balances"] if b["asset_type"] == "native"),
        0.0,
    )
    if xlm_balance > 1_000_000:
        console.print(
            Panel(
                f"[bold yellow]⚠️  {xlm_balance:,.2f} XLM still in wallet (~${xlm_balance * 0.155:,.0f} USD est.)[/]",
                title="🟡 Large XLM Balance",
                border_style="yellow",
            )
        )


def display_operations(operations: list[dict]):
    """Pretty-print recent operations."""
    if not operations:
        console.print("[dim]No operations found.[/]")
        return

    table = Table(title="📋 Recent Operations")
    table.add_column("Time (UTC)", style="cyan", no_wrap=True)
    table.add_column("Type", style="magenta")
    table.add_column("Details", style="white", max_width=60)
    table.add_column("TX Hash", style="dim", max_width=16)

    for op in operations:
        op_type = op.get("type", "unknown")
        created = op.get("created_at", "?")[:19]
        tx_hash = op.get("transaction_hash", "?")[:16]

        details = _format_op_details(op)

        # Highlight invoke_host_function calls (potential swap_and_bridge)
        style = "bold red" if op_type == "invoke_host_function" else ""
        table.add_row(created, op_type, details, tx_hash, style=style)

    console.print(table)


def _format_op_details(op: dict) -> str:
    """Extract meaningful details from an operation."""
    op_type = op.get("type", "")

    if op_type == "payment":
        amount = op.get("amount", "?")
        asset_code = op.get("asset_code", "XLM")
        to = op.get("to", "?")
        return f"{amount} {asset_code} → {to[:12]}..."

    elif op_type == "create_account":
        account = op.get("account", "?")
        balance = op.get("starting_balance", "?")
        return f"Created {account[:12]}... with {balance} XLM"

    elif op_type in ("manage_sell_offer", "manage_buy_offer"):
        selling = op.get("selling", {}).get("asset_code", "XLM")
        buying = op.get("buying", {}).get("asset_code", "XLM")
        amount = op.get("amount", "?")
        price = op.get("price", "?")
        return f"Sell {amount} {selling} for {buying} @ {price}"

    elif op_type == "invoke_host_function":
        function = op.get("function", "?")
        return f"⚡ Soroban: {function}"

    elif op_type == "change_trust":
        asset_code = op.get("asset_code", "?")
        asset_issuer = op.get("asset_issuer", "?")[:12]
        return f"Trustline: {asset_code} ({asset_issuer}...)"

    elif op_type == "path_payment_strict_send":
        amount = op.get("amount", "?")
        source_amount = op.get("source_amount", "?")
        asset_code = op.get("asset_code", "XLM")
        source_asset = op.get("source_asset_code", "XLM")
        return f"Path: {source_amount} {source_asset} → {amount} {asset_code}"

    elif op_type == "account_merge":
        into = op.get("into", "?")
        return f"Merged into {into[:12]}..."

    return json.dumps({k: v for k, v in op.items() if k not in ("_links",)}, default=str)[:60]


def display_trades(trades: list[dict]):
    """Pretty-print recent trades."""
    if not trades:
        console.print("[dim]No recent trades.[/]")
        return

    table = Table(title="📊 Recent Trades")
    table.add_column("Time", style="cyan", no_wrap=True)
    table.add_column("Sold", style="red")
    table.add_column("Bought", style="green")
    table.add_column("Price", style="yellow")

    for trade in trades:
        created = trade.get("ledger_close_time", "?")[:19]
        base_amount = trade.get("base_amount", "?")
        base_asset = trade.get("base_asset_code", "XLM")
        counter_amount = trade.get("counter_amount", "?")
        counter_asset = trade.get("counter_asset_code", "XLM")

        if trade.get("base_is_seller"):
            sold = f"{base_amount} {base_asset}"
            bought = f"{counter_amount} {counter_asset}"
        else:
            sold = f"{counter_amount} {counter_asset}"
            bought = f"{base_amount} {base_asset}"

        price = trade.get("price", {})
        price_str = f"{price.get('n', '?')}/{price.get('d', '?')}"

        table.add_row(created, sold, bought, price_str)

    console.print(table)


# ──────────────────────────────────────────────
# Alert Logic
# ──────────────────────────────────────────────

def check_for_alerts(operations: list[dict], known_last_op: str | None) -> list[str]:
    """
    Scan operations and return alert strings for suspicious activity.
    """
    alerts = []
    for op in operations:
        op_id = op.get("id", "")
        if known_last_op and op_id == known_last_op:
            break  # Already seen

        op_type = op.get("type", "")

        # 🔴 Soroban invocations → possible swap_and_bridge
        if op_type == "invoke_host_function":
            tx_hash = op.get("transaction_hash", "?")
            alerts.append(
                f"🔴 SOROBAN INVOCATION detected! TX: {tx_hash[:16]}... "
                f"— Check for swap_and_bridge (Allbridge outbound)"
            )

        # 🟡 Large XLM payment outgoing
        elif op_type == "payment":
            amount = float(op.get("amount", 0))
            source = op.get("source_account", "")
            if amount > 100_000:
                to = op.get("to", "?")
                asset = op.get("asset_code", "XLM")
                alerts.append(
                    f"🟡 LARGE PAYMENT: {amount:,.2f} {asset} → {to[:16]}..."
                )

        # 🟠 New trustlines
        elif op_type == "change_trust":
            asset_code = op.get("asset_code", "?")
            alerts.append(f"🟠 NEW TRUSTLINE: {asset_code}")

    return alerts


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def run_check(address: str, verbose: bool = True) -> dict:
    """Run a single monitoring check and return results."""
    results = {}

    # 1. Account info
    try:
        account = get_account(address)
        if verbose:
            display_balances(account, address)
        results["balances"] = account.get("balances", [])
        results["sequence"] = account.get("sequence", "?")
    except requests.HTTPError as e:
        console.print(f"[red]❌ Failed to fetch account: {e}[/]")
        return results

    # 2. Recent operations
    try:
        ops = get_operations(address, limit=15)
        if verbose:
            display_operations(ops)
        results["operations"] = ops
    except requests.HTTPError as e:
        console.print(f"[red]❌ Failed to fetch operations: {e}[/]")

    # 3. Recent trades
    try:
        trades = get_trades(address, limit=10)
        if verbose:
            display_trades(trades)
        results["trades"] = trades
    except requests.HTTPError as e:
        console.print(f"[red]❌ Failed to fetch trades: {e}[/]")

    # 4. Alerts
    alerts = check_for_alerts(results.get("operations", []), None)
    if alerts:
        console.print()
        console.print(Panel(
            "\n".join(alerts),
            title="⚡ ALERTS",
            border_style="bold red",
        ))
    results["alerts"] = alerts

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Monitor Stellar attacker wallet for new activity",
    )
    parser.add_argument(
        "--address", "-a",
        default=ATTACKER,
        help=f"Stellar address to monitor (default: attacker {ATTACKER[:12]}...)",
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
        help="Only print alerts, not full tables",
    )
    args = parser.parse_args()

    console.print(Panel(
        f"[bold]blnd-huntr[/] — Stellar Monitor\n"
        f"Target: [cyan]{args.address}[/]\n"
        f"Explorer: [link]{STELLAR_EXPERT_ACCOUNT}{args.address}[/link]\n"
        f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
        title="🔭 Stellar Monitor",
        border_style="blue",
    ))

    if args.watch > 0:
        console.print(f"[dim]Polling every {args.watch}s — Ctrl+C to stop[/]\n")
        last_op_id = None
        while True:
            try:
                results = run_check(args.address, verbose=not args.quiet)
                ops = results.get("operations", [])
                if ops:
                    last_op_id = ops[0].get("id")
                console.print(f"\n[dim]── Next check in {args.watch}s ──[/]\n")
                time.sleep(args.watch)
            except KeyboardInterrupt:
                console.print("\n[yellow]Stopped.[/]")
                break
    else:
        run_check(args.address, verbose=not args.quiet)


if __name__ == "__main__":
    main()
