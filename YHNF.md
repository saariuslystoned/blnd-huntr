# YHNF Identity Deep Dive

`GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF`

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

## Controller: `GDDYERCLIKAEDJJQI6XWWPLTOZ7OPOH26LFLNUD43QP4UEH34YEOV4A7`

This 4-signer multisig (weights 8/8/8/1) is the clearest link to YHNF's operator:

- Sent YHNF **100,000 BLND** (2025-08-20) + **276,632 BLND** (2025-08-27) — BLND distribution for protocol participation
- Sent YHNF **80,000 USDC** on **2026-02-22** (exploit day) — operating capital wired in same day as liquidations
- Signers: `GAMEYWUCSHCK3IOJWA5I`, `GCIPGRNCW7KBJZXRZ`, `GDOVD6A6YCU2J2ZPRA` (wt=8 each)

## BLND Whale Connection: `GCJ2VBYRO4BO3BHCGN7EMSTKBLQXMUTS67PFHUJBZOCCQGLOQN5XFKOG`

Holds **7,579,191 BLND** — one of the largest BLND holders on-chain (likely Blend DAO treasury or protocol reserve). This account:
- Sent YHNF **699,990 BLND** in Dec 2025, received **700,000 BLND** back in Jan 2026
- The round-trip suggests BLND was temporarily delegated to YHNF for voting/staking, then recalled

## Operator Cluster — YHNF, GASND, and GBAQG3 Are Co-Participants

`GASND6BBFGDGWDLP2DJCFDAKL7GHHZAYQ6PENFHSHMLEMFKAVLZCDQXJ` (**Fill #56** in the auction report) also sent BLND to YHNF. This clusters YHNF and GASND as accounts operated by the same entity — likely a Blend-community-aligned operator group.

## Creation Timing is Suspicious

YHNF was created **2025-04-15** — 8 days before `G...SXI3` (the Blend Treasury) was created on **2025-04-23**. Both accounts were set up in the same April 2025 operational window, suggesting YHNF was prepared as a liquidation bot in parallel with the treasury deployment.

## Key Finding

**No direct link to SDF or the attacker.** YHNF is a professional, protocol-connected Blend liquidation operator — likely run by a Blend DAO participant or aligned MEV firm. It was seeded with BLND by a large protocol-level holder and received USDC from a 4-signer controller on the day of the exploit. The 31 fills and 10.6M XLM profit place it squarely as the second-largest beneficiary of the liquidation cascade after `G...XLIQ`.

## Post-Exploit Activity

After completing its 31 fills, YHNF began creating **claimable balances** — distributing its seized collateral (XLM, CETES, USDC, EURC, USDGLO) to the controller multisig `G...V4A7`. This is consistent with a bot returning profits to its operator wallet via Stellar's native claimable balance mechanism rather than a direct transfer, which avoids triggering on-chain payment alerts.
