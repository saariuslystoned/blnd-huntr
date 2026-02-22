"""
blnd-huntr/scripts/config.py
─────────────────────────────
Shared configuration for all backend monitoring scripts.
All values sourced from CONSTANTS.md — the single source of truth.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────────
# Stellar Addresses
# ──────────────────────────────────────────────
ATTACKER = "GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC"
BLEND_POOL = "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS"
REFLECTOR_ORACLE = "CALI2BYUJE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M"
PRICE_FEED = "CD74A3C54EKUVEGUC6WNTUPOTHB624WFKXN3IYTFJGX3EHXDXHCYMXXR"
XLM_SAC = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"
USTRY_TOKEN = "CBLV4ATSIWU67CFSQU2NVRKINQIKUZ2ODSZBUJTJ43VJVRSBTZYOPNUR"
USTRY_ISSUER = "GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC"
COUNTERPARTY = "GABFRFPYM2BXM4OM2ZA4YDBWY4CMPVESHQMKXSM47MWWJD4TW2KQDWWN"
FUNDER = "GC5H2VVVQ6FOP4HTORZBTZSUT2RWSBWQHZN6OFKM5XSPHN6PFD74FMOC"
LIQUIDATOR_PRIMARY = "GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ"
LIQUIDATOR_SECONDARY = "GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF"
USDC_DEST = "GDQ5LZIE57IUFMFVQUSDHJLAW4VP7QCN22GLSZTKEUVVH6DJLVFU2Q7F"

# ──────────────────────────────────────────────
# EVM Addresses
# ──────────────────────────────────────────────
EVM_ATTACKER = "0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482"
ACCUMULATOR = "0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6"
USDC_BASE = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"

# Vanity Gas Ring #1 (0x0b2...3eC6 pattern)
VANITY_RING_1 = [
    "0x0B2bC0c2bd171c4701cfad713172c4b5b0053EC6",
    "0x0b2081a0d5515485d51606ba41d8ee186f303eC6",
    "0x0b2ce35351ecf2b36a2e965c394683d47a563eC6",
    "0x0b29aB4525acc3fed709b86fe5612734c6ef3eC6",
    "0x0b20E28bf0012a52e52f969fb6a0865854e93eC6",
    "0x0b2b400Bb655da6aeaaedd3a23260957c5bc3ec6",
]

# Vanity Gas Ring #2 (0x2D1...6482 pattern — mimics main attacker)
VANITY_RING_2 = [
    "0x2d1C87693a1242b1a0736d064bbe25f204eB6482",
    "0x2D107786363ed945e0255e7f27d3233aAB476482",
    "0x2D1005b0Db4d4b5f25e4706dc8777f6f64d66482",
]

# Phishing Funders
PHISHING_WALLETS = {
    "Fake_Phishing1701177": "0xd7e42d9502fbd66d90750e544e05c2b3ca7cbd22",
    "Fake_Phishing1064860": "0x8d8210a0252a706cb5de0c6f8e46b6d3692afc19",
    "Fake_Phishing1674496": "0x1ae0e997216f7a354eda202b5cb3352b9dafadff",
    "Fake_Phishing1648144": "0x2393d38400cad1d0ffae85b37d76de05bb7eddc6",
}

# ──────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────
HORIZON_BASE = "https://horizon.stellar.org"
STELLAR_EXPERT_TX = "https://stellar.expert/explorer/public/tx/"
STELLAR_EXPERT_ACCOUNT = "https://stellar.expert/explorer/public/account/"
ETHERSCAN_API = "https://api.etherscan.io/api"
BASESCAN_API = "https://api.basescan.org/api"
BSCSCAN_API = "https://api.bscscan.com/api"

# API Keys (from .env)
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "")
BASESCAN_API_KEY = os.getenv("BASESCAN_API_KEY", "")
BSCSCAN_API_KEY = os.getenv("BSCSCAN_API_KEY", "")

# ──────────────────────────────────────────────
# Allbridge Contracts
# ──────────────────────────────────────────────
ALLBRIDGE_CONTRACTS = {
    "ethereum": "0x609c690e8f7d68a59885c9132e812eebdaaf0c9e",
    "bsc": "0x3c4fa639c8d7e65c603145adad8bd12f2358312f",
    "base": None,  # TODO: identify from token transfer logs
}

# Allbridge Chain IDs
ALLBRIDGE_CHAIN_IDS = {
    1: "Ethereum",
    2: "BSC",
    9: "Base",
}

# ──────────────────────────────────────────────
# Exploit Key Facts
# ──────────────────────────────────────────────
EXPLOIT_DATE = "2026-02-22T00:24:27Z"
EXPLOIT_LEDGER = 61340408
XLM_BORROWED = 61_249_278.3
ESTIMATED_STOLEN_USD = 10_000_000
RECOVERED_USD = 0

# ──────────────────────────────────────────────
# Monitoring Priority Levels
# ──────────────────────────────────────────────
PRIORITY = {
    "CRITICAL": {
        "label": "🔴 CRITICAL",
        "target": "Accumulator wallet on Ethereum",
        "address": ACCUMULATOR,
        "chain": "ethereum",
        "note": "Any outgoing TX = DROP EVERYTHING",
    },
    "HIGH": {
        "label": "🟠 HIGH",
        "target": "BSC wallet",
        "address": EVM_ATTACKER,
        "chain": "bsc",
        "note": "38.7K USDC untouched",
    },
    "MEDIUM": {
        "label": "🟡 MEDIUM",
        "target": "Stellar attacker wallet",
        "address": ATTACKER,
        "chain": "stellar",
        "note": "~45M XLM remaining",
    },
}

# ──────────────────────────────────────────────
# EVM Scanner configs  (chain → api_url, api_key, explorer_url)
# ──────────────────────────────────────────────
EVM_CHAINS = {
    "ethereum": {
        "api": ETHERSCAN_API,
        "key": ETHERSCAN_API_KEY,
        "explorer": "https://etherscan.io",
        "name": "Ethereum",
    },
    "base": {
        "api": BASESCAN_API,
        "key": BASESCAN_API_KEY,
        "explorer": "https://basescan.org",
        "name": "Base",
    },
    "bsc": {
        "api": BSCSCAN_API,
        "key": BSCSCAN_API_KEY,
        "explorer": "https://bscscan.com",
        "name": "BSC",
    },
}
