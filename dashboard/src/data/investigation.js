// All hardcoded investigation data — single source of truth.
// Update numbers here and all components reflect changes.

export const EXPLOIT = {
    date: '2026-02-22',
    time: '00:24:27 UTC',
    ledger: 61340408,
    txHash: '3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657',
    xlmDrained: 61249278.3,
    ustryCollateral: '~150K USTRY',
    ustryRealValue: '$159K',
    oracleInflation: '100×',
    pool: 'CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS',
};

export const STATS = {
    drainedXlm: '61,249,278 XLM',
    drainedUsdc: '~$1M USDC',
    frozenXlm: '~48M XLM',
    frozenDetail: 'Main wallet + Swap Hub + Funder/Ops (confirmed mootz12)',
    netExtraction: '~$3M',
    netExtractionDetail: '$1M USDC + ~$2M XLM at spot → bridged',
    xlmConverted: '~5M XLM → $787K',
    xlmConvertedDetail: 'via GATDQL + 4 throwaway accts, 16 bridge calls',
    xlmToBinance: '3.77M XLM',
    xlmToBinanceDetail: 'Relay 3.54M + Small 234K → Binance (has KYC)',
    xlmToChangeNow: '3.97M XLM',
    xlmToChangeNowDetail: 'ChangeNow (no KYC!) — changenow.io',
    slippage: '2.6%',
    slippageDetail: '$0.1565 effective vs $0.16065 spot',
    spotPriceAtExploit: '$0.16065/XLM',
    effectiveRate: '$0.1565/XLM',
    bridgedToBase: '~$787K',
    bridgedToEth: '~$172K',
    bridgedToBsc: '~$38.7K',
    recovered: '$0.00',
    recoveredPct: '0.0%',
    totalAuctionFills: 60,
    totalXlmSeized: '83,090,246.91',
    totalBlndUsdcLp: '4,388,095.55',
    totalUsdcPaid: '3,394,507.20',
    totalCetesPaid: '2,252,665.74',
    backstopWiped: '~$2M in BLND-USDC LP',
    bXlmHaircut: '~55%',
    bUsdcHaircut: '~15-20%',
};

export const ORACLE_PRICES = [
    { timestamp: 1771718700, price: '105,742,642,288,368', status: 'normal' },
    { timestamp: 1771719000, price: '105,742,379,403,813', status: 'normal' },
    { timestamp: 1771719300, price: '10,673,728,301,028,137', status: 'manipulated' },
    { timestamp: 1771719600, price: '10,673,728,301,028,137', status: 'manipulated' },
];

export const TIMELINE = [
    { time: 'Feb 21, 06:14 UTC', title: 'Infrastructure Prep', desc: 'Test buys of USTRY at normal market prices (1.058).', severity: 'info' },
    { time: 'Feb 22, 00:22 UTC', title: 'USTRY Dumping Phase', desc: 'Attacker liquidated ~135K USTRY for USDC prior to bridge.', severity: 'warning' },
    { time: 'Feb 22, 00:24 UTC', title: '⚡ MAIN EXPLOIT EXECUTED', desc: 'Attacker borrowed 61.2M XLM against inflated USTRY collateral.', severity: 'critical' },
    { time: 'Feb 22, 00:35 UTC', title: 'First Liquidation (Fill #1)', desc: 'GAPU4...XLIQ fills first auction, 11 min after exploit.', severity: 'warning' },
    { time: 'Feb 22, 01:08 UTC', title: 'YHNF Enters (Fill #3)', desc: 'GAIN2...YHNF begins liquidation fills 44 min after exploit.', severity: 'warning' },
    { time: 'Feb 22, 02:23–02:25 UTC', title: '70.7M XLM Seized (Fills #12–18)', desc: 'XLIQ liquidates SXI3 treasury — 4 mega-fills in 2 minutes.', severity: 'critical' },
    { time: 'Feb 22, 04:30 UTC', title: 'Cascade Winds Down (Fill #59)', desc: 'XLIQ executes second-to-last fill, 4 hours after exploit.', severity: 'info' },
    { time: 'Feb 22, 11:47 UTC', title: 'Final Fill (#60)', desc: 'YHNF executes the last liquidation auction fill.', severity: 'info' },
];

export const TOP_FILLS = [
    { num: 12, ledger: 61341630, time: '02:23:19', txHash: '940b307a0f4b2511673bb0792a25756c3610d0fb7939c136d7a837e881f666e7', xlm: '37,407,176.52', filler: 'GAPU4...XLIQ' },
    { num: 13, ledger: 61341633, time: '02:23:36', txHash: 'b41d2f910b1a883c96343e667c60014e035ce177c829162e28420a7ada3c2469', xlm: '13,210,306.22', filler: 'GAPU4...XLIQ' },
    { num: 15, ledger: 61341647, time: '02:25:00', txHash: 'b627fb6f874a3dbeda84a684c75117862f9b0c7cd938b69b50ef88b2fd0b79b9', xlm: '13,909,842.74', filler: 'GAPU4...XLIQ' },
    { num: 17, ledger: 61341653, time: '02:25:35', txHash: '015f5429cd20a6e6ffa23d8381b94e967727901f817a8b382774bd5a0fdc03f8', xlm: '6,153,059.85', filler: 'GAPU4...XLIQ' },
];

export const LIQUIDATED_POSITIONS = [
    { rank: 1, account: 'GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3', short: 'GCA34H...SXI3', label: 'Blend Treasury (SDF-funded)', fills: 9, xlm: '77,848,371.53', pctTotal: '93.6%' },
    { rank: 2, account: 'GBCRDN4B6KY456PNKGPTB7OJXEHOBMMZ6EQ23TIRBMIXZUUJODL5RDYM', short: 'GBCRD...RDYM', label: '', fills: 1, xlm: '2,742,538.99', pctTotal: '3.3%' },
    { rank: 3, account: 'GA2GD7P5MQU2FLF5NP26UJ3KAY5XX42OTJLCG455NUEKPRHLKLJCGJKU', short: 'GA2GD...GJKU', label: '', fills: 3, xlm: '1,461,895.35', pctTotal: '1.8%' },
];

export const LIQUIDATORS = [
    { account: 'GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ', short: 'GAPU4...XLIQ', fills: 19, role: 'First mover; 70.7M XLM from SXI3' },
    { account: 'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF', short: 'GAIN2...YHNF', fills: 31, role: 'Most fills overall; bulk of smaller positions' },
    { account: 'GDQY3T2ZJXVGV23R32AIHKPC2RLMMYSEK3EGRZ4MA2CYEGXHE63BLEND', short: 'GDQY3...BLEND', fills: 7, role: 'Third most active' },
    { account: 'GALB73DWWDC2EWEIUX6CUCZ2DGR7HSYFQIYDM4DCX6USS5GZNMZ3CASH', short: 'GALB7...CASH', fills: 1, role: 'Interest auction only' },
    { account: 'GCBYMMOSIINFRGFEJKEUGNCUNAOUQYZ6DOQXA47P76UGCUQSXVNWWM3L', short: 'GCBYM...M3L', fills: 1, role: 'Single liquidation' },
    { account: 'GASND6BBFGDGWDLP2DJCFDAKL7GHHZAYQ6PENFHSHMLEMFKAVLZCDQXJ', short: 'GASND...QXJ', fills: 1, role: 'Single liquidation' },
];

export const XLIQ_PROFILE = {
    address: 'GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ',
    created: '2024-12-29T15:32:34Z',
    homeDomain: 'lobstr.co',
    multisig: 'None',
    creator: 'GCYVR6JS6DLRAFF2HEC6LN7J6H6JS2VMERCTGV64RESTZAJMOHB5RHU7',
    creatorLabel: '~$1.8M whale, no public identity',
    opCount: '~11,375',
    assets: ['XLM', 'USDC', 'CETES', 'USDGLO', 'PYUSD', 'BLND'],
    contract: 'CB5AKVUULR4AMVV4JRVBFDH2VDIO3XWBOZMSGS5Y4LCNP3UIZIYTMAYB',
    findings: [
        'No on-chain tag — no federation address, no StellarExpert directory label',
        'Matches official blend-capital/liquidation-bot GitHub profile',
        'Holds BLND tokens — retail liquidators don\'t typically hold protocol tokens',
        'Custom automation contract (CB5AKVUU...) — serious custom infrastructure',
        'First mover (Fill #1, 11 min after exploit) — pre-positioned monitoring',
    ],
    conclusion: 'Sophisticated, protocol-native Blend liquidation operator. Could be a Blend/Script3 team member\'s bot, a DAO treasury operator, or a professional MEV firm.',
};

export const YHNF_PROFILE = {
    address: 'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF',
    created: '2025-04-15T18:58:02Z',
    homeDomain: 'None',
    multisig: 'None — single key, weight=1',
    creator: 'GBPUFOPDVPGM56MIO4KYSNV2N4XLYBZAXL6QMD75JWG7GC5L6ANFSYBL',
    creatorLabel: 'Diversified DeFi portfolio; no public identity',
    xlmBalance: '10,598,958 XLM',
    fills: 31,
    xlmFromSxi3: '1,507,194.95 XLM',
    assets: 'BLND (103.51), CETES (43,514), EURC (6,783), PYUSD (240), USDC (222), USTRY (915)',
    controller: {
        address: 'GDDYERCLIKAEDJJQI6XWWPLTOZ7OPOH26LFLNUD43QP4UEH34YEOV4A7',
        type: '4-signer multisig (weights 8/8/8/1)',
        actions: [
            '100,000 BLND sent (2025-08-20)',
            '276,632 BLND sent (2025-08-27)',
            '80,000 USDC sent on exploit day (2026-02-22)',
        ],
    },
    blndWhale: {
        address: 'GCJ2VBYRO4BO3BHCGN7EMSTKBLQXMUTS67PFHUJBZOCCQGLOQN5XFKOG',
        holdings: '7,579,191 BLND',
        note: 'Round-trip: 699,990 BLND out Dec 2025, 700,000 BLND back Jan 2026',
    },
    findings: [
        'Created 2025-04-15 — 8 days before Blend Treasury (G...SXI3)',
        'Seeded with BLND by protocol-level BLND whale',
        'Controller wired 80K USDC on exploit day',
        'Clusters with GASND...QXJ (fill #56) as co-operator',
        'Post-exploit: creating claimable balances to distribute seized assets',
    ],
    conclusion: 'Professional, protocol-connected Blend liquidation operator. No direct link to SDF or attacker. Second-largest beneficiary of the liquidation cascade.',
};

export const BRIDGE_BATCHES = {
    chainMap: { 9: 'Base', 1: 'Ethereum', 2: 'BSC' },
    totalBridged: '~$997.7K',
    destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
    batchSize: '~50,000 USDC',
};

export const BRIDGE_STATUS = {
    lastUpdate: 'Feb 22, 2026 ~9:07 PM EST',
    source: 'mootz12 (Blend core team): "48M frozen, 13M bridged out"',
    xlmFrozen: '~48M XLM',
    xlmFrozenDetail: 'Main 45.07M + Swap Hub 2.5M + Funder/Ops 450K',
    xlmToBinance: '3.77M XLM',
    xlmToBinanceDetail: 'Relay 3.54M + Small 234K → Binance (has KYC)',
    xlmToChangeNow: '3.97M XLM',
    xlmToChangeNowDetail: 'ChangeNow (no KYC!) — changenow.io',
    xlmConverted: '~5M XLM → $787K USDC',
    xlmConvertedDetail: 'via GATDQL + 4 throwaway accts, 16 bridge calls to Base',
    usdcBridgedOut: '~$997.7K',
    usdcBridgedDetail: 'Direct borrow: Base $787K + ETH $172K + BSC $38.7K',
    totalOffChain: '~$3M',
    totalOffChainDetail: '$997.7K USDC + $787K XLM-converted + $1.24M to exchanges',
    negotiations: true,
    negotiationsNote: 'Negotiations are in progress.',
};

export const XLM_FLOW_MAP = [
    {
        address: 'GATDQL767ZM2JQTBEG4BQ5WKOQNGAGWZDUN4GYT2UINPEU3RT2UAMVZH',
        short: 'GATDQL...AMVZH',
        trigger: 'GATDIV4ROXRC',
        role: 'Primary Swap Hub',
        received: 8001000,
        remaining: 2500813,
        frozen: true,
        converted: 5000000,
        usdcProduced: 787167,
        bridgeCalls: 16,
        status: '~5M XLM converted to $787,167 USDC via path_payment (self-swaps + 4 throwaway accounts). 16 Allbridge bridge calls to Base chain. ~2.5M XLM still in wallet.',
    },
    {
        address: 'GDBIXGZ3EKI3M4DBM65ADLHVNYIOG7JXGOHW5DHUZQAXPORY3QNO2PNY',
        short: 'GDBIXG...O2PNY',
        trigger: 'GDBIBJLV7KDB',
        role: '⚠️ CHANGENOW DEPOSIT (no KYC)',
        received: 3987342,
        remaining: 21511,
        isExchange: true,
        exchangeName: 'ChangeNow',
        exchangeUrl: 'https://changenow.io',
        exchangeKyc: false,
        status: '⚠️ Confirmed ChangeNow Stellar deposit address (#exchange #memo-required changenow.io). 3,965,831 XLM forwarded to ChangeNow internal hot wallet. NO KYC — ChangeNow is a no-ID instant swap service. Contact ChangeNow compliance team.',
    },
    {
        address: 'GDTSFMKTLD2WTQSOWK36QB4A5VTHI54Q67ZDSKAWULAKKN6QVX6LTHQC',
        short: 'GDTSFM...LTHQC',
        trigger: 'GDTS7EPASSTB',
        role: 'Relay → Binance',
        received: 3546827,
        remaining: 10681,
        createdBy: '[Binance Withdrawals] GCETH...MPJF',
        status: 'FULLY DRAINED — 3,536,146 XLM relayed to GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6 (Binance Deposit). Created by Binance Withdrawals wallet.',
    },
    {
        address: 'GC2XJKN5VZEMM35F5LRSUP5CWVDZJVM37YKR7UYYXGN3TGKZXMP5FZIB',
        short: 'GC2XJK...5FZIB',
        trigger: 'GC2XUR73CEZL',
        role: 'Funder/Ops (Binance-created)',
        received: 450490,
        remaining: 450490,
        frozen: true,
        createdBy: '[Binance] GCO2...L3VC',
        memoRequired: true,
        status: '450,490 XLM still sitting — 0 XLM sent out. Created by Binance wallet (GCO2...L3VC). Has memo_required flag. Likely attacker Binance deposit address for future use.',
    },
    {
        address: 'GALFQWBGD472N3N7DO7LPT7BRTLHAVJDH4KCTTUVEOVUS4VJQ47PJNSH',
        short: 'GALFQW...PJNSH',
        trigger: 'GALFMVJPW6AS',
        role: 'Small → Binance',
        received: 230106,
        remaining: 0,
        createdBy: 'GATDQL767ZM2 (Swap Hub)',
        status: 'FULLY DRAINED — 233,610 XLM sent to GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6 (Binance Deposit).',
    },
    {
        address: 'GABFQIK63R2NETJM7T673EAMZN4RJLLGP3OFUEJU5SZVTGWUKULZJNL6',
        short: 'GABFQI...ZJNL6',
        trigger: 'GABFJIMI52DC',
        role: '🚨 BINANCE DEPOSIT ADDRESS',
        received: 3769756,
        remaining: 0,
        isBinance: true,
        isExchange: true,
        exchangeName: 'Binance',
        exchangeKyc: true,
        status: '🚨 Confirmed Binance Stellar deposit address (#exchange #memo-required). 3,536,146 XLM from Relay + 233,610 XLM from Small = 3,769,756 XLM total. ALL forwarded to GC5LF63GRVIT5ZXXCXLPI3RX (Binance internal hot wallet). KYC LEAD: Binance holds identity for this deposit account. Pre-exploit activity (Dec 29-30, 2024) confirms established account.',
    },
];

export const BRIDGE_OUT_TXS = [
    // Base chain — ~$787K total (~16 batches of ~50K USDC)
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 1 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 2 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 3 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 4 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 5 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 6 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 7 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 8 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 9 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 10 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 11 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 12 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 13 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 14 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 15 },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~37,000 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 16 },
    // Ethereum — ~$172K total (~3 batches)
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: '0x609c690e8f7d68a59885c9132e812eebdaaf0c9e', status: 'RECEIVED', batch: 1 },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: '0x609c690e8f7d68a59885c9132e812eebdaaf0c9e', status: 'RECEIVED', batch: 2 },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~50,000 USDC', method: 'swap_and_bridge', allbridgeContract: '0x609c690e8f7d68a59885c9132e812eebdaaf0c9e', status: 'RECEIVED', batch: 3 },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '~22,000 USDC', method: 'swap_and_bridge', allbridgeContract: '0x609c690e8f7d68a59885c9132e812eebdaaf0c9e', status: 'RECEIVED', batch: 4 },
    // BSC — ~$38.7K (1 batch)
    { chain: 'BSC', chainId: 2, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '38,746.50 USDC', method: 'swap_and_bridge', allbridgeContract: '0x3c4fa639c8d7e65c603145adad8bd12f2358312f', status: 'RECEIVED', batch: 1 },
];

export const BRIDGE_CHAIN_SUMMARY = [
    { chain: 'Base', chainId: 9, totalBridged: '~$787,000', batches: 16, destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', destStatus: 'ACTIVE Swapping', swapRouter: 'UniswapX Priority Orders', note: 'Swapping USDC → ETH/WETH via UniswapX' },
    { chain: 'Ethereum', chainId: 1, totalBridged: '~$172,000', batches: 4, destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', destStatus: 'SWAPPED → Accumulator', swapRouter: 'Uniswap V4 Router', note: 'Swapped to ETH, forwarded to accumulator 0x0b2B...3eC6 ($591K parked)' },
    { chain: 'BSC', chainId: 2, totalBridged: '~$38,700', batches: 1, destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', destStatus: 'UNTOUCHED', swapRouter: 'None', note: '38,746.50 Binance-Peg USDC parked, zero activity' },
];

export const EVM_CHAINS = {
    ethereum: {
        accumulator: {
            address: '0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6',
            balance: '$591,808 ETH',
            status: 'DORMANT',
            outgoingTxs: 'ZERO',
        },
        vanityRing: [
            { address: '0x0B2bC...3EC6', funder: 'Phishing #1064860' },
            { address: '0x0b208...3eC6', funder: 'Phishing #1701177' },
            { address: '0x0b2ce...3eC6', funder: 'Phishing #1674496' },
        ],
        totalValue: '~$172K',
    },
    base: {
        attacker: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
        balance: '~$787,000',
        status: 'ACTIVE Swapping',
        router: '0x66a9893cc07d91d95644aedd05d03f95e1dba8af',
    },
    bsc: {
        wallet: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
        balance: '38,746.50 USDC',
        status: 'UNTOUCHED',
    },
};

export const ADDRESSES = [
    { network: 'Stellar', label: 'Attacker', address: 'GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC', tag: 'attacker' },
    { network: 'Stellar', label: 'Attacker Funder', address: 'GC2XJKBYLJIQ3LIPITDM6I5WYMBXUCIEXBCMHHA5K7GKM5NLSO4SFZIB', tag: 'attacker' },
    { network: 'Stellar', label: 'Blend Pool', address: 'CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS', tag: 'protocol' },
    { network: 'Stellar', label: 'Blend Treasury (SXI3)', address: 'GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3', tag: 'protocol' },
    { network: 'Stellar', label: 'SDF Conduit', address: 'GDDUETSYDSHJMU5J73WHR4SQOAWRUM5SNLHXBQKM36EQ244GHSRS5AHF', tag: 'sdf' },
    { network: 'Stellar', label: 'Liquidator XLIQ', address: 'GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ', tag: 'liquidator' },
    { network: 'Stellar', label: 'Liquidator YHNF', address: 'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF', tag: 'liquidator' },
    { network: 'Stellar', label: 'YHNF Controller', address: 'GDDYERCLIKAEDJJQI6XWWPLTOZ7OPOH26LFLNUD43QP4UEH34YEOV4A7', tag: 'liquidator' },
    { network: 'Stellar', label: 'BLND Whale', address: 'GCJ2VBYRO4BO3BHCGN7EMSTKBLQXMUTS67PFHUJBZOCCQGLOQN5XFKOG', tag: 'protocol' },
    { network: 'Stellar', label: 'Reflector Oracle', address: 'CALI3OGQP2UM5LXEDVOHFG4MBHRLHHNGMFI4PGKFVQLBEO23NZTOSLE6M', tag: 'protocol' },
    { network: 'Multi', label: 'EVM Attacker', address: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', tag: 'attacker' },
    { network: 'ETH', label: 'Accumulator', address: '0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6', tag: 'attacker' },
    { network: 'ETH', label: 'Phish_1701', address: '0xd7e42d9502fbd66d90750e544e05c2b3ca7cbd22', tag: 'phishing' },
    { network: 'Base', label: 'UniswapV4 Router', address: '0x66a9893cc07d91d95644aedd05d03f95e1dba8af', tag: 'infra' },
];

export const CONTRACTS = [
    { id: 'CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS', role: 'Blend Pool' },
    { id: 'CD74UBKUAFQHTTVNUQC6R4ZTGHWUXMTPF3EQLX4SDXDBWIJYOC5VMXXR', role: 'Price Wrapper' },
    { id: 'CALI3OGQP2UM5LXEDVOHFG4MBHRLHHNGMFI4PGKFVQLBEO23NZTOSLE6M', role: 'Reflector Oracle' },
    { id: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34OWMA', role: 'XLM SAC' },
];
