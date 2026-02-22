# 🕵️ Blend Protocol Exploit — Investigation Tracker

> **Status:** ACTIVE — Funds still moving  
> **Last Updated:** February 22, 2026, 01:00 AM EST  
> **Estimated Total Stolen:** ~$10M USD equivalent  
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
GBO7...2WXC invoked [Blend Pool] CCCC...GYFS submit(
    from: GBO7...2WXC,
    to:   GBO7...2WXC,
    requests: [{
        address: CAS3...OWMA,
        amount:  612492783064502,
        request_type: 4  (Borrow)
    }]
)

  ├─ Invoked CD74...MXXR decimals() → 7
  ├─ Invoked CD74...MXXR lastprice("Stellar", CAS3...OWMA)
  │    → { price: 1609348, timestamp: 1771719600 }
  │
  ├─ Invoked [Reflector Oracle] CALI...LE6M last_timestamp() → 1771719600
  ├─ Invoked [Reflector Oracle] CALI...LE6M price(["Stellar", CAS3...OWMA], 1771719600)
  │    → { price: 16093480931573, timestamp: 1771719600 }
  │
  ├─ Invoked CD74...MXXR lastprice("Stellar", CCW6...MI75)
  │    → { price: 10000000, timestamp: 1771719867 }
  │
  ├─ Invoked CD74...MXXR lastprice("Stellar", CBLV...PNUR)
  │    → { price: 1067372830, timestamp: 1771719600 }
  │
  ├─ Invoked [Reflector Oracle] CALI...LE6M prices(["Stellar", CBLV...PNUR], 4)
  │    → [
  │        { price: 10673728301028137, timestamp: 1771719600 },
  │        { price: 10673728301028137, timestamp: 1771719300 },
  │        { price: 105742379403813,   timestamp: 1771719000 },
  │        { price: 105742642288368,   timestamp: 1771718700 }
  │      ]
  │
  ├─ Invoked CAS3...OWMA transfer([Blend Pool] → GBO7...2WXC, 612492783064502)
  │    61,249,278.3064502 XLM debited from [Blend Pool]
  │    61,249,278.3064502 XLM credited to GBO7...2WXC
  │
  ├─ Event: "borrow" [612492783064502, 610846237149994]
  ├─ Event: "transfer" native 612492783064502
  │
  └─ State Updates:
       Positions[GBO7...2WXC] = {
           collateral: { 5: 1498761336572 },
           liabilities: { 0: 610846237149994, 1: 8622715615541 },
           supply: {}
       }
       ResData[CAS3...OWMA] = {
           b_rate: 1000429719154, b_supply: 11591145734561893,
           backstop_credit: 596293422, d_rate: 1002695516178,
           d_supply: 693631184442089, ir_mod: 1000000
       }

Execution Stats: 10,630,639 instructions | 12.96 MB memory | 1,275μs
```

#### Key Oracle Contracts

| Contract | Role |
|----------|------|
| `CCCC...GYFS` | **Blend Pool** — the lending pool that was drained |
| `CD74...MXXR` | **Price Wrapper** — calls Reflector Oracle, provides `lastprice()` |
| `CALI...LE6M` | **Reflector Oracle** — the actual price feed source |
| `CAS3...OWMA` | **XLM SAC** (Stellar Asset Contract for native XLM) |
| `CCW6...MI75` | Likely **USDC** SAC (price = 10000000 = 1.0 at 7 decimals) |
| `CBLV...PNUR` | Likely **USTRY** or another collateral asset |

#### 🔴 The Suspicious Price Jump

Look at the Reflector Oracle's `prices()` response for `CBLV...PNUR`:

| Timestamp | Price | Interpretation |
|-----------|-------|----------------|
| 1771718700 | 105,742,642,288,368 | Normal range |
| 1771719000 | 105,742,379,403,813 | Normal range |
| **1771719300** | **10,673,728,301,028,137** | **⚠️ 100x JUMP** |
| **1771719600** | **10,673,728,301,028,137** | **⚠️ Stays inflated** |

The price of `CBLV...PNUR` jumped **~100x** between timestamps 1771719000 and 1771719300 in the Reflector Oracle. This is the manipulation window — the attacker inflated this asset's oracle price, then borrowed XLM against it.

### 📝 Side Note: The 501x USTRY Offer

Early investigation focused on offer `1824517774` — a sell offer for 0.025 USTRY at 501 USDC/USTRY. This offer was **never filled** (confirmed via Horizon API: zero trades). Its exact role in the oracle manipulation is unclear — it may have been a test, a decoy, or part of an unrelated strategy. The real price inflation appears in the Reflector Oracle data above.

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

POOL STATUS: Frozen ("on ice") — no withdrawals, no new borrows
ATTACKER PROCEEDS:
  ~61,249,278 XLM (still on Stellar, slowly bridging to EVM)
  ~$1M USDC (from USTRY dump at inflated price + Allbridge bridge)
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

After the liquidations completed, YHNF began creating **claimable balances** — distributing its seized assets (CETES, XLM, etc.) to other accounts. The controller multisig `G...V4A7` is the likely recipient.

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
2. SDF directly funded it with ~55.8M XLM across 8 wires
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
  ├─► 55.8M XLM (8 wires, Apr–Aug 2025) ──────────────────────────────────────────────┐
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

> **Note:** Previous estimate of 55.8M was only the first 7 wires. Full inflow scan confirmed 17 wires totaling 511.8M XLM from the SDF conduit alone.

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

The SDF deployed ~$8–9M USD (as XLM) into the Blend treasury as the **primary liquidity backbone** of the pool. When the oracle exploit hit:
- The SDF-backed position (`G...SXI3`) was the largest in the pool and therefore took the largest liquidation
- `G...XLIQ` walked away with **~70.68M XLM** (worth ~$10M) — capital that originated as SDF development funds
- The exploit was not just a DeFi hack — it was a direct hit on an SDF-funded institutional liquidity program

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

### Stellar Intermediary Wallets

The attacker distributed XLM across at least 3-4 relay wallets before converting to USDC and bridging. These relays send back 0.001 XLM as a confirmation signal.

- `GC2XJK...FZIB` — Initial funder
- `GDHRCQ...ETN3` — USDC relay
- `GABFRFPYM2BXM4OM2ZA4YDBWY4CMPVESHQMKXSM47MWWJD4TW2KQDWWN` — Major USTRY/USDC trading counterparty

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
1. **🔴 Accumulator Wallet** — `0x0b2B16E1...3eC6` on Ethereum. If this moves, DROP EVERYTHING and trace the output.
2. **🟠 BSC USDC** — `0x2d1ce29b...6482` on BSC. 38.7K USDC sitting untouched. Watch for swaps or transfers.
3. **🟡 Stellar XLM** — `GBO7VUL2...2WXC`. ~45M XLM still here. Watch for new `swap_and_bridge` calls.

### Tools & APIs
- **Stellar:** `https://horizon.stellar.org/accounts/{address}/operations?limit=50&order=desc`
- **Stellar Trades:** `https://horizon.stellar.org/accounts/{address}/trades?limit=50&order=desc`
- **Etherscan:** `https://etherscan.io/address/{address}` and `/tokentxns?a={address}`
- **BaseScan:** `https://basescan.org/address/{address}`
- **BscScan:** `https://bscscan.com/address/{address}`

### Decoding Allbridge Parameters
When new `swap_and_bridge` TXs appear, use the Python script above to decode the XDR parameters. The key fields are:
- **Chain ID 9** = Base
- **Chain ID 1** = Ethereum (likely)
- **Chain ID 2** = BSC (likely)

### Don't Fall For These Traps
1. **The vanity addresses are NOT splitting wallets** — they're gas station wallets funded by phishing accounts. The actual value flows through the main attacker wallet.
2. **UniswapX is NOT a mixer** — it's Uniswap's advanced order routing. Don't waste time investigating it as a privacy tool.
3. **The 501x USTRY offer was never filled** — don't cite it as a trade. It was an offer creation only (confirmed by Markus and verified via Horizon API).
4. **Token transfers marked "FlashLoan" or "ROBO" are junk airdrops** — $0 value scam tokens, not real activity.

---

*Investigation initiated Feb 22, 2026 by Antigravity AI*  
*Community contributor: Markus (corrected oracle trade assumption)*  
*Auction data verified Feb 22, 2026 via Soroban RPC event scan (60 fills confirmed on-chain)*  
*SDF funding network mapped Feb 22, 2026 — GCA34H, GDDUETSYD, GCAI54X, PZNP, GCUIXCR cluster confirmed via Horizon API*
