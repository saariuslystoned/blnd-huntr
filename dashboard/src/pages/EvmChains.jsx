import { useState } from 'react';
import { EVM_CHAINS, TIMELINE } from '../data/investigation';
import AddrChip from '../components/AddrChip';

// ── EVM flow — all amounts verified from Basescan + Etherscan forensic audit ──
const EVM_FLOW_EVENTS = [
    {
        time: 'Feb 22 · 00:24 UTC',
        label: '⚡ Exploit Executed on Stellar',
        desc: '61.2M XLM borrowed against inflated USTRY collateral. Attacker immediately begins routing proceeds off-chain.',
        color: '#ef4444',
        chain: null,
    },
    {
        time: 'Feb 22 · 00:34–01:41 UTC',
        label: '🌉 Stellar → Base (15 Allbridge batches)',
        desc: '~5M XLM path_payment swapped to USDC on SDEX, then bridged to Base via Allbridge Core. 15 batches over ~67 minutes.',
        color: '#06b6d4',
        chain: 'Base',
        amount: '788,524.054078 USDC received (exact)',
    },
    {
        time: 'Feb 22 · 00:37–01:42 UTC',
        label: '🔄 Base: USDC → ETH (UniswapX + Uniswap V4)',
        desc: '788,524 USDC swapped to ~420 ETH via UniswapX Priority Order Router. All USDC consumed — ETH accumulated in wallet.',
        color: '#06b6d4',
        chain: 'Base',
        amount: '~420 ETH generated (18 swap batches)',
    },
    {
        time: 'Feb 22 · 00:34 UTC (direct)',
        label: '🌉 Stellar → Ethereum (4 batches)',
        desc: 'Separate, parallel Allbridge bridge calls sent direct from Stellar → Ethereum mainnet. Processed concurrently with Base bridge.',
        color: '#6366f1',
        chain: 'Ethereum',
        amount: '~$172K USDC received',
    },
    {
        time: 'Feb 22 · 00:34 UTC (direct)',
        label: '🌉 Stellar → BSC (1 batch)',
        desc: 'Single Allbridge transfer to BSC. Funds arrived and have not moved since. No swaps, no outgoing TXs.',
        color: '#eab308',
        chain: 'BSC',
        amount: '38,746.50073 USDC — PARKED (exact)',
    },
    {
        time: 'Feb 22 · 02:56–02:57 UTC',
        label: '💰 Accumulator Seeded: 300 ETH',
        desc: 'Exploiter 2 sent 300 ETH to Exploiter 3 (Accumulator) in two transactions: 100 ETH at 02:56:35 UTC, 200 ETH at 02:57:47 UTC. ETH funded from Ethereum Allbridge inflows + early Across transfers — NOT the Feb 23 Relay sweeps.',
        color: '#6366f1',
        chain: 'Ethereum',
        amount: '100 ETH + 200 ETH → 0x0b2b16e1…f3ec6',
    },
    {
        time: 'Feb 23 · 09:01–09:13 UTC',
        label: '🔁 Base → Ethereum via Across (10 TXs)',
        desc: 'First consolidation sweep: 50+10+20+10+10+10+10+10+10+10 ETH sent to Across bridge contract (0x767e4…8147f), completing on Ethereum as inbound to Exploiter 2.',
        color: '#f97316',
        chain: 'Ethereum',
        amount: '150 ETH → Exploiter 2',
    },
    {
        time: 'Feb 23 · 09:17–09:26 UTC',
        label: '🔁 Base → Ethereum via Relay (12 × 20 ETH)',
        desc: 'Second consolidation sweep: 12 × 20 ETH deposited to Relay Depository on Base. Relay Solver pays out 239.948 ETH to Exploiter 2 on Ethereum (minus small bridge fee). 10 ETH returned to Base as bridge change.',
        color: '#f97316',
        chain: 'Ethereum',
        amount: '239.948 ETH → Exploiter 2 (+10 ETH returned to Base)',
    },
    {
        time: 'Feb 23 · Post-bridge',
        label: '🔴 Current State — Funds Parked',
        desc: 'Exploiter 2 holds 467.29 ETH. Accumulator holds 300 ETH with zero outgoing TXs. Base has 19.23 ETH dust. BSC holds 38,746 USDC untouched. No recovery has occurred.',
        color: '#ef4444',
        chain: 'Ethereum',
        amount: '467.29 ETH + 300 ETH + 19.23 ETH + 38,746 USDC',
    },
];

const CHAIN_COLORS = { Base: '#06b6d4', Ethereum: '#6366f1', BSC: '#eab308' };

const CHAINS = [
    { id: 'flow', label: '💸 Fund Flow', desc: 'End-to-end money trail' },
    { id: 'ethereum', label: '⬡ Ethereum', desc: '767 ETH across 2 wallets' },
    { id: 'base', label: '🔵 Base', desc: '19 ETH remaining' },
    { id: 'bsc', label: '🟡 BSC', desc: '38,746 USDC parked' },
];

function StatCard({ color = 'var(--text-primary)', label, value, sub }) {
    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderTop: `3px solid ${color}`,
            borderRadius: '10px',
            padding: '16px 18px',
        }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem', color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
        </div>
    );
}

function WalletCard({ title, emoji, address, fields, statusText, statusColor }) {
    return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{emoji} {title}</div>
                {statusText && (
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                        padding: '3px 8px', borderRadius: '4px',
                        background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
                    }}>{statusText}</span>
                )}
            </div>
            <div style={{ marginBottom: '14px' }}>
                <AddrChip address={address} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {fields.map(({ label, value, highlight, color }) => (
                    <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: highlight ? 700 : 500, color: color || (highlight ? 'var(--text-primary)' : 'var(--text-secondary)') }}>{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function EvmChains() {
    const [view, setView] = useState('flow');
    const { ethereum, base, bsc } = EVM_CHAINS;

    return (
        <section className="section active">
            <h1 className="section-title">EVM Chain Monitoring</h1>
            <p className="section-subtitle">
                Exploit proceeds tracked across Ethereum, Base, and BSC via Allbridge.
                Single attacker address: <AddrChip address="0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482" />
            </p>

            {/* Top-Level Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                <StatCard color="#ef4444" label="Ethereum — Exploiter 2" value="467.29 ETH" sub="~$863K · active" />
                <StatCard color="#64748b" label="Ethereum — Accumulator" value="300.00 ETH" sub="~$554K · dormant" />
                <StatCard color="#06b6d4" label="Base — Remaining" value="19.23 ETH" sub="~$35.5K · mostly drained" />
                <StatCard color="#eab308" label="BSC — Parked USDC" value="38,746 USDC" sub="~$38.7K · untouched" />
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {CHAINS.map((c) => {
                    const isActive = view === c.id;
                    return (
                        <button key={c.id} onClick={() => setView(c.id)} style={{
                            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                            border: `1.5px solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}`,
                            background: isActive ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.85rem',
                            transition: 'all 0.15s',
                        }}>
                            {c.label}
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>{c.desc}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── FUND FLOW TIMELINE ── */}
            {view === 'flow' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">💸 Funds Flow — Stellar to EVM</h3>
                        <span className="card-badge critical">8 STAGES</span>
                    </div>
                    <p className="trace-note" style={{ marginBottom: '24px' }}>
                        End-to-end path of stolen funds from the Stellar exploit to current EVM holdings.
                        Follow the arrows to understand how proceeds were laundered across chains.
                    </p>
                    <div style={{ position: 'relative', paddingLeft: '28px' }}>
                        {/* Vertical timeline line */}
                        <div style={{
                            position: 'absolute', left: '10px', top: 0, bottom: 0,
                            width: '2px', background: 'var(--border)',
                        }} />

                        {EVM_FLOW_EVENTS.map((evt, i) => (
                            <div key={i} style={{ position: 'relative', marginBottom: i < EVM_FLOW_EVENTS.length - 1 ? '24px' : 0 }}>
                                {/* Timeline dot */}
                                <div style={{
                                    position: 'absolute', left: '-24px', top: '14px',
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: evt.color, border: '2px solid var(--bg-primary)',
                                    boxShadow: `0 0 8px ${evt.color}66`,
                                }} />

                                <div style={{
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                    borderLeft: `3px solid ${evt.color}`,
                                    borderRadius: '8px', padding: '14px 16px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{evt.label}</div>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {evt.chain && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700,
                                                    padding: '2px 7px', borderRadius: '4px',
                                                    background: `${CHAIN_COLORS[evt.chain]}22`,
                                                    color: CHAIN_COLORS[evt.chain],
                                                    border: `1px solid ${CHAIN_COLORS[evt.chain]}44`,
                                                }}>{evt.chain}</span>
                                            )}
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{evt.time}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{evt.desc}</div>
                                    {evt.amount && (
                                        <div style={{
                                            marginTop: '8px', display: 'inline-block',
                                            fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem',
                                            color: evt.color, background: `${evt.color}18`,
                                            padding: '3px 10px', borderRadius: '4px',
                                        }}>→ {evt.amount}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ETHEREUM ── */}
            {view === 'ethereum' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        <StatCard color="#ef4444" label="Exploiter 2" value="467.29 ETH" sub="~$863K · 45 TXs · ACTIVE" />
                        <StatCard color="#64748b" label="Accumulator" value="300.00 ETH" sub="~$554K · 6 TXs · ZERO outgoing" />
                        <StatCard color="#6366f1" label="Combined on Ethereum" value="767.29 ETH" sub="~$1.42M total" />
                    </div>

                    <WalletCard
                        emoji="🔴"
                        title="YieldBlox Exploiter 2"
                        address={ethereum.exploiter2.address}
                        statusText="ACTIVE"
                        statusColor="#ef4444"
                        fields={[
                            { label: 'ETH Balance', value: '467.293506693636236063 ETH', highlight: true },
                            { label: 'USD Value', value: '~$863,000', color: '#ef4444' },
                            { label: 'Transactions', value: '45 total TXs' },
                            { label: 'Funded By', value: 'Allbridge Core Bridge (Stellar)' },
                            { label: 'Last Activity', value: 'Relay Protocol swaps — Feb 23 09:17 UTC' },
                            { label: 'Spam Tokens', value: 'FlashLoan + ROBO ($0 value)' },
                        ]}
                    />

                    <WalletCard
                        emoji="💤"
                        title="YieldBlox Exploiter 3 — Accumulator"
                        address={ethereum.accumulator.address}
                        statusText="DORMANT"
                        statusColor="#64748b"
                        fields={[
                            { label: 'ETH Balance', value: '300.000000021 ETH', highlight: true },
                            { label: 'USD Value', value: '~$554,000', color: '#64748b' },
                            { label: 'Transactions', value: '6 total TXs' },
                            { label: 'Outgoing TXs', value: 'ZERO — funds are parked', color: '#22c55e' },
                            { label: 'Funded By', value: 'Exploiter 2 (200 ETH + 100 ETH)' },
                            { label: 'Spam Tokens', value: 'FlashLoan ($0 value)' },
                        ]}
                    />

                    <div className="alert-banner" style={{ borderColor: '#6366f1', background: 'rgba(99,102,241,0.08)' }}>
                        <div className="alert-icon">🧠</div>
                        <div>
                            <div className="alert-title" style={{ color: '#6366f1' }}>INTERPRETATION</div>
                            <div className="alert-text">
                                Exploiter 2 is the active laundering wallet — it receives from Base and BSC via Allbridge, swaps on Uniswap, and seeds the Accumulator.
                                The Accumulator (Exploiter 3) is a "cold storage" park — 300 ETH placed there and not moved since. Combined: <strong>767 ETH (~$1.42M)</strong> on Ethereum.
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── BASE ── */}
            {view === 'base' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        <StatCard color="#06b6d4" label="Remaining Balance" value="19.23 ETH" sub="~$35,500 — dust" />
                        <StatCard color="#ef4444" label="Bridged Out" value="~380 ETH" sub="Feb 22 · 15:00–16:00 UTC" />
                        <StatCard color="#94a3b8" label="Original Arrival" value="~$787K USDC" sub="16 Allbridge batches of ~$50K" />
                    </div>

                    <WalletCard
                        emoji="🔵"
                        title="Attacker Wallet — Base (mostly drained)"
                        address={base.attacker}
                        statusText="DRAINED"
                        statusColor="#06b6d4"
                        fields={[
                            { label: 'ETH Balance', value: '19.230867300554960522 ETH', highlight: true },
                            { label: 'USD Value', value: '~$35,500' },
                            { label: 'Transactions', value: '28 total TXs' },
                            { label: 'Original USDC In', value: '~$787K via 16 Allbridge batches' },
                            { label: 'Converted Via', value: 'UniswapX Priority Order → ETH' },
                            { label: 'Drained Via', value: 'Relay (12×20 ETH) + Across (10 TXs)' },
                            { label: 'Spam Tokens', value: '7 dust tokens ($0 value)' },
                            { label: 'Drain Date', value: 'Feb 22 · 15:00–16:00 UTC' },
                        ]}
                    />

                    <div className="card">
                        <div className="card-header"><h3 className="card-title">Key Contracts Used on Base</h3></div>
                        <div className="profile-field">
                            <span className="field-label">UniswapX Priority Order Reactor</span>
                            <AddrChip address="0x000000001ec5656dcdb24d90dfa42742738de729" />
                        </div>
                        <div className="profile-field">
                            <span className="field-label">Circle USDC (Base)</span>
                            <AddrChip address="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" />
                        </div>
                        <div className="profile-field">
                            <span className="field-label">Uniswap V4 Universal Router</span>
                            <AddrChip address={base.router} />
                        </div>
                    </div>
                </>
            )}

            {/* ── BSC ── */}
            {view === 'bsc' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        <StatCard color="#eab308" label="Parked USDC" value="38,746.50" sub="Binance-Peg USDC · ~$38.7K" />
                        <StatCard color="#94a3b8" label="BNB Balance" value="0.00184 BNB" sub="Dust only · ~$1.09" />
                        <StatCard color="#22c55e" label="Outgoing Transactions" value="ZERO" sub="No activity since arrival" />
                    </div>

                    <WalletCard
                        emoji="🟡"
                        title="USDC Holding Wallet — BSC (untouched)"
                        address={bsc.wallet}
                        statusText="UNTOUCHED"
                        statusColor="#eab308"
                        fields={[
                            { label: 'USDC Balance', value: '38,746.50073 Binance-Peg USDC', highlight: true, color: '#eab308' },
                            { label: 'USD Value', value: '~$38,700' },
                            { label: 'BNB (gas dust)', value: '0.001840000039944935 BNB' },
                            { label: 'External Transactions', value: '0' },
                            { label: 'Internal Transactions', value: '1 (Allbridge Core Bridge incoming)' },
                            { label: 'Token Transfers', value: '2' },
                            { label: 'Funded By', value: 'Allbridge Core Bridge (Stellar)' },
                            { label: 'Status', value: 'Parked — zero swaps, zero transfers' },
                        ]}
                    />

                    <div className="alert-banner" style={{ borderColor: '#eab308', background: 'rgba(234,179,8,0.08)' }}>
                        <div className="alert-icon">👁️</div>
                        <div>
                            <div className="alert-title" style={{ color: '#eab308' }}>MONITORING ACTIVE</div>
                            <div className="alert-text">
                                38,746 USDC landed on BSC via Allbridge and has not moved since arrival.
                                Any outgoing transfer would appear immediately in BSC token transfer logs under this address.
                                This is likely a "forgotten" or "backup" bag — worth ~$38.7K.
                            </div>
                        </div>
                    </div>
                </>
            )}

        </section>
    );
}
