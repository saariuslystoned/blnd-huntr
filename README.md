# 🕵️ USTRY Oracle Manipulation — Blend Pool Investigation

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

This workspace tracks the **February 2026 USTRY oracle manipulation** that drained the Blend Protocol (YieldBlox Pool) on the Stellar network. **Blend and the Reflector Oracle both functioned exactly as designed.** The attacker exploited the thin on-chain liquidity of USTRY — a low-volume asset — to artificially inflate its DEX price, which the oracle read as the real market price. With USTRY collateral suddenly valued at an inflated rate, the attacker borrowed ~61.2 million XLM against it and walked away. The Blend protocol and community were the target; no code was broken.

---

## Table of Contents

- [Exploit Mechanics](#exploit-mechanics)
- [Liquidation Cascade (Post-Exploit Auctions)](#liquidation-cascade-post-exploit-auctions)
- [G...XLIQ — Liquidator Deep Dive](XLIQ.md)
- [G...YHNF — Liquidator Deep Dive](YHNF.md)
- [G...SXI3 — SDF Pool Position Deep Dive](#gsxi3--sdf-pool-position-deep-dive)
- [SDF Funding Network](#sdf-funding-network)
- [Stellar — Attacker Infrastructure](#stellar--attacker-infrastructure)
- [XLM Laundering Network](#xlm-laundering-network)
- [Cross-Chain Bridge (Allbridge)](#cross-chain-bridge-allbridge)
- [EVM Chain #1 — Base ($787K)](#evm-chain-1--base-787k)
- [EVM Chain #2 — Ethereum ($172K)](#evm-chain-2--ethereum-172k)
- [EVM Chain #3 — BSC ($38.7K)](#evm-chain-3--bsc-387k)
- [The Phishing Network](#the-phishing-network)
- [Complete Address Registry](#complete-address-registry)

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
  │      ]                                                # ← TWAP uses 2 inflated + 2 normal = ~51x effective boost
                                                          # ← oracle posts every 5 min; price was inflated 5+ min
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

The Reflector Oracle posts a new price every **5 minutes** (300-second intervals). The exploit borrow transaction closed at **00:24:27 UTC**. Working back from that anchor:

| Unix Timestamp | UTC Time | USTRY Price (raw) | Status |
|----------------|----------|-------------------|--------|
| 1771718700 | 00:05:00 UTC | 105,742,642,288,368 | ✅ Normal |
| 1771719000 | 00:10:00 UTC | 105,742,379,403,813 | ✅ Normal |
| **1771719300** | **00:15:00 UTC** | **10,673,728,301,028,137** | **⚠️ 100x JUMP — manipulation captured** |
| **1771719600** | **00:20:00 UTC** | **10,673,728,301,028,137** | **⚠️ Still inflated** |

The price of USTRY jumped **~100x** at 00:15 UTC — over 9 minutes before the borrow. The oracle did not malfunction; it read the DEX price, which the attacker had already manipulated via thin USTRY liquidity. The oracle confirmed the inflation again at 00:20, and the attacker executed the borrow at 00:24:27 UTC.

#### ⏱️ Attack Timeline

```
< 00:15:00 UTC   Attacker manipulates USTRY DEX pool price on Stellar
                 (thin liquidity = small trade moves price dramatically)

  00:15:00 UTC   Reflector Oracle posts → reads manipulated DEX price
                 USTRY: ~1.06 USDC → ~106.7 USDC (100x inflated)
                 [first inflated reading — TWAP clock starts]

  00:20:00 UTC   Reflector Oracle posts again → price still inflated
                 [second inflated reading — TWAP now has 2/4 periods inflated]
                 TWAP effective multiplier: ~51x above normal

  00:24:27 UTC   Attacker executes borrow on Blend Pool
                 61,249,278 XLM borrowed against ~$159K of real USTRY collateral
                 Pool drained instantly
```

> **Minimum manipulation window: 9+ minutes** (00:15 first inflation → 00:24:27 borrow). The attacker kept the USTRY DEX price inflated across two consecutive oracle windows and executed the borrow 4 min 27 sec after the final confirmation. This rules out flash-loan style atomicity — sustained DEX position required.

---

## Full Exploit Impact Flow

```
ATTACKER (GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC)
  │
  ├─ supplies ~150K USTRY as collateral (real value ~$159K)
  ├─ manipulates USTRY DEX pool → Reflector Oracle reads inflated market price (~100× above real)
  └─ borrows 61,249,278 XLM against the inflated collateral value (never repaid)
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
| **`G...XLIQ`** | **19** | **$12,459,547** | **91.4%** | 1,447,148 | 33.0% |
| **`G...YHNF`** | **31** | **$901,336** | **6.6%** | 2,940,948 | 67.0% |
| `G...LEND` | 7 | $260,778 | 1.9% | — | — |
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

## G...SXI3 — SDF Pool Position Deep Dive

The largest liquidated position — `GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3` — was not a retail user. It is an institutional multisig account that represents **SDF's own liquidity position** in the Blend pool. SDF managed these funds directly — Blend is an open-source protocol with no protocol-level treasury.

| Field | Value |
|-------|-------|
| **Address** | `GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3` |
| **Created** | 2025-04-23T19:36:24Z |
| **Home Domain** | None |
| **Multisig** | ✅ 11 signers — thresholds Low:1 / Med:4 / High:6; self=weight 200 |
| **Created by** | `GCAI54XEZIEABT7KBVQ2BR7RNWYCFBA3DMFHW6U4KWRJAX4IJTHZQSRR` (holds 36,702 BLND) |
| **Current Holdings** | ~$11.5M: 11.1M USDC, 1.86M CETES, 919K XLM, 37.9K EURC, 27.8K USDGLO |
| **Liquidated for** | ~70.68M XLM collateral (fills #12–18, 2-minute window) |

**Why this is SDF's pool position (not a protocol treasury):**
1. Blend is an open-source protocol — it has no treasury. Script3 built it; SDF funded this position directly.
2. SDF funded it with ~511.8M XLM across 17 wires via the SDF Conduit
3. 11-signer institutional multisig — matches SDF's internal governance structure
4. $11M in stablecoins + yield assets (USDC, CETES, EURC) — SDF's LP reserves
5. Held the largest Blend pool collateral position by far (~77.8M XLM liquidated)

---

## SDF Funding Network

On-chain investigation reveals that the liquidated SDF pool position (`G...SXI3`) was funded by a network of accounts traceable directly to the **Stellar Development Foundation (SDF)**.

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

### G...5AHF → G...SXI3 Direct XLM Wire History (Full Audit)

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

**98.8% of all XLM ever deposited into SDF's pool position came from the SDF network.** The ~70.68M XLM that was liquidated in the exploit is the pool's outstanding collateral position at exploit time — the rest had been lent, earned yield, or cycled back through the protocol over 10 months of operation.

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

SDF deployed capital into `G...SXI3`, making it the largest single position in the pool by a wide margin — **77.85M XLM** of collateral. When the oracle exploit hit:

- `G...SXI3` was forcibly liquidated across 9 fills, yielding the overwhelming majority of all seized collateral
- `G...XLIQ` captured **76.4M XLM** total across all 60 fills (91.4% of all priced collateral at $0.1609 = **~$12.3M**) — with the SDF position as its primary source
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
| **Oracle Probe (main)** | [`dc4f41194b383f5aade3cdb4d249dfd4fd9b641ab1c7cfbc08a23a5ac29a4cda`](https://stellar.expert/explorer/public/tx/dc4f41194b383f5aade3cdb4d249dfd4fd9b641ab1c7cfbc08a23a5ac29a4cda) | Created sell offer: 0.025 USTRY at 501 USDC/USTRY. **Never filled.** |
| **Oracle Probe (2nd)** | [`13f105857ca9988e6b596f0405bb1f11e79b1de6bbf6b1b16d4c8daea7208c83`](https://stellar.expert/explorer/public/tx/13f105857ca9988e6b596f0405bb1f11e79b1de6bbf6b1b16d4c8daea7208c83) | Feb 21 04:53 — Sell 0.5796 USTRY @ 496.06 USDC. Later cancelled. |
| **Cancel Probe** | [`26b1b8dc0026ced416b27500f4cb9bfab4a6f558817da3c3a6354f45c9ca4698`](https://stellar.expert/explorer/public/tx/26b1b8dc0026ced416b27500f4cb9bfab4a6f558817da3c3a6354f45c9ca4698) | Feb 21 18:27 — Cancelled the 496 USDC offer (offer_id 1824691203) |
| **Create Burner** | [`4704f1ca552b78db0c96a011e3d0a3b28f32a19fc9753f6128d588d064604b76`](https://stellar.expert/explorer/public/tx/4704f1ca552b78db0c96a011e3d0a3b28f32a19fc9753f6128d588d064604b76) | Feb 21 23:35 — Created SDEX manipulation account with 15 XLM |
| **Fund Burner** | [`aab3a6054bdf4687e49d68ee4353f0ab7eccfb5101876578ab6d526864d93a1d`](https://stellar.expert/explorer/public/tx/aab3a6054bdf4687e49d68ee4353f0ab7eccfb5101876578ab6d526864d93a1d) | Feb 21 23:37 — Sent 1.237 USTRY to burner account |
| ⚠️ **PATH TEST** | [`f6729b837ae09452345817ce4bdaec601219d2ae9492c3264bc383fb36212533`](https://stellar.expert/explorer/public/tx/f6729b837ae09452345817ce4bdaec601219d2ae9492c3264bc383fb36212533) | Feb 21 23:59 — path_payment: 0.0001 USTRY → XLM via LIBRE → SOLS |
| **Supply Collateral** | [`a1577284fab9397211abe07e336e3885ff89e1f0d6dafbfff801b98560c5375b`](https://stellar.expert/explorer/public/tx/a1577284fab9397211abe07e336e3885ff89e1f0d6dafbfff801b98560c5375b) | Feb 22 00:04 — `submit()` to Blend Pool (USTRY collateral supply) |
| **Blend Submit** | [`01c2ba7553c2e22d64adca8849a30f296c76fcd91f49a2eca383113d7d307b8b`](https://stellar.expert/explorer/public/tx/01c2ba7553c2e22d64adca8849a30f296c76fcd91f49a2eca383113d7d307b8b) | Feb 22 00:20 — `submit()` to Blend Pool (position update after oracle reads inflated price) |
| **USTRY Dump 1** | [`dd0935766d9cc1caea8adcf5eaa8641fbc4b1b89edb88cc8cf0da823d8311890`](https://stellar.expert/explorer/public/tx/dd0935766d9cc1caea8adcf5eaa8641fbc4b1b89edb88cc8cf0da823d8311890) | Feb 22 00:21 — Buy 13,000 USDC worth of USTRY @ 1.059 (dumping stolen USTRY) |
| **USTRY Dump 2** | [`311ee91e5ad3ae020dd2ffffee87d55acc8f4c944ed89e076b70e4642dc9287e`](https://stellar.expert/explorer/public/tx/311ee91e5ad3ae020dd2ffffee87d55acc8f4c944ed89e076b70e4642dc9287e) | Feb 22 00:22 — Buy 140,000 USDC worth of USTRY @ 1.063 (bulk dump) |
| ⚡ **MAIN EXPLOIT** | [`3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657`](https://stellar.expert/explorer/public/tx/3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657) | Feb 22 00:24:27 — `submit(request_type=4)` → Borrowed **61,249,278.3 XLM** from Blend Pool |
| **Bridge Txs** | Multiple `swap_and_bridge` calls | Feb 22 00:28+ — Batched ~50K USDC per call to EVM via Allbridge |

### 🔴 SDEX Manipulation Account (THE SMOKING GUN)

The attacker used a **single-purpose burner account** to place the 100x price manipulation offer on the Stellar DEX. This account had only **8 operations** in its entire lifetime:

| Field | Value |
|-------|-------|
| **Burner Address** | `GCNF5GNRIT6VWYZ7LXUZ33Q3SR2NUGO32F5X65VVKAEWWIQCKGYN75HB` |
| **Created** | Feb 21, 2026 23:35:54 UTC |
| **Funded by** | Attacker main account (`GBO7VUL...`) with 15 XLM |
| **Purpose** | Place inflated USTRY sell offer for oracle to read |
| **Cost of attack** | ~15 XLM + 1.24 USTRY ≈ **~$4 total** |

**Complete burner account operation sequence:**

| # | Time (UTC) | TX Hash | Operation |
|---|-----------|---------|-----------|
| 1 | Feb 21 23:35:54 | [`4704f1ca...604b76`](https://stellar.expert/explorer/public/tx/4704f1ca552b78db0c96a011e3d0a3b28f32a19fc9753f6128d588d064604b76) | `create_account` — 15 XLM from attacker |
| 2 | Feb 21 23:36:05 | [`c047a9d7...d93536`](https://stellar.expert/explorer/public/tx/c047a9d795a371ed7ae8b39a80f05df0d284364843eb3ea039b44c03bdd93536) | `change_trust` — Added USDC trustline |
| 3 | Feb 21 23:36:28 | [`fe40fc21...adc9e8`](https://stellar.expert/explorer/public/tx/fe40fc21ac441bcade857ccfdc56e2a9696985d581c378be55bff6e2e3adc9e8) | `manage_sell_offer` — Sold 1 XLM for USDC @ 0.161 (seed funds) |
| 4 | Feb 21 23:36:50 | [`e66ba20d...accd24`](https://stellar.expert/explorer/public/tx/e66ba20df5a781f239132361aadee46f0b9a7457fb6b08915d773695b8accd24) | `change_trust` — Added USTRY trustline |
| 5 | Feb 21 23:37:52 | [`aab3a605...d93a1d`](https://stellar.expert/explorer/public/tx/aab3a6054bdf4687e49d68ee4353f0ab7eccfb5101876578ab6d526864d93a1d) | `payment` — Received **1.237 USTRY** from attacker |
| 6 | **Feb 21 23:38:51** | [**`09e1a9d1...637cdb`**](https://stellar.expert/explorer/public/tx/09e1a9d1197c9bf0af4e87da328c4f2d5eb49b487630aa61991fb5c1c4637cdb) | **🔴 `manage_sell_offer` — SELL 1.2185 USTRY @ 106.7372828 USDC** |
| 7 | Feb 21 23:39:31 | [`3b504c31...0c3aa4`](https://stellar.expert/explorer/public/tx/3b504c319bdadf1e3ec49cc9d186083b1ef84c84af219bc0d4bab2bc700c3aa4) | `manage_buy_offer` — Buy 0.0001 USDC for USTRY @ 1.057 (normal-price decoy) |
| 8 | Feb 22 00:11:16 | [`16215fc1...1e2c9b`](https://stellar.expert/explorer/public/tx/16215fc1daa3bab99b0039d8eb37942a8db4a391c48768fb8cc81ccd8c1e2c9b) | `manage_buy_offer` — Cancel buy offer (amount=0, cleanup) |

> **TX #6 placed the inflated offer.** But placing an order alone doesn't move the oracle — a trade must execute. At **00:10:21 UTC**, a second attacker-controlled account (`GDHRCQNC...`) bought 0.05 USTRY against this offer at the 106.7 price (TX below). **That trade is what the Reflector Oracle read as the market price** at 00:15 and 00:20 UTC.
>
> **Total cost to manipulate a $4.7M exploit: ~$4.**

### 🔴 Trade Trigger Account (THE PRICE-SETTING TRADE)

A second attacker-controlled account executed the actual trade that moved the oracle price:

| Field | Value |
|-------|-------|
| **Trigger Address** | `GDHRCQNC64UVL27EXSC6OG6I2FCT4NWM72KNHLHKEB3LK4MEEYYWETN3` |
| **Price-Setting TX** | [`60fe039e96e88402d175c8de68e80651874ab125880dd384a1636914ba95bef1`](https://stellar.expert/explorer/public/tx/60fe039e96e88402d175c8de68e80651874ab125880dd384a1636914ba95bef1) |
| **Time** | Feb 22, 2026 00:10:21 UTC |
| **Action** | `manage_buy_offer` — bought 0.0501 USTRY with 108 USDC limit → crossed burner's 106.7 sell offer |
| **Result** | 0.0501 USTRY traded at 106.74 USDC — **Oracle now reads this as the market price** |
| **Evidence of attacker control** | Same account was running identical micro-trade patterns on XCHF minutes earlier (23:41-23:47 UTC) |

**The 106.7 sell offer is still active** on the SDEX right now (offer_id `1824788980`, 1.1684 USTRY remaining).

### Actual USTRY Trading History (From Attacker's Main Account)

All executed trades on the main account were at **normal prices** (~1.058 USDC/USTRY). The 100x manipulation was done from the burner account above:

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



### Swap Hub Pattern (`G...MVZH`)

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
| 🔒 Frozen (Swap Hub) | `GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH` | 2,500,813 | $401,756 | 🔒 FROZEN |
| 🔒 Frozen (Funder/Ops) | `GC2XJKN5VZEMM35F5LRSUP5CWVDZJVM37YKR7UYYXGN3TGKZXMP5FZIB` | 450,490 | $72,371 | 🔒 FROZEN |
| **🔒 Total Frozen** | | **48,019,602** | **$7,714,849** | |
| 💱 Converted to USDC | `GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH` | ~5,000,187 | $803,705 realized | Bridged to Base |
| 🚨 Binance (via Relay) | `GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6` | 3,536,146 | $568,234 | **KYC** |
| 🚨 Binance (via Small) | `GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6` | 233,610 | $37,531 | **KYC** |
| ⚠️ ChangeNow (no KYC!) | `GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY` | 3,965,831 | $637,111 | **NO KYC** |
| **🚨 Total Moved** | | **12,735,774** | **$2,046,581** | |
| Dust — ChangeNow wallet | `GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY` | 21,511 | $3,456 | Residual after forwarding |
| Dust — Relay wallet | `GDTSFMKTLD2WTQSOWK36QB4A5VTHI54Q67ZDSKAWULAKKN6QVX6LTHQC` | 10,681 | $1,716 | Residual after relaying to Binance |
| Stellar tx fees | (all wallets) | ~2,000 | ~$321 | ~100 stroops × ~20K ops |
| **TOTAL (tracked)** | | **~60,789,568** | | mootz12 confirmed ~61.25M; ~460K gap untracked |

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

## EVM Chain #2 — Ethereum ($886K)

| Field | Value |
|-------|-------|
| **Address** | `0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482` |
| **Etherscan Label** | **YieldBlox Exploiter 2** |
| **Balance** | ~$886,239 (92% of multichain total) |
| **Total TXs** | 45 |
| **Funded By** | Allbridge Core Bridge |
| **Swaps** | 9x Uniswap V4 Universal Router (`0x66a9893cc07d91d95644aedd05d03f95e1dba8af`) |
| **Downstream** | Bulk ETH forwarded to Exploiter 3 (Accumulator) |
| **🔴 ACTIVE** | 12+ Relay Protocol swaps — **Feb 23, 09:17–09:26 UTC** |

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

### 💰 THE ACCUMULATOR — Wallet #4 / YieldBlox Exploiter 3

| Field | Value |
|-------|-------|
| **Address** | `0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6` |
| **Etherscan Label** | **YieldBlox Exploiter 3** |
| **Balance** | **$565,483 in ETH** (100% on Ethereum) |
| **Total TXs** | 6 |
| **Funded By** | **YieldBlox Exploiter 2** (`0x2D1C...6482`) |
| **Outgoing TXs** | **ZERO** |
| **Token Holdings** | Only junk FlashLoan spam token ($0 value) |
| **Status** | 💤 DORMANT — parked funds, no movement since deposit |

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

## 🚨 Etherscan-Labeled Exploiter Wallets (3 Confirmed)

Etherscan has officially tagged **three** attacker wallets. All are EOAs (not multisigs):

| Etherscan Label | Address | Balance | Chains | Funded By | Status |
|-----------------|---------|---------|--------|-----------|--------|
| **YieldBlox Exploiter 1** | `0xE69f6d77DB6Ff493FDD15D8A0B390c36E18E5b21` | **$710,177** | ETH ($686K) + Base ($24K) | **Binance 14** | ⚠️ Active 1 day ago |
| **YieldBlox Exploiter 2** | `0x2D1CE29b4aF15fb6e76Ba9995BbE1421E8546482` | **$961,471** | ETH ($886K) + BNB ($38K) + Base ($36K) | Allbridge Core Bridge | 🔴 **Active — laundering** |
| **YieldBlox Exploiter 3** | `0x0b2B16E1a9E2e9b15027AE46Fa5eC547f5ef3eC6` | **$565,483** | ETH only (100%) | Exploiter 2 | 💤 Dormant |
| | | **$2,237,131** | | | **TOTAL EVM-side** |

**Key findings:**
- **Exploiter 1 was funded by Binance 14** — a major exchange hot wallet. This implies either a KYC'd withdrawal or a Binance bridge conversion. Potentially traceable.
- **Exploiter 3 is a child wallet of Exploiter 2** — direct ETH transfer, used as a parking address.
- All three received the same spam FlashLoan token airdrop ($0 value).

---

## 🔴 Active Fund Movement — Feb 23, 2026 (6 Hours Ago)

**Exploiter 2 was actively moving funds THIS MORNING** (~09:17–09:26 UTC, Feb 23, 2026). This is the most recent attacker activity observed — and the picture is more complex than simple laundering.

### Net Result: CONSOLIDATION, Not Exit

The attacker pulled **~390 ETH (~$736K) INTO Exploiter 2 from Base** using **two bridge protocols simultaneously**, while only sending **10 ETH out** to Base. This suggests the attacker is **consolidating** on Ethereum mainnet — possibly preparing for a large single move.

| Direction | Protocol | Source → Dest | # TXs | ETH Sent | ETH Received | USD Value |
|-----------|----------|--------------|-------|----------|--------------|----------|
| **IN** | Relay | Base → ETH | 12 | 240 ETH | ~239.94 ETH | ~$451,716 |
| **IN** | Across | Base → ETH | 10 | 160 ETH | ~149.89 ETH | ~$282,659 |
| **OUT** | Relay | ETH → Base | 1 | 10 ETH | 9.999987 ETH | ~$18,827 |
| | | | **23** | | **~379.83 ETH net in** | **~$715,548** |

### Relay Inflows (~240 ETH from Base)

**Relay: Solver** (`0xf70da97812CB96acDF810712Aa562db8dfA3dbEF`) settled 12 cross-chain swaps, each originating as **20 ETH on Base** and arriving as ~19.99 ETH on Ethereum (after bridge fees), across consecutive blocks (24518643–24518683):

| Block | TX Hash (truncated) | ETH | Direction |
|-------|---------------------|-----|-----------|
| 24518643 | `0x41ee47e7...` | ~19.99 | IN ← Relay: Solver |
| 24518647 | `0x71e562df...` | ~19.99 | IN ← Relay: Solver |
| 24518651 | `0x4b4a875d...` | ~19.99 | IN ← Relay: Solver |
| 24518655 | `0x31228a0c...` | ~19.99 | IN ← Relay: Solver |
| 24518659 | `0x2ca17c9c...` | ~19.99 | IN ← Relay: Solver |
| 24518662 | `0x62eca5af...` | ~19.99 | IN ← Relay: Solver |
| 24518665 | `0x64d3afe3...` | ~19.99 | IN ← Relay: Solver |
| 24518669 | `0xae86b158...` | ~19.99 | IN ← Relay: Solver |
| 24518672 | `0x823811dc...` | ~19.99 | IN ← Relay: Solver |
| 24518677 | `0x807f32c8...` | ~19.99 | IN ← Relay: Solver |
| 24518680 | `0xe4294cfe...` | ~19.99 | IN ← Relay: Solver |
| 24518683 | `0x45fe0286...` | ~19.99 | IN ← Relay: Solver |

These are cross-chain swap settlements — the attacker bridged assets from other chains (Base, BNB, etc.) and Relay's solver settled them as ETH on mainnet.

### Across Protocol Inflows (~150 ETH from Base)

**Across Protocol: Ethereum Spoke Pool V2** sent 10 internal ETH transfers from Base to Exploiter 2 on Ethereum, 1 hour before the Relay burst:
- 7 txns × 10 ETH (→ ~9.99 ETH received each)
- 1 txn × 20 ETH (→ ~19.98 ETH received)
- 1 txn × 50 ETH (→ ~49.96 ETH received) — the single largest bridge tx
- 1 txn × 10 ETH (→ ~9.99 ETH received)

Across is a separate cross-chain bridge — the attacker used **two bridge protocols back-to-back** (Across first, then Relay) to drain funds from Base to Ethereum.

### The 10 ETH Outbound (TX `0x931ca8a1...`)

At 09:17:11 UTC, Exploiter 2 bridged **10 ETH** from Ethereum → Base via Relay, receiving **9.999987 ETH** on Base. This was sandwiched between the Across inflows (7 hrs ago) and the Relay inflows (6 hrs ago), suggesting the attacker was actively managing liquidity across both chains in the same session.

### Why This Matters

1. **The attacker is CONSOLIDATING, not scattering** — ~$717K net flowed INTO Exploiter 2. This changes the risk profile: a large outbound move may be imminent.
2. **Using multiple bridge protocols** — Relay AND Across Protocol simultaneously, suggesting sophistication and urgency.
3. **Ignoring the bounty deadline** — This activity occurred **~12 hours after** the Security Council sent the 10% white-hat bounty ultimatum. The attacker chose to manage funds instead of negotiate.
4. **Automated execution** — 23 txns in ~10 minutes across consecutive blocks indicates a script or bot.
5. **~19.99 ETH per batch** — The uniform size suggests deliberate transaction structuring, possibly to stay under certain monitoring thresholds.

---

## 📩 YieldBlox Security Council — Negotiation Attempt

**Timeline:** Feb 22, 2026 — 21:35–22:06 UTC (Stellar) / ~21:51–22:01 UTC (Ethereum)

The YieldBlox DAO Security Council (`GBCA...ZSS4`) attempted to contact the attacker via **two channels simultaneously**:

### Channel 1: Stellar Data Entries
The Council sent 10 XLM and set `manage_data` entries on the attacker's account pointing to the Ethereum IDM transactions:

| Data Entry | Value |
|-----------|-------|
| `ethereum-idm-tx-hash-1` | `0x7979c9faa2eba7afa29702382205930f77a461174d4eeeb3382e22bb7177171e` |
| `ethereum-idm-tx-hash-2` | `0x174c928e9246419b899ee0a81acfa53b283bdc8ba56bc4fd51f97d17e7488913` |
| `ethereum-idm-tx-hash-3` | `0x465a92087d1e0ef62e91820e62ec9dac2f8d797df63f0513b8ff8cb260d346d4` |

### Channel 2: Ethereum IDM (Inter-chain Data Messages)
The Council's messenger wallet (`0x456c2F5F3536b1D9238F4654D5242B0dF8f978AF`, funded by Coinbase) sent 0 ETH IDM transactions to all 3 exploiter wallets:

| TX Hash | To | Etherscan Label |
|---------|-----|-----------------| 
| `0x7979c9faa2...` | `0xE69f...5b21` | YieldBlox Exploiter 1 |
| `0x174c928e92...` | `0x2D1C...6482` | YieldBlox Exploiter 2 |
| `0x465a92087d...` | `0x0b2B...3eC6` | YieldBlox Exploiter 3 |

**Message content (embedded in tx input data):**
> The YieldBlox Security Council is reaching out in response to your exploit on the YieldBlox V2 Blend pool. We want to offer you a **10% white-hat bounty** on the total amount stolen. If you return **90% of the funds within 72 hours**, we will stop pursuing legal action. Your 3 Stellar accounts have been frozen by the Tier 1 Validators... they hold **48M XLM**. Please contact us securely & anonymously: **gm@script3.io**

### Attacker Response
**NONE.** As of Feb 23 16:00 UTC — no outbound transactions, no data entry responses, no messages from any of the 3 exploiter wallets back to the messenger address. The attacker's only response has been to **continue laundering** via Relay Protocol ~12 hours later.

### Messenger Wallet
| Field | Value |
|-------|-------|
| **Address** | `0x456c2F5F3536b1D9238F4654D5242B0dF8f978AF` |
| **Balance** | 0.012 ETH (~$22) |
| **Funded By** | Coinbase |
| **Purpose** | Burner wallet — used exclusively to deliver the IDM negotiation messages |

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
SDEX MANIPULATOR: GCNF5GNRIT6VWYZ7LXUZ33Q3SR2NUGO32F5X65VVKAEWWIQCKGYN75HB  [Burner — placed 100x USTRY offer]
TRADE TRIGGER:    GDHRCQNC64UVL27EXSC6OG6I2FCT4NWM72KNHLHKEB3LK4MEEYYWETN3  [Triggered the trade that set oracle price]
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

### EVM — Etherscan-Labeled Exploiter Wallets
```
EXPLOITER 1:      0xE69f6d77DB6Ff493FDD15D8A0B390c36E18E5b21   ← $710K — funded by Binance 14
EXPLOITER 2:      0x2D1CE29b4aF15fb6e76Ba9995BbE1421E8546482   ← $961K — ACTIVE LAUNDERING via Relay
EXPLOITER 3:      0x0b2B16E1a9E2e9b15027AE46Fa5eC547f5ef3eC6   ← $565K — DORMANT (child of Exploiter 2)
MESSENGER:        0x456c2F5F3536b1D9238F4654D5242B0dF8f978AF   ← Security Council IDM sender (Coinbase-funded)
```

### Phishing Funders
```
PHISH_1701177:    0xd7e42d9502fbd66d90750e544e05c2b3ca7cbd22   ← PRIMARY GAS SUPPLIER
PHISH_1064860:    0x8d8210a0252a706cb5de0c6f8e46b6d3692afc19
PHISH_1674496:    0x1ae0e997216f7a354eda202b5cb3352b9dafadff
PHISH_1648144:    0x2393d38400cad1d0ffae85b37d76de05bb7eddc6
```

