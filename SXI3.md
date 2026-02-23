# SXI3 — SDF Pool Position Deep Dive

`GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3`

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
|---------|------|---------|
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
