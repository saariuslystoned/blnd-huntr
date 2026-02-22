# Shared Constants — blnd-huntr

Both agents (frontend + backend) MUST reference this file for all addresses, endpoints, and config values. No hardcoding elsewhere.

---

## Stellar Addresses

| Key | Address | Role |
|-----|---------|------|
| `ATTACKER` | `GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC` | Primary attacker wallet (~45M XLM) |
| `BLEND_POOL` | `CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS` | Drained YieldBlox pool |
| `REFLECTOR_ORACLE` | `CALI2BYUJE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M` | Manipulated oracle |
| `PRICE_FEED` | `CD74A3C54EKUVEGUC6WNTUPOTHB624WFKXN3IYTFJGX3EHXDXHCYMXXR` | Correct price feed |
| `XLM_SAC` | `CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA` | XLM Stellar Asset Contract |
| `USTRY_TOKEN` | `CBLV4ATSIWU67CFSQU2NVRKINQIKUZ2ODSZBUJTJ43VJVRSBTZYOPNUR` | USTRY collateral token |
| `USTRY_ISSUER` | `GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC` | USTRY issuer account |
| `COUNTERPARTY` | `GABFRFPYM2BXM4OM2ZA4YDBWY4CMPVESHQMKXSM47MWWJD4TW2KQDWWN` | Major USTRY/USDC trading counterparty |
| `FUNDER` | `GC5H2VVVQ6FOP4HTORZBTZSUT2RWSBWQHZN6OFKM5XSPHN6PFD74FMOC` | Attacker's account funder |
| `LIQUIDATOR_PRIMARY` | `GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ` | Primary auction bot |
| `LIQUIDATOR_SECONDARY` | `GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF` | Secondary auction bot |
| `USDC_DEST` | `GDQ5LZIE57IUFMFVQUSDHJLAW4VP7QCN22GLSZTKEUVVH6DJLVFU2Q7F` | Liquidator USDC destination (~$401K sent) |

## EVM Addresses

| Key | Chain | Address | Status |
|-----|-------|---------|--------|
| `EVM_ATTACKER` | Base/ETH/BSC | `0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482` | Active |
| `ACCUMULATOR` | Ethereum | `0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6` | 🔴 $591K parked, ZERO outgoing |
| `USDC_BASE` | Base | `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913` | Circle USDC on Base |

### Vanity Gas Ring #1 (`0x0b2...3eC6` pattern)

| Address | Funded By |
|---------|-----------|
| `0x0B2bC0c2bd171c4701cfad713172c4b5b0053EC6` | Fake_Phishing1064860 |
| `0x0b2081a0d5515485d51606ba41d8ee186f303eC6` | Fake_Phishing1701177 |
| `0x0b2ce35351ecf2b36a2e965c394683d47a563eC6` | Fake_Phishing1674496 |
| `0x0b29aB4525acc3fed709b86fe5612734c6ef3eC6` | Fake_Phishing1648144 |
| `0x0b20E28bf0012a52e52f969fb6a0865854e93eC6` | Fake_Phishing1701177 |
| `0x0b2b400Bb655da6aeaaedd3a23260957c5bc3ec6` | `0xc3CbB870...22702b7F9` |

### Vanity Gas Ring #2 (`0x2D1...6482` pattern)

| Address | Funded By |
|---------|-----------|
| `0x2d1C87693a1242b1a0736d064bbe25f204eB6482` | Fake_Phishing1064860 |
| `0x2D107786363ed945e0255e7f27d3233aAB476482` | Fake_Phishing1701177 |
| `0x2D1005b0Db4d4b5f25e4706dc8777f6f64d66482` | Fake_Phishing1701177 |

### Phishing Funders

| Label | Address |
|-------|---------|
| `PHISH_1701177` | `0xd7e42d9502fbd66d90750e544e05c2b3ca7cbd22` |
| `PHISH_1064860` | `0x8d8210a0252a706cb5de0c6f8e46b6d3692afc19` |
| `PHISH_1674496` | `0x1ae0e997216f7a354eda202b5cb3352b9dafadff` |
| `PHISH_1648144` | `0x2393d38400cad1d0ffae85b37d76de05bb7eddc6` |

## API Endpoints

| Key | URL | Notes |
|-----|-----|-------|
| `HORIZON_BASE` | `https://horizon.stellar.org` | Public, no key needed |
| `STELLAR_EXPERT_TX` | `https://stellar.expert/explorer/public/tx/` | Prefix + TX hash |
| `STELLAR_EXPERT_ACCOUNT` | `https://stellar.expert/explorer/public/account/` | Prefix + address |
| `ETHERSCAN_API` | `https://api.etherscan.io/api` | Needs `ETHERSCAN_API_KEY` env var |
| `BASESCAN_API` | `https://api.basescan.org/api` | Needs `BASESCAN_API_KEY` env var |
| `BSCSCAN_API` | `https://api.bscscan.com/api` | Needs `BSCSCAN_API_KEY` env var |

## Allbridge Contracts

| Chain | Contract |
|-------|----------|
| Ethereum | `0x609c690e8f7d68a59885c9132e812eebdaaf0c9e` |
| BSC | `0x3c4fa639c8d7e65c603145adad8bd12f2358312f` |
| Base | *(identify from token transfer logs)* |

## Allbridge Chain IDs

| ID | Chain |
|----|-------|
| `1` | Ethereum (likely) |
| `2` | BSC (likely) |
| `9` | Base (confirmed) |

## Exploit Key Facts

| Fact | Value |
|------|-------|
| Exploit date | February 22, 2026, 00:24:27 UTC |
| Exploit ledger | 61340408 |
| XLM borrowed | 61,249,278.3 XLM |
| Estimated total stolen | ~$10M USD |
| Recovered | $0 |
| Current attacker XLM | ~45,068,274 XLM |
| Bridged to Base | ~$787K |
| Bridged to Ethereum | ~$172K |
| Bridged to BSC | ~$38.7K |
| Accumulator (ETH) | ~$591K parked |

## Priority Monitoring (Agent Playbook)

1. 🔴 **CRITICAL** — Accumulator `0x0b2B16E1...3eC6` on Ethereum. Any outgoing TX = DROP EVERYTHING.
2. 🟠 **HIGH** — BSC wallet `0x2d1ce29b...6482`. 38.7K USDC untouched.
3. 🟡 **MEDIUM** — Stellar attacker `GBO7VUL2...2WXC`. ~45M XLM remaining.

## File Structure Contract

Both agents must produce files that fit this structure:

```
blnd-huntr/
├── README.md                  (existing — DO NOT MODIFY)
├── CONSTANTS.md               (this file — DO NOT MODIFY)
├── requirements.txt           (backend agent creates)
├── scripts/
│   ├── config.py              (backend agent — imports from CONSTANTS.md values)
│   ├── monitor_stellar.py     (backend agent)
│   ├── monitor_evm.py         (backend agent)
│   ├── decode_allbridge.py    (backend agent)
│   └── fund_flow.py           (backend agent)
└── dashboard/
    ├── index.html             (frontend agent)
    └── style.css              (frontend agent)
```
