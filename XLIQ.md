# XLIQ Identity Deep Dive

`GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ`

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

## Is XLIQ Affiliated with YieldBlox DAO?

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
