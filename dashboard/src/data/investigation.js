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

export const SDEX_MANIPULATION = {
    burnerAccount: 'GCNF5GNRIT6VWYZ7LXUZ33Q3SR2NUGO32F5X65VVKAEWWIQCKGYN75HB',
    triggerAccount: 'GDHRCQNC64UVL27EXSC6OG6I2FCT4NWM72KNHLHKEB3LK4MEEYYWETN3',
    normalPrice: 1.06,
    manipulatedPrice: 106.7372828,
    inflationFactor: '100.7×',
    attackCost: '~$4 (15 XLM + 1.24 USTRY)',
    offerStillActive: true,
    activeOfferId: '1824788980',
    activeOfferRemaining: '1.1684 USTRY',
    sellOfferTx: {
        hash: '09e1a9d1197c9bf0af4e87da328c4f2d5eb49b487630aa61991fb5c1c4637cdb',
        time: '2026-02-21T23:38:51Z',
        action: 'manage_sell_offer — SELL 1.2185 USTRY @ 106.7372828 USDC',
        link: 'https://stellar.expert/explorer/public/tx/09e1a9d1197c9bf0af4e87da328c4f2d5eb49b487630aa61991fb5c1c4637cdb',
    },
    priceSettingTx: {
        hash: '60fe039e96e88402d175c8de68e80651874ab125880dd384a1636914ba95bef1',
        time: '2026-02-22T00:10:21Z',
        action: 'manage_buy_offer — bought 0.0501 USTRY with 108 USDC limit, crossed burner offer at 106.74',
        link: 'https://stellar.expert/explorer/public/tx/60fe039e96e88402d175c8de68e80651874ab125880dd384a1636914ba95bef1',
        filledAmount: '0.0501003 USTRY',
        filledValue: '5.3475699 USDC',
    },
    burnerOps: [
        { num: 1, time: '2026-02-21T23:35:54Z', tx: '4704f1ca552b78db0c96a011e3d0a3b28f32a19fc9753f6128d588d064604b76', op: 'create_account — 15 XLM from attacker' },
        { num: 2, time: '2026-02-21T23:36:05Z', tx: 'c047a9d795a371ed7ae8b39a80f05df0d284364843eb3ea039b44c03bdd93536', op: 'change_trust — Added USDC trustline' },
        { num: 3, time: '2026-02-21T23:36:28Z', tx: 'fe40fc21ac441bcade857ccfdc56e2a9696985d581c378be55bff6e2e3adc9e8', op: 'manage_sell_offer — Sold 1 XLM for USDC @ 0.161' },
        { num: 4, time: '2026-02-21T23:36:50Z', tx: 'e66ba20df5a781f239132361aadee46f0b9a7457fb6b08915d773695b8accd24', op: 'change_trust — Added USTRY trustline' },
        { num: 5, time: '2026-02-21T23:37:52Z', tx: 'aab3a6054bdf4687e49d68ee4353f0ab7eccfb5101876578ab6d526864d93a1d', op: 'payment — Received 1.237 USTRY from attacker' },
        { num: 6, time: '2026-02-21T23:38:51Z', tx: '09e1a9d1197c9bf0af4e87da328c4f2d5eb49b487630aa61991fb5c1c4637cdb', op: '🔴 manage_sell_offer — SELL 1.2185 USTRY @ 106.7372828 USDC', critical: true },
        { num: 7, time: '2026-02-21T23:39:31Z', tx: '3b504c319bdadf1e3ec49cc9d186083b1ef84c84af219bc0d4bab2bc700c3aa4', op: 'manage_buy_offer — Buy 0.0001 USDC for USTRY @ 1.057 (decoy)' },
        { num: 8, time: '2026-02-22T00:11:16Z', tx: '16215fc1daa3bab99b0039d8eb37942a8db4a391c48768fb8cc81ccd8c1e2c9b', op: 'manage_buy_offer — Cancel buy offer (cleanup)' },
    ],
};

export const STATS = {
    drainedXlm: '61,249,278 XLM',
    drainedUsdc: '~$1M USDC',
    frozenXlm: '~48M XLM',
    frozenDetail: 'Main wallet + Swap Hub + Funder/Ops',
    netExtraction: '~$3M',
    netExtractionDetail: '$1M USDC + ~$2M XLM at spot → bridged',
    xlmConverted: '~5M XLM → $787K',
    xlmConvertedDetail: 'via GATDQL + 4 throwaway accts, 15 bridge calls to Base',
    xlmToBinance: '3.77M XLM',
    xlmToBinanceDetail: 'Relay 3.54M + Small 234K → Binance (has KYC)',
    xlmToChangeNow: '3.97M XLM',
    xlmToChangeNowDetail: 'ChangeNow (no KYC!) — changenow.io',
    slippage: '2.6%',
    slippageDetail: '$0.1565 effective vs $0.16065 spot',
    spotPriceAtExploit: '$0.16065/XLM',
    effectiveRate: '$0.1565/XLM',
    bridgedToBase: '$788,524.05',
    bridgedToEth: '$586,974.40',
    bridgedToBsc: '$38,746.50',
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
    { time: 'Feb 14, 2026', title: 'Attacker Wallet Created', desc: 'GBO7V...2WXC created on Stellar, funded by GC2XJK...FZIB.', severity: 'info' },
    { time: 'Feb 19–21', title: 'Orderbook Cleanup', desc: 'Small USTRY buys (50-55 USTRY each) at normal prices to drain sell-side liquidity from the SDEX.', severity: 'info' },
    { time: 'Feb 21, 23:35 UTC', title: '🔴 Burner Account Created', desc: 'GCNF5...75HB created with 15 XLM. Single-purpose SDEX manipulation account.', severity: 'warning', tx: '4704f1ca552b78db0c96a011e3d0a3b28f32a19fc9753f6128d588d064604b76' },
    { time: 'Feb 21, 23:38 UTC', title: '🔴 100× SELL OFFER PLACED', desc: 'Burner placed 1.2185 USTRY for sale at 106.74 USDC — 100.7× normal price on empty orderbook.', severity: 'critical', tx: '09e1a9d1197c9bf0af4e87da328c4f2d5eb49b487630aa61991fb5c1c4637cdb' },
    { time: 'Feb 22, 00:04 UTC', title: 'Collateral Supplied', desc: 'Attacker supplies 50 USTRY as collateral to Blend Pool.', severity: 'warning' },
    { time: 'Feb 22, 00:10 UTC', title: '🔴 PRICE-SETTING TRADE', desc: 'Trigger account GDHRCQNC... buys 0.05 USTRY against burner offer at 106.74 USDC. Oracle now reads inflated price.', severity: 'critical', tx: '60fe039e96e88402d175c8de68e80651874ab125880dd384a1636914ba95bef1' },
    { time: 'Feb 22, 00:15 UTC', title: 'Oracle Window #1', desc: 'Reflector Oracle reads USTRY last traded price = 106.74 USDC ✅', severity: 'critical' },
    { time: 'Feb 22, 00:20 UTC', title: 'Oracle Window #2 + Borrow', desc: 'Oracle confirms inflated price. Attacker withdraws 14K USDC, then supplies 13K more USTRY.', severity: 'critical' },
    { time: 'Feb 22, 00:21–00:22 UTC', title: 'USTRY Dumping Phase', desc: 'Attacker dumps ~135K USTRY → 153K USDC at normal prices before main borrow.', severity: 'warning' },
    { time: 'Feb 22, 00:24:27 UTC', title: '⚡ MAIN EXPLOIT EXECUTED', desc: 'submit(request_type=4) — Borrowed 61,249,278 XLM against inflated USTRY collateral.', severity: 'critical', tx: '3e81a3f7b6e17cc22d0a1f33e9dcf90e5664b125b9e61f108b8d2f082f2d4657' },
    { time: 'Feb 22, 00:25–00:30 UTC', title: 'XLM → Binance (3.77M)', desc: '3.54M XLM via relay account + 234K direct to Binance deposit address.', severity: 'warning' },
    { time: 'Feb 22, 00:25–00:35 UTC', title: 'XLM → ChangeNow (3.97M)', desc: '3.97M XLM sent to ChangeNow no-KYC exchange in multiple batches.', severity: 'critical' },
    { time: 'Feb 22, 00:35 UTC', title: 'First Liquidation (Fill #1)', desc: 'GAPU4...XLIQ fills first auction, 11 min after exploit.', severity: 'warning' },
    { time: 'Feb 22, 01:08 UTC', title: 'YHNF Enters (Fill #3)', desc: 'GAIN2...YHNF begins liquidation fills 44 min after exploit.', severity: 'warning' },
    { time: 'Feb 22, 00:34–01:41 UTC', title: 'DEX Swap + Bridge (15 batches)', desc: '~5M XLM path_payment swapped to 788,524 USDC on SDEX, then 15 Allbridge bridge calls to Base. Simultaneously: 4 batches (~$172K) to Ethereum, 1 batch ($38.7K) to BSC.', severity: 'critical' },
    { time: 'Feb 22, 02:23–02:25 UTC', title: '70.7M XLM Seized (Fills #12–18)', desc: 'XLIQ liquidates SXI3 (SDF position) — 4 mega-fills in 2 minutes.', severity: 'critical' },
    { time: 'Feb 22, 04:30 UTC', title: 'Cascade Winds Down (Fill #59)', desc: 'XLIQ executes second-to-last fill, 4 hours after exploit.', severity: 'info' },
    { time: 'Feb 22, 02:56–02:57 UTC', title: 'Accumulator Seeded: 300 ETH', desc: 'Exploiter 2 sent 100 ETH (02:56:35) + 200 ETH (02:57:47) to Exploiter 3 Accumulator (0x0b2b16e1...f3ec6). Funded from Ethereum Allbridge inflows — pre-dates the Feb 23 Relay/Across sweeps.', severity: 'warning' },
    { time: 'Feb 22, 11:47 UTC', title: 'Final Fill (#60)', desc: 'YHNF executes the last liquidation auction fill.', severity: 'info' },
    { time: 'Feb 22, ~12:00 UTC', title: '🔒 Stellar Wallets Frozen', desc: 'Attacker main wallet + Swap Hub + Funder frozen. ~48M XLM locked in place.', severity: 'info' },
    { time: 'Feb 22, 15:00–16:00 UTC', title: '🔴 Base → ETH Consolidation (~380 ETH net)', desc: 'Attacker drained Base holdings to Ethereum using two bridges back-to-back. Inbound: ~240 ETH via Relay (12 × 20 ETH) + ~150 ETH via Across (10 txns). Outbound: 10 ETH sent back to Base. Net: ~380 ETH (~$715K) consolidated on Ethereum.', severity: 'critical' },
    { time: 'Feb 23, 09:01–09:26 UTC', title: 'Base → ETH Final Consolidation (380 ETH net)', desc: 'Two bridge sweeps from Base: 150 ETH via Across (10 txns) at 09:01-09:13, then 240 ETH via Relay (12×20) at 09:17-09:26. 10 ETH returned as bridge change. Net: 380 ETH to Exploiter 2. Current: Exploiter 2 holds 467.29 ETH, Accumulator holds 300 ETH (zero outgoing), Base 19.23 ETH, BSC 38,746 USDC.', severity: 'warning' },
];

export const TOP_FILLS = [
    { num: 12, ledger: 61341630, time: '02:23:19', txHash: '940b307a0f4b2511673bb0792a25756c3610d0fb7939c136d7a837e881f666e7', xlm: '37,407,176.52', filler: 'GAPU4...XLIQ' },
    { num: 13, ledger: 61341633, time: '02:23:36', txHash: 'b41d2f910b1a883c96343e667c60014e035ce177c829162e28420a7ada3c2469', xlm: '13,210,306.22', filler: 'GAPU4...XLIQ' },
    { num: 15, ledger: 61341647, time: '02:25:00', txHash: 'b627fb6f874a3dbeda84a684c75117862f9b0c7cd938b69b50ef88b2fd0b79b9', xlm: '13,909,842.74', filler: 'GAPU4...XLIQ' },
    { num: 17, ledger: 61341653, time: '02:25:35', txHash: '015f5429cd20a6e6ffa23d8381b94e967727901f817a8b382774bd5a0fdc03f8', xlm: '6,153,059.85', filler: 'GAPU4...XLIQ' },
];

export const LIQUIDATED_POSITIONS = [
    { rank: 1, account: 'GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3', short: 'GCA34H...SXI3', label: 'SDF Pool Position', fills: 9, xlm: '77,848,371.53', pctTotal: '93.6%' },
    { rank: 2, account: 'GBCRDN4B6KY456PNKGPTB7OJXEHOBMMZ6EQ23TIRBMIXZUUJODL5RDYM', short: 'GBCRD...RDYM', label: '', fills: 1, xlm: '2,742,538.99', pctTotal: '3.3%' },
    { rank: 3, account: 'GA2GD7P5MQU2FLF5NP26UJ3KAY5XX42OTJLCG455NUEKPRHLKLJCGJKU', short: 'GA2GD...GJKU', label: '', fills: 3, xlm: '1,461,895.35', pctTotal: '1.8%' },
];

export const LIQUIDATORS = [
    { account: 'GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ', short: 'GAPU4...XLIQ', fills: 19, role: 'First fill 11 min post-exploit; seized 76.3M XLM from SXI3' },
    { account: 'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF', short: 'GAIN2...YHNF', fills: 31, role: 'Most fills; 1.5M XLM from SXI3 + bulk of smaller positions' },
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
    creatorLabel: 'Created by G...RHU7 (~$1.8M balance)',
    opCount: '~11,375',
    assets: ['XLM', 'USDC', 'CETES', 'USDGLO', 'PYUSD', 'BLND'],
    contract: 'CB5AKVUULR4AMVV4JRVBFDH2VDIO3XWBOZMSGS5Y4LCNP3UIZIYTMAYB',
    findings: [
        'No on-chain tag or federation address',
        'Holds BLND tokens and runs a custom automation contract (CB5AKVUU...)',
        'First fill 11 min after exploit — pre-positioned monitoring',
        'Seized 76.3M XLM from SXI3 at ~55% discount ($5.5M paid for $12.3M collateral)',
        'Capital chain traces back 5 hops to a [Spoofing]-tagged origin account',
    ],
    conclusion: 'Sophisticated Blend liquidation operator with custom infrastructure and pre-positioned capital. See XLIQ.md for full funding network analysis.',
};

export const YHNF_PROFILE = {
    address: 'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF',
    created: '2025-04-15T18:58:02Z',
    homeDomain: 'None',
    multisig: 'None — single key, weight=1',
    creator: 'GBPUFOPDVPGM56MIO4KYSNV2N4XLYBZAXL6QMD75JWG7GC5L6ANFSYBL',
    creatorLabel: 'Created by G...SYBL (diversified DeFi portfolio)',
    xlmBalance: '10,598,958 XLM',
    fills: 31,
    xlmFromSxi3: '1,507,194.95 XLM',
    assets: 'BLND (103.51), CETES (43,514), EURC (6,783), PYUSD (240), USDC (222), USTRY (915)',
    controller: {
        address: 'GDDYERCLIKAEDJJQI6XWWPLTOZ7OPOH26LFLNUD43QP4UEH34YEOV4A7',
        type: '4-signer multisig (weights 8/8/8/1)',
        actions: [
            '376,632 BLND sent (Aug 2025)',
            '80,000 USDC sent on exploit day (2026-02-22)',
        ],
    },
    blndWhale: {
        address: 'GCJ2VBYRO4BO3BHCGN7EMSTKBLQXMUTS67PFHUJBZOCCQGLOQN5XFKOG',
        holdings: '7,579,191 BLND',
        note: 'Round-trip: 699,990 BLND out Dec 2025, 700,000 BLND back Jan 2026',
    },
    findings: [
        'Created 2025-04-15 — pre-positioned before SDF pool deployment',
        'Funded by 4-signer controller multisig (376K BLND + 80K USDC)',
        '31 fills across the liquidation cascade — most of any single bot',
        'Post-exploit: distributing seized assets via claimable balances',
    ],
    conclusion: 'Professional Blend liquidation operator. No direct link to the attacker. See YHNF.md for full controller and funding analysis.',
};

export const BRIDGE_BATCHES = {
    chainMap: { 9: 'Base', 1: 'Ethereum', 2: 'BSC' },
    totalBridged: '~$997.7K',
    destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
    batchSize: '~50,000 USDC',
};

export const BRIDGE_STATUS = {
    lastUpdate: 'Feb 22, 2026 ~9:07 PM EST',
    source: '"48M frozen, 13M bridged out"',
    xlmFrozen: '~48M XLM',
    xlmFrozenDetail: 'Main 45.07M + Swap Hub 2.5M + Funder/Ops 450K',
    xlmToBinance: '3.77M XLM',
    xlmToBinanceDetail: 'Relay 3.54M + Small 234K → Binance (has KYC)',
    xlmToChangeNow: '3.97M XLM',
    xlmToChangeNowDetail: 'ChangeNow (no KYC!) — changenow.io',
    xlmConverted: '~5M XLM → $787K USDC',
    xlmConvertedDetail: 'via GATDQL + 4 throwaway accts, 15 bridge calls to Base + 12 to Ethereum + 1 to BSC',
    usdcBridgedOut: '$1,414,244.95',
    usdcBridgedDetail: 'Audited: Base $788,524 (15 batches) + ETH $586,974 (12 batches) + BSC $38,746 (1 batch)',
    totalOffChain: '~$3.4M',
    totalOffChainDetail: '$1.41M USDC bridged + $1.24M XLM to exchanges + $750K frozen on Stellar',
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
        bridgeCalls: 28,
        status: '~5M XLM converted to USDC via path_payment (self-swaps + 4 throwaway accounts). 28 total Allbridge bridge calls: 15 to Base ($788K), 12 to Ethereum ($587K), 1 to BSC ($39K). ~2.5M XLM still in wallet.',
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
    // ── Base chain — $788,524.05 USDC total (15 batches) — AUDITED Feb 23 2026 ──
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '78,059.331106 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 1, tx: '0x47ba43f4b2376b64e19a7f327c9211925842a9163a670ea93360848e259bd1a8', time: 'Feb-22 00:34:13' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '77,925.510139 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 2, tx: '0xd8703f837a090301b1472abc23139d69e038c0ab82bd14b5cdbb708e9019b838', time: 'Feb-22 00:38:13' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,057.187927 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 3, tx: '0x98af47dd6a6832842227131a436b63ea3def316e21e1a86abdd0c4ac98a08deb', time: 'Feb-22 00:42:43' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '46,688.518016 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 4, tx: '0xda9fb0d4564fe7e1e73c4cb183314eeb1d4c1b0aeb9542b220c55d46c7bfa318', time: 'Feb-22 00:45:43' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,971.008138 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 5, tx: '0xece2794a336bd170ccd781d2aa628ab83df62c3b2357fb506b50cdb683da737c', time: 'Feb-22 00:55:13' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,640.562551 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 6, tx: '0xda08e94106e1d0f4dfaa0239172a1263c091e50a093abb64d7feafe5f82ebd10', time: 'Feb-22 01:00:45' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,973.326655 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 7, tx: '0xc940edfa9a2fa094bfd0d7c5e3ad03c916f057f7c82c87fa18b1c8f4922927c3', time: 'Feb-22 01:07:45' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,874.781694 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 8, tx: '0x7938377a3381de098ef66134e13d93e2ad77ab7fef26f2650eb32c1690a8b16f', time: 'Feb-22 01:10:45' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,204.974914 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 9, tx: '0x9ce6fac2c5beab1b5ce36accae89dd7d45052f7d7e90f2a17375fde00ab32b73', time: 'Feb-22 01:14:47' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,913.830034 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 10, tx: '0xab46d116a3cdee42ffe5a1bfcc329c125317463f4da36a6657ceb6a9202aeeed', time: 'Feb-22 01:20:17' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,180.969975 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 11, tx: '0xef27644decef310619d7a0ab9125785022ebdec818d0042647faec0267c69145', time: 'Feb-22 01:24:47' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '50,410.721324 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 12, tx: '0xfb640babbfd40d53dfae33b17abcb6b12dccb1987d67102a93288f6383e18960', time: 'Feb-22 01:28:17' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,989.539299 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 13, tx: '0x2614544acf0e346d95ad9b21fd0bad25e1e1e5c870f22a676a57867f53e776d2', time: 'Feb-22 01:33:17' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,579.941619 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 14, tx: '0x1235b05242e6b76169a4478e09642241f653f48e0721613e68b0d5ccc6ff6a3c', time: 'Feb-22 01:35:47' },
    { chain: 'Base', chainId: 9, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '49,053.850687 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge Core (Base)', status: 'RECEIVED', batch: 15, tx: '0x17273b0e325e44ad43e7da9fa092580ecacab8af9065ddaaad77c11203a07324', time: 'Feb-22 01:41:19' },
    // ── Ethereum — $586,974.40 USDC total (12 batches) — AUDITED Feb 23 2026 ──
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '49,313.32 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 1, tx: '0x77b98cd0...', time: 'Feb-22 01:47:23' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,804.58 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 2, tx: '0x2b60654a...', time: 'Feb-22 01:50:47' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,201.41 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 3, tx: '0x5c054102...', time: 'Feb-22 01:54:59' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '47,603.13 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 4, tx: '0xec578279...', time: 'Feb-22 01:57:59' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,535.79 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 5, tx: '0x3caed9ce...', time: 'Feb-22 02:03:11' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '65,447.63 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 6, tx: '0x97a3161c...', time: 'Feb-22 02:06:35' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,706.03 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 7, tx: '0x6a33e874...', time: 'Feb-22 02:11:23' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,591.88 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 8, tx: '0x19596613...', time: 'Feb-22 02:13:35' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,401.07 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 9, tx: '0x11ba0e44...', time: 'Feb-22 02:18:23' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,879.34 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 10, tx: '0xaa6f983a...', time: 'Feb-22 02:22:11' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '48,505.82 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 11, tx: '0x70f1e522...', time: 'Feb-22 02:25:23' },
    { chain: 'Ethereum', chainId: 1, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '35,984.40 USDC', method: 'swap_and_bridge', allbridgeContract: 'Allbridge LP-USDC', status: 'RECEIVED', batch: 12, tx: '0x1c99d766...', time: 'Feb-22 02:54:23' },
    // ── BSC — $38,746.50 USDC (1 batch) — AUDITED Feb 23 2026 ──
    { chain: 'BSC', chainId: 2, dest: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', amount: '38,746.50073 USDC', method: 'swap_and_bridge', allbridgeContract: '0x3c4fa639c8d7e65c603145adad8bd12f2358312f', status: 'RECEIVED', batch: 1, tx: '0xb99a6c57720b73aa3f2189d14d100c01474f7c3bfbee0e807098e418e0fa03ce', time: 'Feb-22 00:30:40' },
];

export const BRIDGE_CHAIN_SUMMARY = [
    { chain: 'Base', chainId: 9, totalBridged: '$788,524.05', batches: 15, destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', destStatus: 'DRAINED → ETH', swapRouter: 'UniswapX → Relay/Across', note: 'USDC swapped to ~420 ETH, then 380 ETH bridged to Ethereum (150 Across + 240 Relay). 19.23 ETH remains.' },
    { chain: 'Ethereum', chainId: 1, totalBridged: '$586,974.40 + 380 ETH from Base', batches: 12, destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', destStatus: 'CONSOLIDATED', swapRouter: 'USDC→ETH swaps + Relay/Across inflows', note: 'Exploiter 2 holds 467.29 ETH. Accumulator (0x0b2b16e1…f3ec6) holds 300 ETH — zero outgoing TXs.' },
    { chain: 'BSC', chainId: 2, totalBridged: '$38,746.50', batches: 1, destAddress: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482', destStatus: 'UNTOUCHED', swapRouter: 'None', note: '38,746.50073 Binance-Peg USDC parked. Zero outgoing TXs. 0.00184 BNB gas dust from Allbridge.' },
];

export const EVM_CHAINS = {
    ethereum: {
        exploiter2: {
            address: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
            label: 'YieldBlox Exploiter 2',
            balance: '467.29 ETH ($881,252)',
            status: 'CONSOLIDATED',
            txCount: 45,
            note: 'Received ~380 ETH from Base via Relay (12×20) + Across (10 txns). Active 8hrs ago.',
        },
        accumulator: {
            address: '0x0b2B16E1a9e2e9b15027ae46fa5ec547f5ef3eC6',
            label: 'YieldBlox Exploiter 3',
            balance: '300.00 ETH ($564,681)',
            status: 'DORMANT',
            txCount: 6,
            note: 'Funded with 200+100 ETH from Exploiter 2. Zero outgoing.',
        },
        vanityRing: [
            { address: '0x0B2bC...3EC6', funder: 'Phishing #1064860' },
            { address: '0x0b208...3eC6', funder: 'Phishing #1701177' },
            { address: '0x0b2ce...3eC6', funder: 'Phishing #1674496' },
        ],
        totalValue: '~$1.45M (767 ETH across 2 wallets)',
    },
    base: {
        attacker: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
        balance: '19.23 ETH ($36,268)',
        status: 'DRAINED — bridged to ETH',
        router: '0x66a9893cc07d91d95644aedd05d03f95e1dba8af',
        note: '~380 ETH bridged out via Relay + Across. Only ~19 ETH remains.',
    },
    bsc: {
        wallet: '0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482',
        balance: '38,746.50 USDC',
        status: 'UNTOUCHED',
    },
};

export const ADDRESSES = [
    { network: 'Stellar', label: 'Attacker', address: 'GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC', tag: 'attacker' },
    { network: 'Stellar', label: 'SDEX Manipulator (Burner)', address: 'GCNF5GNRIT6VWYZ7LXUZ33Q3SR2NUGO32F5X65VVKAEWWIQCKGYN75HB', tag: 'attacker' },
    { network: 'Stellar', label: 'Trade Trigger', address: 'GDHRCQNC64UVL27EXSC6OG6I2FCT4NWM72KNHLHKEB3LK4MEEYYWETN3', tag: 'attacker' },
    { network: 'Stellar', label: 'Attacker Funder', address: 'GC2XJKBYLJIQ3LIPITDM6I5WYMBXUCIEXBCMHHA5K7GKM5NLSO4SFZIB', tag: 'attacker' },
    { network: 'Stellar', label: 'Blend Pool', address: 'CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS', tag: 'protocol' },
    { network: 'Stellar', label: 'SDF Pool Position (SXI3)', address: 'GCA34HBKNLWN3AOXWBRW5Y3HSGHCWF3UDBRJ5YHGU6HWGJZEPO2NSXI3', tag: 'protocol' },
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
