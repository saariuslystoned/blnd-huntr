#!/usr/bin/env python3
"""
blnd-huntr/scripts/fund_flow.py
───────────────────────────────
Generates a cross-chain fund flow report for the Blend Protocol exploit.

Queries:
  - Stellar Horizon API for live attacker XLM balance
  - EVM scanner APIs (if keys available) for chain balances
  - Hardcoded known values from README for auction/bridge totals

Usage:
  python scripts/fund_flow.py            # full report (markdown table)
  python scripts/fund_flow.py --json     # JSON output
  python scripts/fund_flow.py --brief    # short summary only
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from decimal import Decimal

import requests
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

from config import (
    ATTACKER,
    ACCUMULATOR,
    EVM_ATTACKER,
    EVM_CHAINS,
    HORIZON_BASE,
    STELLAR_EXPERT_ACCOUNT,
    XLM_BORROWED,
    ESTIMATED_STOLEN_USD,
)

console = Console()

# ──────────────────────────────────────────────
# Known Values (from README — hardcoded reference data)
# ──────────────────────────────────────────────

# XLM/USD estimate (update as needed)
XLM_USD_ESTIMATE = 0.155

# Known bridged amounts (USD estimates from README)
KNOWN_BRIDGED = {
    "Base":     {"usd": 787_000, "detail": "~$787K USDC via Allbridge, swapped via UniswapX"},
    "Ethereum": {"usd": 172_000, "detail": "~$172K USDC via Allbridge, swapped to ETH"},
    "BSC":      {"usd": 38_700,  "detail": "~$38.7K USDC via Allbridge, UNTOUCHED"},
}

# Known accumulator wallet
ACCUMULATOR_DATA = {
    "address": ACCUMULATOR,
    "chain": "Ethereum",
    "usd": 591_808,
    "detail": "$591K in ETH — ZERO outgoing TXs, DORMANT",
}

# Known liquidation auction fills (from README)
KNOWN_AUCTIONS = [
    {"tx": "940b307a...", "liquidator": "GAPU4...XLIQ", "assets_paid": "227,088 USDC + 305 USTRY",      "est_usd": 227_000},
    {"tx": "b41d2f91...", "liquidator": "GAPU4...XLIQ", "assets_paid": "USDC + USTRY → 6.28M XLM",      "est_usd": 975_000},
    {"tx": "51e55f2f...", "liquidator": "GAPU4...XLIQ", "assets_paid": "USDC + USTRY → 2.41M XLM",      "est_usd": 374_000},
    {"tx": "cca341ab...", "liquidator": "GAIN2...YHNF", "assets_paid": "USDC + USTRY → 1.30M XLM",      "est_usd": 203_000},
    {"tx": "97d8d6f1...", "liquidator": "GAPU4...XLIQ", "assets_paid": "8,270 EURC",                    "est_usd": 8_300},
    {"tx": "38af1c6c...", "liquidator": "GAPU4...XLIQ", "assets_paid": "4,064 EURC",                    "est_usd": 4_100},
    {"tx": "d4b45c17...", "liquidator": "GAPU4...XLIQ", "assets_paid": "submit → 5,000,000 XLM",        "est_usd": 776_000},
]


# ──────────────────────────────────────────────
# Live Data Fetchers
# ──────────────────────────────────────────────

def fetch_stellar_balance(address: str) -> dict:
    """Fetch live XLM balance from Horizon."""
    try:
        resp = requests.get(f"{HORIZON_BASE}/accounts/{address}", timeout=15)
        resp.raise_for_status()
        data = resp.json()

        balances = {}
        for bal in data.get("balances", []):
            if bal["asset_type"] == "native":
                balances["XLM"] = float(bal["balance"])
            else:
                code = bal.get("asset_code", "?")
                balances[code] = float(bal["balance"])

        return {"success": True, "balances": balances, "sequence": data.get("sequence")}

    except requests.RequestException as e:
        return {"success": False, "error": str(e)}


def fetch_evm_balance(chain: str, address: str) -> dict:
    """Fetch native balance from an EVM chain."""
    chain_config = EVM_CHAINS.get(chain)
    if not chain_config:
        return {"success": False, "error": f"Unknown chain: {chain}"}

    params = {
        "module": "account",
        "action": "balance",
        "address": address,
        "tag": "latest",
    }
    if chain_config["key"]:
        params["apikey"] = chain_config["key"]

    try:
        resp = requests.get(chain_config["api"], params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") == "1":
            wei = int(data["result"])
            eth_balance = wei / 1e18
            return {"success": True, "balance": eth_balance}
        else:
            return {"success": False, "error": data.get("result", "API error")}

    except requests.RequestException as e:
        return {"success": False, "error": str(e)}


def fetch_evm_token_balance(chain: str, address: str, contract: str, decimals: int = 6) -> dict:
    """Fetch ERC-20 token balance from an EVM chain."""
    chain_config = EVM_CHAINS.get(chain)
    if not chain_config:
        return {"success": False, "error": f"Unknown chain: {chain}"}

    params = {
        "module": "account",
        "action": "tokenbalance",
        "contractaddress": contract,
        "address": address,
        "tag": "latest",
    }
    if chain_config["key"]:
        params["apikey"] = chain_config["key"]

    try:
        resp = requests.get(chain_config["api"], params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") == "1":
            raw = int(data["result"])
            balance = raw / (10 ** decimals)
            return {"success": True, "balance": balance}
        else:
            return {"success": False, "error": data.get("result", "API error")}

    except requests.RequestException as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────
# Report Generation
# ──────────────────────────────────────────────

def generate_report(fetch_live: bool = True) -> dict:
    """
    Generate a comprehensive fund flow report.
    Returns a structured dict with all data.
    """
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "exploit": {
            "xlm_borrowed": XLM_BORROWED,
            "xlm_borrowed_usd": XLM_BORROWED * XLM_USD_ESTIMATE,
            "estimated_total_usd": ESTIMATED_STOLEN_USD,
        },
        "stellar": {},
        "evm": {},
        "auctions": {},
        "summary": {},
    }

    # ── Stellar live balance ──
    if fetch_live:
        stellar_data = fetch_stellar_balance(ATTACKER)
        if stellar_data["success"]:
            xlm_bal = stellar_data["balances"].get("XLM", 0)
            report["stellar"] = {
                "xlm_balance": xlm_bal,
                "xlm_usd_est": xlm_bal * XLM_USD_ESTIMATE,
                "all_balances": stellar_data["balances"],
                "live": True,
            }
        else:
            report["stellar"] = {
                "xlm_balance": 45_068_274,  # fallback from README
                "xlm_usd_est": 45_068_274 * XLM_USD_ESTIMATE,
                "live": False,
                "error": stellar_data.get("error"),
            }
    else:
        report["stellar"] = {
            "xlm_balance": 45_068_274,
            "xlm_usd_est": 45_068_274 * XLM_USD_ESTIMATE,
            "live": False,
        }

    # ── EVM balances ──
    evm_data = {}

    # Accumulator (Ethereum)
    if fetch_live:
        acc_bal = fetch_evm_balance("ethereum", ACCUMULATOR)
        evm_data["accumulator"] = {
            "address": ACCUMULATOR,
            "chain": "Ethereum",
            "balance_eth": acc_bal.get("balance", 0) if acc_bal["success"] else None,
            "usd_estimate": ACCUMULATOR_DATA["usd"],  # use known value
            "status": "DORMANT",
            "live": acc_bal["success"],
        }
    else:
        evm_data["accumulator"] = {
            "address": ACCUMULATOR,
            "chain": "Ethereum",
            "balance_eth": None,
            "usd_estimate": ACCUMULATOR_DATA["usd"],
            "status": "DORMANT",
            "live": False,
        }

    # BSC
    evm_data["bsc"] = {
        "address": EVM_ATTACKER,
        "chain": "BSC",
        "usdc_balance": 38_746.50,  # from README
        "status": "UNTOUCHED",
    }

    # Base
    evm_data["base"] = {
        "address": EVM_ATTACKER,
        "chain": "Base",
        "usd_bridged": KNOWN_BRIDGED["Base"]["usd"],
        "status": "ACTIVE (UniswapX swaps)",
    }

    report["evm"] = evm_data

    # ── Auctions ──
    total_auction_usd = sum(a["est_usd"] for a in KNOWN_AUCTIONS)
    report["auctions"] = {
        "fills": KNOWN_AUCTIONS,
        "total_usd": total_auction_usd,
        "note": "INCOMPLETE — more auctions likely exist",
    }

    # ── Summary ──
    total_bridged = sum(b["usd"] for b in KNOWN_BRIDGED.values())
    xlm_on_stellar_usd = report["stellar"]["xlm_usd_est"]
    accumulator_usd = ACCUMULATOR_DATA["usd"]

    total_tracked = xlm_on_stellar_usd + total_bridged + accumulator_usd
    unaccounted = ESTIMATED_STOLEN_USD - total_tracked

    report["summary"] = {
        "total_stolen_est": ESTIMATED_STOLEN_USD,
        "xlm_on_stellar_usd": xlm_on_stellar_usd,
        "total_bridged_usd": total_bridged,
        "accumulator_usd": accumulator_usd,
        "total_tracked_usd": total_tracked,
        "unaccounted_usd": unaccounted,
        "total_auction_usd": total_auction_usd,
        "xlm_usd_rate": XLM_USD_ESTIMATE,
    }

    return report


# ──────────────────────────────────────────────
# Display
# ──────────────────────────────────────────────

def display_report(report: dict):
    """Pretty-print the fund flow report."""
    console.print(Panel(
        f"[bold]blnd-huntr[/] — Cross-Chain Fund Flow Report\n"
        f"Generated: {report['timestamp']}\n"
        f"XLM/USD Rate: ${report['summary']['xlm_usd_rate']}",
        title="💸 Fund Flow Report",
        border_style="cyan",
    ))

    # ── Exploit Overview ──
    exploit = report["exploit"]
    console.print(Panel(
        f"XLM Borrowed: [bold red]{exploit['xlm_borrowed']:,.1f} XLM[/] (~${exploit['xlm_borrowed_usd']:,.0f})\n"
        f"Estimated Total Stolen: [bold red]~${exploit['estimated_total_usd']:,.0f}[/]\n"
        f"Recovered: [bold red]$0[/]",
        title="⚡ Exploit",
        border_style="red",
    ))

    # ── Fund Distribution Table ──
    table = Table(
        title="📊 Current Fund Distribution",
        box=box.DOUBLE_EDGE,
        show_lines=True,
    )
    table.add_column("Location", style="cyan", no_wrap=True)
    table.add_column("Amount", style="white", justify="right")
    table.add_column("USD Estimate", style="green", justify="right")
    table.add_column("Status", style="yellow")

    summary = report["summary"]
    stellar = report["stellar"]

    # Stellar
    live_tag = " 🔴" if stellar.get("live") else " (cached)"
    table.add_row(
        "🟡 Stellar (XLM)",
        f"{stellar['xlm_balance']:,.1f} XLM",
        f"${stellar['xlm_usd_est']:,.0f}",
        f"HOLDING{live_tag}",
    )

    # Base
    table.add_row(
        "   → Base",
        "Swapped via UniswapX",
        f"${KNOWN_BRIDGED['Base']['usd']:,.0f}",
        "ACTIVE",
    )

    # Ethereum (bridged portion)
    table.add_row(
        "   → Ethereum",
        "Bridged USDC → ETH",
        f"${KNOWN_BRIDGED['Ethereum']['usd']:,.0f}",
        "SWAPPED",
    )

    # Accumulator
    table.add_row(
        "🔴 Accumulator (ETH)",
        f"~{report['evm']['accumulator'].get('balance_eth', '?')} ETH" if report['evm']['accumulator'].get('balance_eth') else "~ETH (no API key)",
        f"[bold red]${ACCUMULATOR_DATA['usd']:,.0f}[/]",
        "[bold red]DORMANT — 0 OUTGOING[/]",
    )

    # BSC
    table.add_row(
        "🟠 BSC (USDC)",
        f"{report['evm']['bsc']['usdc_balance']:,.2f} USDC",
        f"${KNOWN_BRIDGED['BSC']['usd']:,.0f}",
        "UNTOUCHED",
    )

    table.add_section()

    # Totals
    table.add_row(
        "[bold]Total Tracked[/]",
        "",
        f"[bold]${summary['total_tracked_usd']:,.0f}[/]",
        "",
    )
    table.add_row(
        "[bold]Estimated Stolen[/]",
        "",
        f"[bold]~${summary['total_stolen_est']:,.0f}[/]",
        "",
    )
    table.add_row(
        "[bold yellow]Unaccounted[/]",
        "",
        f"[bold yellow]${summary['unaccounted_usd']:,.0f}[/]",
        "[yellow]Likely swapped/moved via intermediaries[/]",
    )

    console.print(table)

    # ── Liquidation Auctions ──
    auctions = report["auctions"]
    auction_table = Table(
        title=f"⚖️  Liquidation Auctions (Total: ~${auctions['total_usd']:,.0f})",
        box=box.SIMPLE,
    )
    auction_table.add_column("TX", style="dim", max_width=14)
    auction_table.add_column("Liquidator", style="cyan")
    auction_table.add_column("Assets Paid", style="white", max_width=35)
    auction_table.add_column("Est. Value", style="green", justify="right")

    for a in auctions["fills"]:
        auction_table.add_row(
            a["tx"],
            a["liquidator"],
            a["assets_paid"],
            f"${a['est_usd']:,.0f}",
        )

    console.print(auction_table)
    console.print(f"[dim]⚠️  {auctions['note']}[/]\n")

    # ── Flow Summary ──
    console.print(Panel(
        f"[bold]Fund Flow:[/]\n\n"
        f"  61.2M XLM stolen\n"
        f"    ├─ ~45M XLM still on Stellar ──── [yellow]${stellar['xlm_usd_est']:,.0f}[/]\n"
        f"    ├─ ~$787K bridged to Base ──────── [green]swapped via UniswapX[/]\n"
        f"    ├─ ~$172K bridged to Ethereum ──── [green]swapped to ETH[/]\n"
        f"    │   └─ $591K in Accumulator ────── [red]DORMANT (!!)[/]\n"
        f"    ├─ ~$38.7K bridged to BSC ──────── [yellow]UNTOUCHED[/]\n"
        f"    └─ ~${summary['unaccounted_usd']:,.0f} unaccounted ────── [dim]intermediaries/swaps[/]\n",
        title="🌊 Flow Diagram",
        border_style="cyan",
    ))


def display_brief(report: dict):
    """Short summary output."""
    s = report["summary"]
    st = report["stellar"]

    console.print(f"\n[bold cyan]blnd-huntr Fund Flow Brief[/] ({report['timestamp'][:10]})\n")
    console.print(f"  Stolen:      ~${s['total_stolen_est']:,.0f}")
    console.print(f"  On Stellar:  {st['xlm_balance']:,.0f} XLM (~${st['xlm_usd_est']:,.0f})")
    console.print(f"  Bridged:     ${s['total_bridged_usd']:,.0f} (Base + ETH + BSC)")
    console.print(f"  Accumulator: [red]${s['accumulator_usd']:,.0f} DORMANT[/]")
    console.print(f"  Auctions:    ${s['total_auction_usd']:,.0f} (7 confirmed fills)")
    console.print(f"  Unaccounted: [yellow]${s['unaccounted_usd']:,.0f}[/]")
    console.print(f"  Recovered:   [red]$0[/]\n")


def output_markdown(report: dict):
    """Output as markdown table (for pasting into README)."""
    s = report["summary"]
    st = report["stellar"]

    print(f"\n## Fund Flow Summary (as of {report['timestamp'][:10]})")
    print(f"\n*XLM/USD rate: ${s['xlm_usd_rate']}*\n")
    print("| Location | Amount | Est. USD | Status |")
    print("|----------|--------|----------|--------|")
    print(f"| Stellar (Attacker) | {st['xlm_balance']:,.1f} XLM | ${st['xlm_usd_est']:,.0f} | Holding |")
    print(f"| Base (Bridged) | USDC → ETH/WETH | ${KNOWN_BRIDGED['Base']['usd']:,.0f} | Swapped |")
    print(f"| Ethereum (Bridged) | USDC → ETH | ${KNOWN_BRIDGED['Ethereum']['usd']:,.0f} | Swapped |")
    print(f"| **Accumulator** | ETH | **${ACCUMULATOR_DATA['usd']:,.0f}** | **DORMANT** |")
    print(f"| BSC | 38,746 USDC | ${KNOWN_BRIDGED['BSC']['usd']:,.0f} | Untouched |")
    print(f"| **Total Tracked** | | **${s['total_tracked_usd']:,.0f}** | |")
    print(f"| **Unaccounted** | | **${s['unaccounted_usd']:,.0f}** | Intermediaries/swaps |")
    print(f"\nLiquidation auctions total: ~${s['total_auction_usd']:,.0f} (7 confirmed, likely more)")
    print()


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate cross-chain fund flow report for the Blend exploit",
    )
    parser.add_argument(
        "--json", action="store_true", dest="json_output",
        help="Output as JSON",
    )
    parser.add_argument(
        "--markdown", "--md", action="store_true",
        help="Output as markdown table (for README)",
    )
    parser.add_argument(
        "--brief", "-b", action="store_true",
        help="Short summary only",
    )
    parser.add_argument(
        "--offline", action="store_true",
        help="Don't fetch live data, use cached values only",
    )
    parser.add_argument(
        "--xlm-price", type=float, default=None,
        help=f"Override XLM/USD price (default: {XLM_USD_ESTIMATE})",
    )
    args = parser.parse_args()

    # Override XLM price if specified
    global XLM_USD_ESTIMATE
    if args.xlm_price is not None:
        XLM_USD_ESTIMATE = args.xlm_price

    # Generate report
    report = generate_report(fetch_live=not args.offline)

    # Output
    if args.json_output:
        print(json.dumps(report, indent=2, default=str))
    elif args.markdown:
        output_markdown(report)
    elif args.brief:
        display_brief(report)
    else:
        display_report(report)


if __name__ == "__main__":
    main()
