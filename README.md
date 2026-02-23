# 🕵️ Blend Protocol Exploit — Investigation Tracker

> **Status:** ACTIVE — Funds still moving  
> **Last Updated:** February 22, 2026, 09:03 PM EST  
> **Exploit Ledger:** [61340408](https://stellar.expert/explorer/public/ledger/61340408) (closed 00:24:27 UTC)  
> **Drained from Pool:** 61,249,278 XLM + ~$1M USDC (two separate assets)  
> **Frozen:** ~48M XLM (main wallet + Swap Hub + Funder/Ops — confirmed by mootz12)  
> **Stream 1 — Direct USDC:** ~$997.7K bridged immediately (Base $787K + ETH $172K + BSC $38.7K)  
> **Stream 2 — XLM (13M moved):** $787K converted to USDC + 3.77M to Binance (KYC) + 3.97M to ChangeNow (no KYC!)  
> **XLM Spot at Exploit Ledger:** $0.16065/XLM (DEX candle 00:24 UTC, confirmed on-chain)  
> **DEX Effective Rate:** $0.1565/XLM avg (**2.6% slippage** — minimal price impact)  
> **Total Off-Chain Gross Value (est):** ~$3M ($2M XLM at spot + $1M USDC)  
> **Exchanges Used:** 🚨 Binance (3.77M XLM — **has KYC**) · ⚠️ ChangeNow (3.97M XLM — **no KYC**)  
> **Recovered:** $0  
> **Dashboard:** [www.ztripperz.com](https://www.ztripperz.com)

This workspace tracks the **February 2026 Blend Protocol (YieldBlox Pool) Exploit** on the Stellar network. The attacker manipulated an oracle price feed to borrow ~61.2 Million XLM against inflated USTRY collateral, then began laundering proceeds across multiple EVM chains.

---

## Table of Contents

- [Exploit Mechanics](#exploit-mechanics)
- [Liquidation Cascade (Post-Exploit Auctions)](#liquidation-cascade-post-exploit-auctions)
- [XLIQ Identity Deep Dive](#xliq-identity-deep-dive)
- [GCA34H — Blend Treasury Deep Dive](#gca34h--blend-treasury-deep-dive)
- [SDF Funding Network](#sdf-funding-network)
- [Stellar — Attacker Infrastructure](#stellar--attacker-infrastructure)
- [XLM Laundering Network](#xlm-laundering-network)
- [Cross-Chain Bridge (Allbridge)](#cross-chain-bridge-allbridge)
- [EVM Chain #1 — Base ($787K)](#evm-chain-1--base-787k)
- [EVM Chain #2 — Ethereum ($172K)](#evm-chain-2--ethereum-172k)
- [EVM Chain #3 — BSC ($38.7K)](#evm-chain-3--bsc-387k)
- [The Phishing Network](#the-phishing-network)
- [Complete Address Registry](#complete-address-registry)
- [Agent Playbook](#agent-playbook)

---

## Exploit Mechanics

**Date:** February 20, 2026  
**Target:** Blend Protocol YieldBlox pool on Stellar  
**Asset Manipulated:** USTRY (normal price ~1.06 USDC)

### The Exploit TX (CONFIRMED)

**TX:** [`3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657`](https://stellar.expert/explorer/public/tx/3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657)  
**Time:** 2026-02-22 00:24:27 UTC | **Ledger:** 61340408 | **Fee:** 0.0532048 XLM

The attacker called `submit` on the Blend Pool contract with `request_type: 4` (Borrow), resulting in **61,249,278.3 XLM** drained from the pool.

#### Soroban Execution Trace (from StellarExpert)

```
GBO7...2WXC invoked [Blend Pool] CCCC...GYFS submit(     # ← ATTACKER calls the pool directly
    from: GBO7...2WXC,
    to:   GBO7...2WXC,
    requests: [{
        address: CAS3...OWMA,                             # ← native XLM (Stellar Asset Contract)
        amount:  612492783064502,                         # ← 61,249,278 XLM at 7 decimals (~$9M)
        request_type: 4  (Borrow)                         # ← type 4 = BORROW (not repay/withdraw)
    }]
)

  ├─ Invoked CD74...MXXR decimals() → 7
  ├─ Invoked CD74...MXXR lastprice("Stellar", CAS3...OWMA)
  │    → { price: 1609348, timestamp: 1771719600 }        # ← wrapper oracle: XLM price = ~0.161
  │
  ├─ Invoked [Reflector Oracle] CALI...LE6M last_timestamp() → 1771719600
  ├─ Invoked [Reflector Oracle] CALI...LE6M price(["Stellar", CAS3...OWMA], 1771719600)
  │    → { price: 16093480931573, timestamp: 1771719600 } # ← Reflector raw: same price, different scale (7 extra decimals)
  │
  ├─ Invoked CD74...MXXR lastprice("Stellar", CCW6...MI75)
  │    → { price: 10000000, timestamp: 1771719867 }       # ← USDC priced at 1.0 (normal)
  │
  ├─ Invoked CD74...MXXR lastprice("Stellar", CBLV...PNUR)
  │    → { price: 1067372830, timestamp: 1771719600 }     # ← USTRY collateral — wrapper sees ~106.7 USDC
  │
  ├─ Invoked [Reflector Oracle] CALI...LE6M prices(["Stellar", CBLV...PNUR], 4)
  │    → [
  │        { price: 10673728301028137, timestamp: 1771719600 }, # ← ⚠️ INFLATED: ~101x normal
  │        { price: 10673728301028137, timestamp: 1771719300 }, # ← ⚠️ INFLATED: manipulation already locked in
  │        { price: 105742379403813,   timestamp: 1771719000 }, # ← normal baseline price
  │        { price: 105742642288368,   timestamp: 1771718700 }  # ← normal baseline price
  │      ]                                                # ← TWAP uses 2 inflated + 2 normal = 50x effective boost
  │
  ├─ Invoked CAS3...OWMA transfer([Blend Pool] → GBO7...2WXC, 612492783064502)
  │    61,249,278.3064502 XLM debited from [Blend Pool]   # ← ⚠️ THE DRAIN: full pool XLM leaves
  │    61,249,278.3064502 XLM credited to GBO7...2WXC     # ← lands directly in attacker wallet
  │
  ├─ Event: "borrow" [612492783064502, 610846237149994]
  ├─ Event: "transfer" native 612492783064502
  │
  └─ State Updates:
       Positions[GBO7...2WXC] = {
           collateral: { 5: 1498761336572 },              # ← ~149.9M raw USTRY collateral (inflated value)
           liabilities: { 0: 610846237149994,             # ← XLM liability: 61,084,623 XLM owed (never repaid)
                          1: 8622715615541 },             # ← second liability (USDC borrow)
           supply: {}
       }
       ResData[CAS3...OWMA] = {                           # ← pool resource state after the drain
           b_rate: 1000429719154, b_supply: 11591145734561893,
           backstop_credit: 596293422, d_rate: 1002695516178,
           d_supply: 693631184442089, ir_mod: 1000000     # ← ir_mod=1000000 means interest rate unaffected (instant borrow)
       }

Execution Stats: 10,630,639 instructions | 12.96 MB memory | 1,275μs
```

#### 🔴 The Suspicious Price Jump

Look at the Reflector Oracle's `prices()` response for `CBLV...PNUR`:

| Timestamp | Price | Interpretation |
|-----------|-------|----------------|
| 1771718700 | 105,742,642,288,368 | Normal range |
| 1771719000 | 105,742,379,403,813 | Normal range |
| **1771719300** | **10,673,728,301,028,137** | **⚠️ 100x JUMP** |
| **1771719600** | **10,673,728,301,028,137** | **⚠️ Stays inflated** |

The price of `CBLV...PNUR` jumped **~100x** between timestamps 1771719000 and 1771719300 in the Reflector Oracle. This is the manipulation window — the attacker inflated this asset's oracle price, then borrowed XLM against it.


---

## Full Exploit Impact Flow

```
ATTACKER (GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC)
  │
  ├─ supplies ~150K USTRY as collateral (real value ~$159K)
  ├─ manipulates Reflector oracle → USTRY appears 100× inflated (~$15M)
  └─ borrows 61,249,278 XLM against fake collateral value (never repaid)
       │
       ├─► POOL BAD DEBT: ~61M XLM shortfall created instantly
       │
       ├─► BACKSTOP WIPED FIRST
       │     ~4,388,095 BLND-USDC LP auctioned in BadDebt fills (#7, #8, #48, #57, #58)
       │     Backstop was ~$2M — not enough to cover ~$9M hole
       │
       ├─► REMAINING BAD DEBT SOCIALIZED ACROSS ALL SUPPLIERS
       │     bXLM exchange rate: 1.0 → ~0.45  (XLM suppliers lose ~55%)
       │     bUSDC exchange rate drops      (USDC suppliers lose ~15-20%)
       │     No borrow position required — all suppliers affected equally
       │
       └─► LIQUIDATION CASCADE (60 auction fills, ~4 hours)
             Positions undercollateralized by bad debt ratio shift
             Bots pay CETES/USDC/EURC → receive discounted XLM collateral
             │
             ├─► G...SXI3 (SDF-funded treasury) — largest position liquidated
             │     77,848,371 XLM collateral seized across 9 fills
             │       ├─► 76,341,176 XLM → GAPU4...XLIQ (7 fills)
             │       └─►  1,507,194 XLM → GAIN2...YHNF (2 fills)
             │
             ├─► G...RDYM — 2,742,538 XLM seized (1 fill, GAIN2...YHNF)
             ├─► G...GJKU — 1,461,895 XLM + 9,423 USDC seized (3 fills, GDQY3...BLEND)
             └─► 57 remaining fills across other positions

POOL STATUS: Frozen ("on ice") — no withdrawals, no new borrows. Negotiations in progress.
ATTACKER PROCEEDS (as of Feb 22, 2026):
  ~48M XLM still frozen on Stellar (Main wallet 45.07M + Swap Hub 2.5M + Funder/Ops 450K)
  ~3.77M XLM sent to Binance (KYC exchange)
  ~3.97M XLM sent to ChangeNow (no-KYC)
  ~5M XLM converted → $787K USDC, bridged to Base via Allbridge (16 calls)
  ~$997.7K USDC bridged directly (Base $787K + ETH $172K + BSC $38.7K)
  ~$3M total off-chain (estimated)
```

---

## Liquidation Cascade (Post-Exploit Auctions)


The oracle manipulation and resulting bad debt triggered a cascade of Blend liquidation auctions. Victims who had positions in the pool were forcibly liquidated. **Auction bots stepped in to fill these auctions**, paying off liabilities (USDC, USTRY, EURC, CETES) and receiving discounted collateral (XLM) in return.

> **Full verified report:** [`data/auction_report_v4.txt`](data/auction_report_v4.txt) — contains every fill with filler, liquidated account, collateral, and liability.

**Auction Dashboard:** [blend.xlm.sh/auction](https://blend.xlm.sh/auction/?poolId=CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS)

### Verified Auction Statistics

> **Note:** Data sourced directly from Soroban `fill_auction` events emitted by the Blend Pool contract (`CCCCIQSD...`). Each fill verified via `getTransaction` RPC confirming the Blend Pool contract ID and `submit`/`auct_type` parameters in the transaction envelope.

| Metric | Value |
|--------|-------|
| **Total Auction Fills (verified)** | **60** |
| **Total XLM Collateral Received** | **83,090,246.91 XLM** |
| **Total BLND-USDC LP Received** | **4,388,095.55 LP tokens** |
| **Total USDC Liability Paid** | **3,394,507.20 USDC** |
| **Total CETES Liability Paid** | **2,252,665.74 CETES** |
| **Fills by `GAPU4...XLIQ`** | **19** |
| **Fills by `GAIN2...YHNF`** | **31** |
| **Fills by `GDQY3...BLEND`** | 7 |
| **Fills by `GALB7...CASH`, `GCBYM...M3L`, `GASND...QXJ`** | 1 each |

### Collateral Captured by Filler

XLM price: **$0.1609** — taken directly from the Reflector Oracle in the exploit transaction. Stablecoins at $1. BLND-USDC LP has no reliable on-chain price and is tracked separately.

| Filler | Fills | Priced Collateral (USD) | Share | BLND-USDC LP (units) | LP Share |
|--------|-------|------------------------|-------|----------------------|----------|
| **`...XLIQ`** | **19** | **$12,459,547** | **91.4%** | 1,447,148 | 33.0% |
| **`...YHNF`** | **31** | **$901,336** | **6.6%** | 2,940,948 | 67.0% |
| `...LEND` | 7 | $260,778 | 1.9% | — | — |
| Others | 3 | $4,084 | 0.0% | — | — |
| **XLIQ + YHNF combined** | **50** | **$13,360,884** | **98.1%** | 4,388,096 | 100% |

**XLIQ and YHNF together captured over 98% of all measurable liquidation value across 60 fills.** Even excluding the unpriced BLND-USDC LP tokens entirely, the 98.1% figure holds. The minimum defensible floor is **>90%**.

### Top 3 Liquidated Positions (by XLM seized)

| Rank | Liquidated Account | Fills | XLM Collateral | Other Collateral |
|------|--------------------|-------|----------------|------------------|
| **#1** | `GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3` | 9 | **77,848,371.53 XLM** | — |
| **#2** | `GBCRDN4B6KY456PNKGPTB7OJXEHOBMMZ6EQ23TIRBMIXZUUJODL5RDYM` | 1 | **2,742,538.99 XLM** | — |
| **#3** | `GA2GD7P5MQU2FLF5NP26UJ3KAY5XX42OTJLCG455NUEKPRHLKLJCGJKU` | 3 | **1,461,895.35 XLM** | 9,423.37 USDC |

`G...SXI3` alone accounted for **93.6%** of all XLM seized across all 60 auctions.

**`G...SXI3` split by filler:**
- `G...XLIQ` — 7 fills, **76,341,176.58 XLM** (98.1%)
- `G...YHNF` — 2 fills, **1,507,194.95 XLM** (1.9%)

### The 4 Largest Fills (Single Position: `GCA34H...SXI3`)


All 4 occurred within a **25-ledger window (~2 minutes)** against the same liquidated account.

| # | Ledger | Time (UTC) | TX Hash | XLM Collateral | Filler |
|---|--------|------------|---------|-----------------|--------|
| 12 | 61341630 | 02:23:19 | [`940b307a...`](https://stellar.expert/explorer/public/tx/940b307a0f4b2511673bb0792a25756c3610d0fb7939c136d7a837e881f666e7) | **37,407,176.52** | `GAPU4...XLIQ` |
| 13 | 61341633 | 02:23:36 | [`b41d2f91...`](https://stellar.expert/explorer/public/tx/b41d2f910b1a883c96343e667c60014e035ce177c829162e28420a7ada3c2469) | **13,210,306.22** | `GAPU4...XLIQ` |
| 15 | 61341647 | 02:25:00 | [`b627fb6f...`](https://stellar.expert/explorer/public/tx/b627fb6f874a3dbeda84a684c75117862f9b0c7cd938b69b50ef88b2fd0b79b9) | **13,909,842.74** | `GAPU4...XLIQ` |
| 17 | 61341653 | 02:25:35 | [`015f5429...`](https://stellar.expert/explorer/public/tx/015f5429cd20a6e6ffa23d8381b94e967727901f817a8b382774bd5a0fdc03f8) | **6,153,059.85** | `GAPU4...XLIQ` |

**Combined: ~70.68M XLM collateral** from liquidating position owned by `GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3`.

Liabilities paid for each fill: mix of CETES (~1.1M+), USDC (~1.7M+), USDGLO, EURC, USTRY.

### Chronological Fill Order (All 60)

| # | Type | Ledger | Time (UTC) | Filler |
|---|------|--------|------------|--------|
| 1 | Liquidation | 61340523 | 00:35:38 | `GAPU4...XLIQ` |
| 2 | Liquidation | 61340553 | 00:38:32 | `GAPU4...XLIQ` |
| 3 | Liquidation | 61340864 | 01:08:30 | `GAIN2...YHNF` |
| 4 | Liquidation | 61340910 | 01:12:55 | `GAIN2...YHNF` |
| 5 | Liquidation | 61340911 | 01:13:00 | `GDQY3...LEND` |
| 6 | Liquidation | 61340912 | 01:13:06 | `GAPU4...XLIQ` |
| 7 | BadDebt | 61341303 | 01:51:06 | `GAPU4...XLIQ` |
| 8 | BadDebt | 61341315 | 01:52:17 | `GAIN2...YHNF` |
| 9 | Interest | 61341440 | 02:04:32 | `GAPU4...XLIQ` |
| 10 | Liquidation | 61341588 | 02:19:17 | `GAIN2...YHNF` |
| 11 | Liquidation | 61341617 | 02:22:02 | `GAIN2...YHNF` |
| **12–18** | **Liquidation** | **61341630–61341655** | **02:23–02:25** | **`GAPU4...XLIQ` ← 70.7M XLM** |
| 19 | Liquidation | 61341673 | 02:27:30 | `GAIN2...YHNF` |
| 20 | Interest | 61341758 | 02:35:55 | `GALB7...CASH` |
| 21–47 | Liquidation | 61341766–61341929 | 02:36–02:52 | Mix of `GAIN2`, `GDQY3`, `GCBY`, `GAPU4` |
| 48 | BadDebt | 61342113 | 03:10:28 | `GAIN2...YHNF` |
| 49–53 | Liquidation | 61342119–61342141 | 03:11–03:13 | `GAPU4...XLIQ` |
| 54–55 | Liq/Interest | 61342164–61342185 | 03:15–03:17 | `GDQY3...LEND` |
| 56 | Liquidation | 61342202 | 03:19:15 | `GASND...QXJ` |
| 57–58 | BadDebt | 61342326–61342507 | 03:31–03:48 | `GAIN2...YHNF` |
| 59 | Liquidation | 61342931 | 04:30:03 | `GAPU4...XLIQ` |
| 60 | Liquidation | 61347455 | 11:47:32 | `GAIN2...YHNF` |

**`GAPU4...XLIQ` was Fill #1** — first to react, 11 minutes after the exploit.

### Liquidator Accounts

| Account | Fills | Key Role |
|:--------|:-----:|:---------|
| `GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ` | 19 | First mover; took 70.7M XLM from GCA34H position |
| `GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF` | 31 | Most fills overall; bulk of smaller positions |
| `GDQY3T2ZJXVGV23R32AIHKPC2RLMMYSEK3EGRZ4MA2CYEGXHE63BLEND` | 7 | Third most active |
| `GALB73DWWDC2EWEIUX6CUCZ2DGR7HSYFQIYDM4DCX6USS5GZNMZ3CASH` | 1 | Interest auction only |
| `GCBYMMOSIINFRGFEJKEUGNCUNAOUQYZ6DOQXA47P76UGCUQSXVNWWM3L` | 1 | Single liquidation |
| `GASND6BBFGDGWDLP2DJCFDAKL7GHHZAYQ6PENFHSHMLEMFKAVLZCDQXJ` | 1 | Single liquidation |

> **Blockchain verification note:** These transactions are NOT visible on the Blend UI (blend.xlm.sh) but ARE confirmed on-chain via Soroban RPC `getTransaction` — all 4 contain the Blend Pool 32-byte contract key in their envelope XDR and emit `fill_auction` events through their `submit` invocations.

---

## XLIQ Identity Deep Dive

| Field | Value |
|-------|-------|
| **Address** | `GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ` |
| **Created** | 2024-12-29T15:32:34Z |
| **Home Domain** | `lobstr.co` (generic wallet — no identity info) |
| **Multisig** | None |
| **Creator** | `GCYVR6JS6DLRAFF2HEC6LN7J6H6JS2VMERCTGV64RESTZAJMOHB5RHU7` (~$1.8M whale, no public identity) |
| **Op count** | ~11,375 (all `invoke_host_function` on Blend Pool) |
| **Assets held** | XLM, USDC, CETES, USDGLO, PYUSD, **BLND** |
| **Custom contract** | Deployed `CB5AKVUULR4AMVV4JRVBFDH2VDIO3XWBOZMSGS5Y4LCNP3UIZIYTMAYB` (private automation relay) |

### Is XLIQ Affiliated with YieldBlox DAO?

**Not provably confirmed, but circumstantial evidence is compelling:**

1. **No on-chain tag** — no federation address, no StellarExpert directory label, no public statement linking this wallet to YieldBlox DAO.
2. **YieldBlox = Blend** — YieldBlox (by Script3) rebranded to Blend Protocol. Being the dominant Blend liquidator is as close to "YieldBlox DAO" as exists on-chain.
3. **Matches official bot profile** — the `blend-capital/liquidation-bot` GitHub requires the operator account to hold collateral in the pool; XLIQ does, in size.
4. **Holds BLND tokens** — retail liquidators don't typically hold significant BLND protocol tokens.
5. **Custom automation contract** — XLIQ deployed their own relay contract (`CB5AKVUU...`) rather than running the open-source bot directly, indicating serious custom infrastructure.
6. **First mover (Fill #1, 11 min after exploit)** — implies pre-positioned monitoring, not a retail user who saw the news.

**Conclusion:** XLIQ is a sophisticated, protocol-native Blend liquidation operator. It could be a Blend/Script3 team member's bot, a DAO treasury operator, or a professional MEV firm. Cannot be confirmed as YieldBlox DAO from on-chain data alone — would require Discord/governance cross-reference.

---

## XLIQ Funding Network Deep Dive

The capital chain funding XLIQ traces back five hops to an account tagged **[Spoofing]** by StellarExpert.

### Direct Funders of XLIQ (verified on-chain, 1000-payment sample)

| Source | Asset | Total Sent to XLIQ | Mechanism |
|--------|-------|--------------------|-----------|
| `...3ILW` (hub) | USDC | **$3,577,993** | 8 direct payments |
| `...RHU7` (treasury) | USDC | via RHU7 → XLIQ | RHU7 itself received from 3ILW |

`...3ILW` also sent `...RHU7` **750,000 XLM + $1,004,112 USDC** in the same 1000-payment window, making it the sole funding source for the entire XLIQ operation.

---

### Tier 1 — `...3ILW` (Capital Hub)

| Field | Value |
|-------|-------|
| **Address** | `GARRK37YX4667WZQQRXGUBYDZ3GHMLCHYNLOADYEQ5QTLGWALBHS3ILW` |
| **Created** | 2021-06-04 (by Coinbase Deposits `...4W37`) |
| **Balance** | ~$4.8M (XLM + USDC) |
| **Payment count** | ~466,000 |
| **Unique counterparties** | 294 (in last 1,000 payments) |
| **XLM throughput** | 38M in / 37.2M out |
| **USDC throughput** | 2.4M in / 4.6M out (net USDC exporter) |
| **Dust signals** | 432 (in 1,000 payments) |
| **Origin** | Coinbase Deposits (`GDNHQXSFIZQMJJ...4W37`) — KYC-verified exchange |

**Top inbound sources (1,000 payments):**

| Account | XLM In | USDC In | Description |
|---------|--------|---------|-------------|
| `...4W37` | 19,571,176 | 80 | Coinbase Deposits |
| `...TWA2` | 14,357,360 | 0 | Relay envelope (see below) |
| `...M26D` | 0 | 2,000,000 | Inbound USDC only |
| `...MBYU` | 2,491,605 | 0 | Bidirectional peer |
| `...2Q7F` | 189 | 301,061 | Inbound USDC |

**Top outbound destinations (1,000 payments):**

| Account | XLM Out | USDC Out | Notes |
|---------|---------|----------|-------|
| `...JNL6` | 5,154,370 | 0 | Relay; merges back into `...KLDC` |
| `...GKTM` | 3,172,037 | 0 | XLM worker |
| `XLIQ` | 0 | 3,577,993 | **Liquidation bot** |
| `...MTIH` | 1,342,486 | 0 | XLM worker |
| `...6O7Q` | 1,325,194 | 0 | XLM worker |
| `...UJ4A` | 1,189,383 | 0 | XLM worker |
| `...JREW` | 1,029,078 | 0 | XLM worker — holds 141.9M XLM + 1.9M USDC + 816M VELO |
| `...RHU7` | 750,000 | 1,004,112 | XLIQ treasury |
| `...RINW` | 755,307 | 0 | Worker — holds 15.9M XLM + MOBI/SHX/VELO/WXT |

**Notable worker account:**
- `...2PNY` — received 68 XLM + dust signal from `...3ILW`; **created by `[ChangeNow]`** (StellarExpert tag). ChangeNow (no-KYC exchange) is also a confirmed destination for stolen XLM from the attacker's bridge operation.

---

### Tier 2 — `...TWA2` (Throwaway Relay Envelope)

| Field | Value |
|-------|-------|
| **Address** | `GCPOK3AAEM2AQLIYQREROXZ7R6RN7CNKO5CTVX2VRWRDOTMMCZV7TWA2` |
| **Created by** | `...KLDC` on **2025-12-09T13:51:21Z** (starting balance: 1.5 XLM) |
| **Last instance** | Re-created by `...KLDC` on **2026-02-22T15:07:29Z** |
| **Lifespan** | ~12 seconds per run |
| **Operation** | Created → fires 4,358,826 XLM to `...3ILW` → sends 0.001 XLM dust ack to `...3ILW` → `account_merge` back to `...KLDC` |
| **Status** | Deleted (404) — merged into `...KLDC` on 2026-02-22T15:07:41Z |

`...TWA2` is a single-use relay envelope. It is spawned, fires one large payment, and self-destructs via `account_merge` within seconds. All residual XLM is returned to `...KLDC` via the merge.

---

### Tier 3 — `...KLDC` (Relay Dispatcher)

| Field | Value |
|-------|-------|
| **Address** | `GDNHPXSFIZQMJJFBAFWUWG3442AHGI3WEWUYRYXIGMJRHDUQOPHTKLDC` |
| **Created** | **2025-10-19T01:44:46Z** by `...PJL5` (starting balance: 13,130 XLM) |
| **Balance** | 82,130 XLM |
| **Last active** | 2026-02-23T02:38:19Z |
| **Trustlines** | None |
| **Home domain** | None |

`...KLDC` spawns disposable relay accounts (like `...TWA2`), each of which fires a large XLM payment into `...3ILW` and then merges back. Confirmed relay accounts that merged **back into `...KLDC`** include:
- `...JNL6` (`GABFJIMI52DCECD7ZSMNEFCNEYKREJOKPQCM2QX5UKCVY3UHHA77JNL6`) — merged into KLDC on 2026-02-23T02:38:19Z
- `...W54` (`GD5I54RP2IHR3G42PYUMHJ2GAGWFAAUGCLP2V25HSYGY6PY3JDYZCW54`) — merged same block
- `...BAVV` (`GBALHMMMQDMHZQOCTSR6JLX6TORGLDHOIAMARIA76JRF3JAAM77JBAVV`) — merged same block

`...JNL6` is also a **top outbound recipient** from `...3ILW` (5.15M XLM out), confirming that `...3ILW` → `...JNL6` → merge into `...KLDC` is a closed XLM recycling loop.

---

### Tier 4 — `...PJL5` (Origin Account — [Spoofing] Tagged)

| Field | Value |
|-------|-------|
| **Address** | `GC7BKVSFWQPVSHINTTXEIVI6EK2Z2YW245RA7KRODJA4EN27H2CMPJL5` |
| **StellarExpert Tag** | ⚠️ **[Spoofing]** |
| **Home Domain** | **`lobstr.co`** (LOBSTR wallet — not a real LOBSTR account) |
| **Created** | Before Oct 2025 |
| **Last modified** | 2025-10-23T19:22:38Z |
| **Balance** | 3.15 XLM + dust ROEX + dust WXT |
| **Created** | `...KLDC` on 2025-10-19T01:44:46Z with 13,130 XLM seed |
| **Inflation destination** | `GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW` |

StellarExpert's [Spoofing] tag is applied to accounts that impersonate known entities. `...PJL5` sets `home_domain = lobstr.co`, presenting itself as a LOBSTR-affiliated account while being unconnected to LOBSTR.

---

### Capital Chain Summary

```
[Spoofing] ...PJL5   GC7BKVSFWQPVSHINTTXEIVI6EK2Z2YW245RA7KRODJA4EN27H2CMPJL5
  └── ...KLDC        GDNHPXSFIZQMJJFBAFWUWG3442AHGI3WEWUYRYXIGMJRHDUQOPHTKLDC
        │ (spawns + recycles relay envelopes via account_merge)
        ├── ...TWA2   GCPOK3AAEM2AQLIYQREROXZ7R6RN7CNKO5CTVX2VRWRDOTMMCZV7TWA2
        ├── ...JNL6   GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6
        └── (other relay envelopes)
              └── ...3ILW   GARRK37YX4667WZQQRXGUBYDZ3GHMLCHYNLOADYEQ5QTLGWALBHS3ILW
                    │ (Coinbase-origin capital hub — 466K payments, 294 counterparties)
                    ├── Direct:   XLIQ    $3,577,993 USDC
                    ├── Via RHU7: XLIQ    $1,004,112 USDC + 750,000 XLM
                    ├── ...JREW   1,029,078 XLM  (holds 141.9M XLM + 1.9M USDC)
                    ├── ...RINW     755,307 XLM  (holds 15.9M XLM + DeFi tokens)
                    ├── ...GKTM   3,172,037 XLM
                    └── 290+ other counterparties
```

**ChangeNow connection:** Worker account `...2PNY` (funded by `...3ILW`) was **created by a [ChangeNow]-tagged account**. ChangeNow (no-KYC) is independently confirmed as a destination for stolen XLM from the attacker's bridge operations.

---

## YHNF Identity Deep Dive

| Field | Value |
|-------|-------|
| **Address** | `GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF` |
| **Created** | 2025-04-15T18:58:02Z |
| **Home Domain** | None |
| **Multisig** | None — single key, weight=1 |
| **Creator** | `GBPUFOPDVPGM56MIO4KYSNV2N4XLYBZAXL6QMD75JWG7GC5L6ANFSYBL` (diversified DeFi portfolio; no public identity) |
| **Current XLM balance** | **10,598,958 XLM** (liquidation proceeds from 31 fills) |
| **Other assets** | BLND (103.51), CETES (43,514), EURC (6,783), PYUSD (240), USDC (222), USTRY (915) |
| **Fills executed** | **31 fills** — most fills of any single liquidator |
| **XLM seized from SXI3** | 1,507,194 XLM (fills #10, #11) |

### Controller: `GDDYERCLIKAEDJJQI6XWWPLTOZ7OPOH26LFLNUD43QP4UEH34YEOV4A7`

This 4-signer multisig (weights 8/8/8/1) is the clearest link to YHNF's operator:

- Sent YHNF **100,000 BLND** (2025-08-20) + **276,632 BLND** (2025-08-27) — BLND distribution for protocol participation
- Sent YHNF **80,000 USDC** on **2026-02-22** (exploit day) — operating capital wired in same day as liquidations
- Signers: `GAMEYWUCSHCK3IOJWA5I`, `GCIPGRNCW7KBJZXRZ`, `GDOVD6A6YCU2J2ZPRA` (wt=8 each)

### BLND Whale Connection: `GCJ2VBYRO4BO3BHCGN7EMSTKBLQXMUTS67PFHUJBZOCCQGLOQN5XFKOG`

Holds **7,579,191 BLND** — one of the largest BLND holders on-chain (likely Blend DAO treasury or protocol reserve). This account:
- Sent YHNF **699,990 BLND** in Dec 2025, received **700,000 BLND** back in Jan 2026
- The round-trip suggests BLND was temporarily delegated to YHNF for voting/staking, then recalled

### Operator Cluster — YHNF, GASND, and GBAQG3 Are Co-Participants

`GASND6BBFGDGWDLP2DJCFDAKL7GHHZAYQ6PENFHSHMLEMFKAVLZCDQXJ` (**Fill #56** in our auction report) also sent BLND to YHNF. This clusters YHNF and GASND as accounts operated by the same entity — likely a Blend-community-aligned operator group.

### Creation Timing is Suspicious

YHNF was created **2025-04-15** — 8 days before `G...SXI3` (the Blend Treasury) was created on **2025-04-23**. Both accounts were set up in the same April 2025 operational window, suggesting YHNF was prepared as a liquidation bot in parallel with the treasury deployment.

### Key Finding

**No direct link to SDF or the attacker.** YHNF is a professional, protocol-connected Blend liquidation operator — likely run by a Blend DAO participant or aligned MEV firm. It was seeded with BLND by a large protocol-level holder and received USDC from a 4-signer controller on the day of the exploit. The 31 fills and 10.6M XLM profit place it squarely as the second-largest beneficiary of the liquidation cascade after `G...XLIQ`.

### Post-Exploit Activity

After completing its 31 fills, YHNF began creating **claimable balances** — distributing its seized collateral (XLM, CETES, USDC, EURC, USDGLO) to the controller multisig `G...V4A7`. This is consistent with a bot returning profits to its operator wallet via Stellar's native claimable balance mechanism rather than a direct transfer, which avoids triggering on-chain payment alerts.

---

## GCA34H...SXI3 — Blend Treasury Deep Dive

The largest liquidated position — `GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3` — was not a retail user. It is an institutional multisig account that functions as the **Blend Protocol's primary liquidity treasury**.

| Field | Value |
|-------|-------|
| **Address** | `GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3` |
| **Created** | 2025-04-23T19:36:24Z |
| **Home Domain** | None |
| **Multisig** | ✅ 11 signers — thresholds Low:1 / Med:4 / High:6; self=weight 200 |
| **Created by** | `GCAI54XEZIEABT7KBVQ2BR7RNWYCFBA3DMFHW6U4KWRJAX4IJTHZQSRR` (holds 36,702 BLND) |
| **Current Holdings** | ~$11M+: 11.1M USDC, 1.8M CETES, 919K XLM, 37.9K EURC, 27.8K USDGLO |
| **Liquidated for** | ~70.68M XLM collateral (fills #12–18, 2-minute window) |

**Why this is the Blend Protocol Treasury:**
1. Created by a BLND-holding insider account (`G...QSRR`)
2. SDF directly funded it with ~511.8M XLM across 17 wires
3. 11-signer institutional multisig — matches a protocol treasury governance structure
4. $11M in stablecoins + yield assets (USDC, CETES, EURC) — a lending pool reserve
5. Held the largest Blend pool collateral position by far

---

## SDF Funding Network

On-chain investigation reveals that the liquidated Blend treasury (`G...SXI3`) was funded by a network of accounts traceable directly to the **Stellar Development Foundation (SDF)**.

### SDF Confirmation

Account `GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH` is **confirmed SDF** via StellarExpert directory: labeled **[SDF Direct Development (Hot 2)]**, tagged `#sdf`, associated with `stellar.org`, holds 189M XLM.

### The Complete Hub-and-Spoke Money Flow

```
SDF Direct Development (Hot 2)
GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH
  │
  │ created + funded
  ▼
GDDUETSYDSHJMU5J73WHR4SQOAWRUM5SNLHXBQKM36EQ244GHSRS5AHF  [SDF Conduit]
  │
  ├─► 511.8M XLM (17 wires, Apr 2025–Feb 2026) ───────────────────────────────────────┐
  │                                                                                   │
  └─► GCAI54XEZIEABT7KBVQ2BR7RNWYCFBA3DMFHW6U4KWRJAX4IJTHZQSRR  [Blend Operator]      │
        │  (36,702 BLND holder; created GCA34H; received 48.15M XLM from SDF conduit) │
        │                                                                             │
        ├─► 3M XLM (2025-02-10) ──► GD5Z6NYV3WT4VIQHTNKXDU4MDUBDHK6KGICDFJGJXP4NWPVCS4ZJPZNP  [XLM/BLND Relay]
        │                               │
        ├─► 5M XLM (2025-02-24) ──► ────┤
        │                               │
        │                               ├─► 17,969,200 XLM  ──────────────────────────┤
        │                               └─► 1,117,929.73 BLND ─────────────────────── ┤
        │                                   (2025-04-24 / 2025-04-30)                 │
        │                                                                             │
        ├─► 800K USDx ──► GCB426VZ6DYX576HLZTA2X2C3CJT6ZDFNHCIIULPZYUNWC55QRFOFEI4    │
        │   (shared signer GDSZIVR5B776NB5RMS267M4JSRBFPJUMZCCURAV6PYAFPI3OV7LIMSQI   │
        │    with GCUIXCR below)                                                      │
        │        │                                                                    │
        │        └─► 1,774,000 USDC ──► G...PZNP (relay to treasury above)            │
        │                                                                             │
        ├─► Apr 14 migration: 6.85M XLM + 540K EURC + 806K EURx + 645K USDC ──►       │
        │   GCUIXCRGWHF45VJTEAVRUZK37ET4KTHI26H5DL34B2XVBTKCOLQHWGVD [Sibling Reserve]│
        │   (holds 2M PYUSD, 41.5K USDC, EURC, TESOURO; same signer as GCB426VZ)      │
        │                                                                             │
        └─► 2M XLM ───────────────────────────────────────────────────────────────────┤
            (2025-07-15)                                                              │
                                                                                      ▼
                                          GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3
                                          [Blend Primary Treasury — LIQUIDATED]
```

### GDDUETSYD → GCA34H Direct XLM Wire History (Full Audit)

> **511.8M XLM** confirmed across 17 wires from the SDF conduit alone.

| Date | Amount | Running Total |
|------|--------|---------------|
| 2025-04-29 | 9,999,992 XLM | ~10M |
| 2025-04-30 | 5,800,000 XLM | ~15.8M |
| 2025-06-18 | 8,000,000 XLM | ~23.8M |
| 2025-07-15 | 2,000,000 XLM | ~25.8M |
| 2025-07-28 | 9,000,000 XLM | ~34.8M |
| 2025-07-28 | 11,000,000 XLM | ~45.8M |
| 2025-08-27 | 10,000,000 XLM | ~55.8M |
| 2025-09-22 | 10,000,000 XLM | ~65.8M |
| 2025-10-02 | 19,999,999 XLM | ~85.8M |
| 2025-10-15 | 15,000,000 XLM | ~100.8M |
| 2025-10-20 | 5,000,000 XLM | ~105.8M |
| 2025-11-05 | 20,000,000 XLM | ~125.8M |
| 2025-11-18 | 10,000,000 + 20,000,000 + 9,000,000 + 13,000,000 XLM | ~177.8M |
| 2025-11-20 | 8,000,000 XLM | ~185.8M |
| 2025-11-21 | 20,000,000 + 6,000,000 + 11,000,000 + 9,000,000 + 10,000,000 XLM | ~241.8M |
| 2025-12-05 | 20,000,000 XLM | ~261.8M |
| 2025-12-22 | 50,000,000 XLM | ~311.8M |
| 2026-01-31 | 30,000,000 XLM | ~341.8M |
| 2026-02-05 | 71,999,909 + 48,000,000 + 91 XLM | **~461.8M** |
| 2026-02-13 | 50,000,000 XLM | **~511.8M** |

**~511.8M XLM** wired directly from `G...SAHF` (SDF conduit) to `G...SXI3`. The final two wires (72M + 48M on Feb 5, then 50M on Feb 13) arrived **9 days before the exploit**.

### Full XLM Inflow Attribution (Verified)

| Source | XLM Received | % of Total |
|--------|-------------|------------|
| `GDDUETSYDSHJMU5J73WHR4SQOAWRUM5SNLHXBQKM36EQ244GHSRS5AHF` (SDF Conduit) | **511,800,000** | 95.0% |
| `GD5Z6NYV3WT4VIQHTNKXDU4MDUBDHK6KGICDFJGJXP4NWPVCS4ZJPZNP` (XLM Relay) | **17,969,200** | 3.3% |
| `GCAI54XEZIEABT7KBVQ2BR7RNWYCFBA3DMFHW6U4KWRJAX4IJTHZQSRR` (Blend Operator) | **1,999,721** | 0.4% |
| `GCUIXCRGWHF45VJTEAVRUZK37ET4KTHI26H5DL34B2XVBTKCOLQHWGVD` (Sibling Reserve) | **529,930** | 0.1% |
| **SDF-network total** | **532,298,851 XLM** | **98.8%** |
| 2 untraced accounts (GDHMJXMH..., GDBKXCOA...) | 6,250,827 XLM | 1.2% |
| **Grand Total into G...SXI3** | **538,549,678 XLM** | 100% |

**98.8% of all XLM ever deposited into the Blend treasury came from the SDF network.** The ~70.68M XLM that was liquidated in the exploit is the pool's outstanding collateral position at exploit time — the rest had been lent, earned yield, or cycled back through the protocol over 10 months of operation.

### Key Accounts in the Funding Network

| Account | Role | Notable |
|---------|------|----------|
| `GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH` | **SDF Direct Development Hot 2** | Confirmed #sdf, 189M XLM, stellar.org |
| `GDDUETSYDSHJMU5J73WHR4SQOAWRUM5SNLHXBQKM36EQ244GHSRS5AHF` | **SDF Conduit** | Created by SDF; wired to GCA34H, GCAI54X, GDBKXCOA |
| `GCAI54XEZIEABT7KBVQ2BR7RNWYCFBA3DMFHW6U4KWRJAX4IJTHZQSRR` | **Blend Operator / Deployer** | Created GCA34H; 36,702 BLND; migrated all assets to GCUIXCR Apr 2025 |
| `GD5Z6NYV3WT4VIQHTNKXDU4MDUBDHK6KGICDFJGJXP4NWPVCS4ZJPZNP` | **XLM/BLND Relay** | Forwarded 17.97M XLM + 1.12M BLND to GCA34H |
| `GCB426VZ6DYX576HLZTA2X2C3CJT6ZDFNHCIIULPZYUNWC55QRFOFEI4` | **USDC Routing Multisig** | Routed 1.77M USDC → PZNP for XLM conversion; shares signer with GCUIXCR |
| `GCUIXCRGWHF45VJTEAVRUZK37ET4KTHI26H5DL34B2XVBTKCOLQHWGVD` | **Sibling Reserve** | 2M PYUSD, 41.5K USDC, TESOURO; same 1/2/6 multisig pattern as GCA34H |
| `GDBKXCOAIER4ELKUSH2OMCZYN3XFVMZ4UMWLDWAW7OSIBDCO7JVUXE4Q` | **Intermediary** | Received 13.45M XLM from SDF conduit (2025-04-23) |

### Shared Signer — The Cluster Proof

`GDSZIVR5B776NB5RMS267M4JSRBFPJUMZCCURAV6PYAFPI3OV7LIMSQI` appears as a signer on **both** `GCB426VZ` (weight 3) and `GCUIXCRGWHF45VJ` (weight 1). These accounts are **co-controlled** by the same operator entity.

### BLND Governance Token Issuer — Confirmed Real

The 1,117,929.73 BLND tokens sent from `G...PZNP` to `G...SXI3` (GCA34H) are **legitimate Blend Protocol governance tokens**.

| Field | Value |
|-------|-------|
| **Issuer** | `GDJEHTBE6ZHUXSWFI642DCGLUOECLHPF3KSXHPXTSTJ7E3JF6MQ5EZYY` |
| **Home Domain** | None |
| **Thresholds** | All 88 — self weight 0 = **permanently locked** |
| **Mechanism** | Soroban SAC (Stellar Asset Contract) controls minting; account cannot sign |
| **Claimable Balance BLND** | 389,808.65 BLND in active distributions |

This is the standard Soroban-native token pattern: the issuer account is rendered non-signing, with a smart contract exclusively managing supply. All BLND from this issuer are authentic.

### Significance

The SDF-linked accounts deployed capital into the Blend treasury, making `G...SXI3` the largest single position in the pool by a wide margin — **77.85M XLM** of collateral. When the oracle exploit hit:

- `G...SXI3` was forcibly liquidated across 9 fills, yielding the overwhelming majority of all seized collateral
- `G...XLIQ` captured **76.4M XLM** total across all 60 fills (91.4% of all priced collateral at $0.1609 = **~$12.3M**) — with the SDF treasury position as its primary source
- The exploit was not just a DeFi hack — it was a precision strike on an institutional liquidity position, with two pre-positioned bots (XLIQ + YHNF) ready to sweep the resulting auctions

---

## Stellar — Attacker Infrastructure


### Primary Attacker Wallet

| Field | Value |
|-------|-------|
| **Address** | `GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC` |
| **Created** | February 14, 2026 |
| **Initial Funding** | 56.32 XLM from intermediary `GC2XJK...FZIB` |
| **Current Holdings** | ~45 Million XLM (still on Stellar) |
| **USTRY Issuer** | `GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC` |

### Key Stellar Transactions

| Label | TX Hash | What It Does |
|-------|---------|--------------|
| **Oracle Probe** | `dc4f41194b383f5aade3cdb4d249dfd4fd9b641ab1c7cfbc08a23a5ac29a4cda` | Created sell offer: 0.025 USTRY at 501 USDC/USTRY. **Never filled.** |
| **Test Borrow** | *(needs identification)* | Small test borrow/repay cycle of 9.32 USDC |
| ⚡ **MAIN EXPLOIT** | [`3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657`](https://stellar.expert/explorer/public/tx/3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657) | `submit(request_type=4)` → Borrowed **61,249,278.3 XLM** from Blend Pool |
| **Bridge Txs** | Multiple `swap_and_bridge` calls | Batched ~50K USDC per call to EVM via Allbridge |

### Actual USTRY Trading History (From Attacker's Account)

All executed trades were at **normal prices** (~1.058 USDC/USTRY):

| Date | Action | Amount | Price |
|------|--------|--------|-------|
| Feb 19 15:02 | Buy USTRY | 0.1 USTRY | 1.058 |
| Feb 20 17:14 | Buy USTRY | 50 USTRY | 1.058 |
| Feb 20 18:26 | Buy USTRY | 51.16 USTRY | 1.059 |
| Feb 21 04:55 | Buy USTRY | 55 USTRY | 1.058 |
| Feb 21 05:28 | Sell USTRY | 51.68 USTRY | 1.058 |
| Feb 21 06:14 | Buy USTRY | 50 USTRY | 1.058 |
| **Feb 22 00:21** | **DUMP** | **40,596 USTRY** | **1.060** |
| **Feb 22 00:22** | **DUMP** | **94,420 USTRY** | **1.063** |

The massive dumps at 00:21-00:22 on Feb 22 are the attacker liquidating stolen USTRY back into USDC for bridging.

---

## XLM Laundering Network

The attacker drained 61,249,278 XLM. Per mootz12 (Blend core team): **"48M XLM frozen, 13M XLM and 1M USDC were bridged out."**

~48M XLM remains frozen across three wallets. The remaining ~13M was moved through 5 intermediary wallets to two exchanges (Binance and ChangeNow) and one DEX conversion pipeline. Each withdrawal was preceded by a 0.001 XLM dust payment from a paired trigger address (automated C2 pattern).

### Intermediary Wallets (Full Trace)

| # | Address | Role | Received | Sent To | Status |
|---|---------|------|----------|---------|--------|
| 1 | `GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH` | **Swap Hub** | 8,001,000 XLM | ~5M → USDC ($787K), rest frozen | 🔒 ~2.5M FROZEN |
| 2 | `GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY` | **⚠️ ChangeNow** (no KYC!) | 3,987,342 XLM | 3,965,831 → ChangeNow hot wallet | ⚠️ Gone |
| 3 | `GDTSFMKTLD2WTQSOWK36QB4A5VTHI54Q67ZDSKAWULAKKN6QVX6LTHQC` | **Relay → Binance** | 3,546,827 XLM | 3,536,146 → Binance deposit | 🚨 KYC |
| 4 | `GC2XJKN5VZEMM35F5LRSUP5CWVDZJVM37YKR7UYYXGN3TGKZXMP5FZIB` | **Funder/Ops** (Binance-created) | 450,490 XLM | 0 sent out | 🔒 FROZEN |
| 5 | `GALFQWBGD472N3N7DO7LPT7BRTLHAVJDH4KCTTUVEOVUS4VJQ47PJNSH` | **Small → Binance** | 230,106 XLM | 233,610 → Binance deposit | 🚨 Drained |

**Exchange destinations (confirmed via [stellar.expert](https://stellar.expert)):**
- 🚨 **Binance** (`GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6`): 3,769,756 XLM — `#exchange`, `#memo-required`, `binance.com` — **has KYC**
- ⚠️ **ChangeNow** (`GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY`): 3,965,831 XLM — `#exchange`, `#memo-required`, `changenow.io` — **no KYC**



### Swap Hub Pattern (`GATDQL767ZM2`)

The Swap Hub received 8M XLM and ran a cycle: create throwaway account → load XLM → `path_payment_strict_send` (DEX swap to USDC) → `account_merge` throwaway → bridge USDC via Allbridge. Known USDC proceeds: $787,167 total across 3 self-swaps + 4 throwaway merges, plus 150,000 USDC returned to the main wallet.

### Dust-Signal C2

Each intermediary has a paired trigger address sending exactly 0.001 XLM as a "go" signal before batch withdrawals:

| Trigger | Controls |
|---------|----------|
| `GATDIV4ROXRC` | `GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH` (Swap Hub) |
| `GDBIBJLV7KDB` | `GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY` (ChangeNow) |
| `GDTS7EPASSTB` | `GDTSFMKTLD2WTQSOWK36QB4A5VTHI54Q67ZDSKAWULAKKN6QVX6LTHQC` (Relay) |
| `GC2XUR73CEZL` | `GC2XJKN5VZEMM35F5LRSUP5CWVDZJVM37YKR7UYYXGN3TGKZXMP5FZIB` (Funder/Ops) |
| `GALFMVJPW6AS` | `GALFQWBGD472N3N7DO7LPT7BRTLHAVJDH4KCTTUVEOVUS4VJQ47PJNSH` (Small) |



### Net Extraction Summary

The attacker drained **two separate assets** from Blend: 61,249,278 XLM and ~$1,000,000 USDC.
These produced **two independent USDC bridge streams**:

**Stream 1 — Direct USDC Borrow (~$997.7K)**
The ~$1M USDC borrowed directly from the pool was immediately bridged off-chain via Allbridge Soroban calls directly from the main attacker wallet (`GBO7VUL2...C2WXC`). This is the bridge data we already have:

| Chain | Amount | Status |
|-------|--------|--------|
| Base | ~$787,000 | ⚡ Active swapping (converted to ETH) |
| Ethereum | ~$172,000 | 💤 Forwarded to accumulator |
| BSC | ~$38,700 | 💤 Untouched |
| **Stream 1 Total** | **~$997,700** | |

**Stream 2 — XLM → USDC Conversion ($787K)**
~5M XLM was routed through GATDQL767ZM2 (Primary Swap Hub) and 4 throwaway accounts, converted to USDC via `path_payment_strict_send`, then bridged via 16 Allbridge Soroban calls to Base chain.

**On-chain confirmed spot price at ledger 61340408 (00:24:27 UTC): $0.16065/XLM**

| Swap | XLM In | USDC Out | Rate | Time UTC |
|------|--------|----------|------|----------|
| GATDQL self #1 | 500,000 XLM | $79,122 | $0.15824 | 01:59 |
| GATDQL self #2 | 1,000,000 XLM | $157,236 | $0.15724 | 02:18 |
| GATDQL self #3 | 500,000 XLM | $76,692 | $0.15338 | 02:45 |
| Throwaway accts (×4) | ~3,000,000 XLM | $474,117 | ~$0.1580 | 01:44–02:29 |
| **Total** | **~5,000,000 XLM** | **$787,167** | **$0.1565 avg** | |

> **Slippage:** $0.16065 spot → $0.1565 effective = **2.6% below spot** (minimal price impact)

**Complete XLM Reconciliation (61,249,278 XLM — confirmed by mootz12: "48M frozen, 13M bridged out"):**

| Category | Wallet | XLM | Value @ $0.16065 | Status |
|----------|--------|-----|-------------------|--------|
| 🔒 Frozen (main wallet) | `GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC` | 45,068,299 | $7,240,722 | 🔒 FROZEN |
| 🔒 Frozen (Swap Hub) | `GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH` | ~2,500,813 | $401,756 | 🔒 FROZEN |
| 🔒 Frozen (Funder/Ops) | `GC2XJKN5VZEMM35F5LRSUP5CWVDZJVM37YKR7UYYXGN3TGKZXMP5FZIB` | 450,490 | $72,371 | 🔒 FROZEN |
| **🔒 Total Frozen** | | **~48,019,602** | **$7,714,849** | **≈ 48M ✓** |
| 💱 Converted to USDC | `GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH` | ~5,000,000 | $787,167 realized | Bridged to Base |
| 🚨 Binance (via Relay) | `GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6` | 3,536,146 | $568,234 | **KYC** |
| 🚨 Binance (via Small) | `GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6` | 233,610 | $37,531 | **KYC** |
| ⚠️ ChangeNow (no KYC!) | `GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY` | 3,965,831 | $637,111 | **NO KYC** |
| **🚨 Total Moved** | | **~12,735,587** | **~$2,030,043** | **≈ 13M ✓** |
| Fees/dust/residual | various | ~494,089 | ~$79,395 | |
| **TOTAL** | | **61,249,278** | | **✓ Reconciled** |

**Exchange breakdown:**
- 🚨 **Binance**: 3,769,756 XLM ($605,765) — **has KYC, subpoena-able**
- ⚠️ **ChangeNow**: 3,965,831 XLM ($637,111) — **no-KYC instant swap ([changenow.io](https://changenow.io))**, contact compliance team



### USDC Flow Map (Stream 2)

```
GBO7VUL2 (main wallet)
  └─ 8,001,000 XLM → GATDQL767ZM2 (Swap Hub)
        ├─ path_payment [500K XLM → $79,122 USDC]
        ├─ path_payment [1M XLM   → $157,236 USDC]
        ├─ path_payment [500K XLM → $76,692 USDC]
        ├─ 4 throwaway accounts  → $474,117 USDC (merged back)
        ├─ 16× Allbridge swap_and_bridge → Base chain
        └─ 150,000 USDC → GBO7VUL2 (returned to main)
```



---

## Cross-Chain Bridge (Allbridge)

The attacker uses **Allbridge Core Bridge** via Soroban's `swap_and_bridge` function to move USDC off Stellar.

### Decoding `swap_and_bridge` Parameters (XDR)

```
Param 5 → Amount (U128): e.g., 50,000 USDC (7 decimal places)
Param 6 → Destination Address (Bytes): 32-byte field, last 20 bytes = EVM address
Param 7 → Chain ID (U32): 9 = Base
Param 8 → Token Address (Bytes): 32-byte field, last 20 bytes = EVM token contract
```

### Python Decode Script

```python
import base64, struct

# Chain ID
chain_bytes = base64.b64decode('AAAAAwAAAAk=')
chain_id = struct.unpack('>I', chain_bytes[4:])[0]  # → 9 (Base)

# Destination EVM Address
dest_bytes = base64.b64decode('AAAADQAAACAAAAAAAAAAAAAAAAAtHOKbSvFftudrqZlbvhQh6FRkgg==')
evm_addr = '0x' + dest_bytes[8:][-20:].hex()  # → 0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482

# Token on destination chain
token_bytes = base64.b64decode('AAAADQAAACAAAAAAAAAAAAAAAACDNYn81u224I9MfDLU9xtUvaApEw==')
evm_token = '0x' + token_bytes[8:][-20:].hex()  # → 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913 (USDC on Base)

# Amount
amt_bytes = base64.b64decode('AAAACQAAAAAAAAAAAAAAdGpSiAA=')
hi = struct.unpack('>Q', amt_bytes[4:12])[0]
lo = struct.unpack('>Q', amt_bytes[12:20])[0]
amount = ((hi << 64) | lo) / 10**7  # → 50,000.0 USDC
```

### Allbridge Contracts

| Chain | Bridge Contract |
|-------|----------------|
| Ethereum | `0x609c690e8f7d68a59885c9132e812eebdaaf0c9e` |
| BSC | `0x3c4fa639c8d7e65c603145adad8bd12f2358312f` |
| Base | *(identify from token transfer logs)* |

---

## EVM Chain #1 — Base ($787K)

| Field | Value |
|-------|-------|
| **Address** | `0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482` |
| **Balance** | ~$787,000 |
| **Activity** | UniswapX Priority Order swaps (USDC → ETH/WETH) |
| **Key Contract** | UniswapX Priority Order Reactor: `0x000000001ec5656dcdb24d90dfa42742738de729` |
| **USDC Contract** | `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913` (Circle USDC on Base) |
| **Incoming** | 8+ separate Allbridge USDC transfers (~50K each) |

**Note:** UniswapX is NOT a mixer — it's Uniswap's advanced order routing for large trades with minimal slippage. The attacker chose this for efficiency, not privacy.

---

## EVM Chain #2 — Ethereum ($172K)

| Field | Value |
|-------|-------|
| **Address** | `0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482` |
| **Total TXs** | 23 |
| **Funded By** | Allbridge Core Bridge |
| **Swaps** | 9x Uniswap V4 Universal Router (`0x66a9893cc07d91d95644aedd05d03f95e1dba8af`) |
| **Downstream** | Bulk ETH forwarded to Accumulator Wallet #4 |

### Vanity Gas Ring #1 (`0x0b2...3eC6` pattern)

These wallets received gas from phishing wallets and returned dust to the main attacker:

| # | Address | Balance | TXs | Funded By |
|---|---------|---------|-----|-----------|
| 1 | `0x0B2bC0c2bd171c4701cfad713172c4b5b0053EC6` | $0 | 3 | 🚩 Fake_Phishing1064860 |
| 2 | `0x0b2081a0d5515485d51606ba41d8ee186f303eC6` | $0 | 3 | 🚩 Fake_Phishing1701177 |
| 3 | `0x0b2ce35351ecf2b36a2e965c394683d47a563eC6` | $0 | 2 | 🚩 Fake_Phishing1674496 |
| 4 | `0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6` | **$591,808** | 5 | Main Attacker |
| 5 | `0x0b29aB4525acc3fed709b86fe5612734c6ef3eC6` | $0 | 1 | 🚩 Fake_Phishing1648144 |
| 6 | `0x0b20E28bf0012a52e52f969fb6a0865854e93eC6` | $0 | 1 | 🚩 Fake_Phishing1701177 |
| 7 | `0x0b2b400Bb655da6aeaaedd3a23260957c5bc3ec6` | $0 | 1 | `0xc3CbB870...22702b7F9` |

### Vanity Gas Ring #2 (`0x2D1...6482` pattern — mimics main attacker)

These fed dust into Wallet #4 (the accumulator):

| Address | Balance | Funded By |
|---------|---------|-----------|
| `0x2d1C87693a1242b1a0736d064bbe25f204eB6482` | $0 | 🚩 Fake_Phishing1064860 |
| `0x2D107786363ed945e0255e7f27d3233aAB476482` | $0 | 🚩 Fake_Phishing1701177 |
| `0x2D1005b0Db4d4b5f25e4706dc8777f6f64d66482` | $0 | 🚩 Fake_Phishing1701177 |

### 💰 THE ACCUMULATOR — Wallet #4 (CRITICAL TARGET)

| Field | Value |
|-------|-------|
| **Address** | `0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6` |
| **Balance** | **$591,808 in ETH** |
| **Outgoing TXs** | **ZERO** |
| **Token Holdings** | Only junk FlashLoan spam token ($0 value) |
| **Status** | DORMANT — likely waiting for heat to die down |
| **Likely Next Move** | Tornado Cash, cross-chain bridge, or CEX deposit |

---

## EVM Chain #3 — BSC ($38.7K)

| Field | Value |
|-------|-------|
| **Address** | `0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482` |
| **Balance** | 38,746.50 Binance-Peg USDC |
| **TXs** | 0 external, 1 internal (Allbridge incoming) |
| **Funded By** | Allbridge Core Bridge (`0x3c4fa639...312f`) |
| **Status** | **UNTOUCHED** — parked USDC, no swaps or transfers yet |

---

## The Phishing Network

The attacker is NOT a solo operator. Gas funding came from **Etherscan-flagged phishing wallets**:

| Label | Address | Appearances |
|-------|---------|-------------|
| **Fake_Phishing1701177** | `0xd7e42d9502fbd66d90750e544e05c2b3ca7cbd22` | **3x** (most active) |
| **Fake_Phishing1064860** | `0x8d8210a0252a706cb5de0c6f8e46b6d3692afc19` | 2x |
| **Fake_Phishing1674496** | `0x1ae0e997216f7a354eda202b5cb3352b9dafadff` | 1x |
| **Fake_Phishing1648144** | `0x2393d38400cad1d0ffae85b37d76de05bb7eddc6` | 1x |

**`Fake_Phishing1701177`** is the primary gas supplier — appears 3 times across both vanity rings. This is the strongest link to the broader criminal network.

---

## Complete Address Registry

### Stellar — Attacker
```
ATTACKER:         GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC
USTRY ISSUER:     GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC
COUNTERPARTY:     GABFRFPYM2BXM4OM2ZA4YDBWY4CMPVESHQMKXSM47MWWJD4TW2KQDWWN
```

### Stellar — Blend Protocol / SDF Funding Network
```
# SDF Source
SDF_HOT_2:        GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH  [SDF Direct Development Hot 2]
SDF_CONDUIT:      GDDUETSYDSHJMU5J73WHR4SQOAWRUM5SNLHXBQKM36EQ244GHSRS5AHF  [SDF → Blend funding pipe]

# Blend Operator Cluster
BLEND_OPERATOR:   GCAI54XEZIEABT7KBVQ2BR7RNWYCFBA3DMFHW6U4KWRJAX4IJTHZQSRR  [Created GCA34H; 36K BLND]
BLEND_RELAY:      GD5Z6NYV3WT4VIQHTNKXDU4MDUBDHK6KGICDFJGJXP4NWPVCS4ZJPZNP  [XLM+BLND relay]
USDC_ROUTER:      GCB426VZ6DYX576HLZTA2X2C3CJT6ZDFNHCIIULPZYUNWC55QRFOFEI4  [USDC routing multisig]
INTERMEDIARY:     GDBKXCOAIER4ELKUSH2OMCZYN3XFVMZ4UMWLDWAW7OSIBDCO7JVUXE4Q  [13.45M XLM from SDF conduit]

# Treasury Accounts  
BLEND_TREASURY:   GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3  [Primary treasury — LIQUIDATED, 70.68M XLM]
SIBLING_RESERVE: GCUIXCRGWHF45VJTEAVRUZK37ET4KTHI26H5DL34B2XVBTKCOLQHWGVD  [2M PYUSD + multi-currency reserve]

# Token
BLND_ISSUER:      GDJEHTBE6ZHUXSWFI642DCGLUOECLHPF3KSXHPXTSTJ7E3JF6MQ5EZYY  [Locked SAC issuer — real BLND]
SHARED_SIGNER:    GDSZIVR5B776NB5RMS267M4JSRBFPJUMZCCURAV6PYAFPI3OV7LIMSQI  [Links GCB426VZ + GCUIXCR]

# Liquidators
XLIQ:             GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ  [Primary liquidator; took 70.68M XLM]
GAIN2:            GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF  [31 fills]

# XLIQ Funding Network (5-hop capital chain)
XLIQ_TREASURY:    GCYVR6JS6DLRAFF2HEC6LN7J6H6JS2VMERCTGV64RESTZAJMOHB5RHU7  [...RHU7 — XLIQ creator & treasury; $1.84M]
XLIQ_HUB:         GARRK37YX4667WZQQRXGUBYDZ3GHMLCHYNLOADYEQ5QTLGWALBHS3ILW  [...3ILW — Coinbase-origin capital hub; $4.8M; 466K payments]
RELAY_DISPATCH:   GDNHPXSFIZQMJJFBAFWUWG3442AHGI3WEWUYRYXIGMJRHDUQOPHTKLDC  [...KLDC — relay dispatcher; spawns + recycles throwaway relay accounts]
RELAY_ENVELOPE:   GCPOK3AAEM2AQLIYQREROXZ7R6RN7CNKO5CTVX2VRWRDOTMMCZV7TWA2  [...TWA2 — single-use relay; 12-sec lifespan; deleted via account_merge]
SPOOF_ORIGIN:     GC7BKVSFWQPVSHINTTXEIVI6EK2Z2YW245RA7KRODJA4EN27H2CMPJL5  [...PJL5 — [Spoofing] tag; home_domain=lobstr.co; created KLDC]
```

### EVM (Same address across Base/ETH/BSC)
```
MAIN ATTACKER:    0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482
ACCUMULATOR:      0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6   ← $591K PARKED
```

### Phishing Funders
```
PHISH_1701177:    0xd7e42d9502fbd66d90750e544e05c2b3ca7cbd22   ← PRIMARY GAS SUPPLIER
PHISH_1064860:    0x8d8210a0252a706cb5de0c6f8e46b6d3692afc19
PHISH_1674496:    0x1ae0e997216f7a354eda202b5cb3352b9dafadff
PHISH_1648144:    0x2393d38400cad1d0ffae85b37d76de05bb7eddc6
```

---

## Agent Playbook

### Priority Monitoring (Check These First)
1. **🔴 Accumulator Wallet** — `0x0b2B16E1...3eC6` 
2. **🟠 BSC USDC** — `0x2d1ce29b...6482` 
3. **🟡 Stellar XLM** — `GBO7VUL2...2WXC` 

### Tools & APIs
- **Stellar:** `https://horizon.stellar.org/accounts/{address}/operations?limit=50&order=desc`
- **Stellar Trades:** `https://horizon.stellar.org/accounts/{address}/trades?limit=50&order=desc`
- **Etherscan:** `https://etherscan.io/address/{address}` and `/tokentxns?a={address}`
- **BaseScan:** `https://basescan.org/address/{address}`
- **BscScan:** `https://bscscan.com/address/{address}`
