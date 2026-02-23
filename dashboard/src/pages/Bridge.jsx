import { useState } from 'react';
import { BRIDGE_BATCHES, BRIDGE_STATUS, BRIDGE_OUT_TXS, BRIDGE_CHAIN_SUMMARY, EVM_CHAINS, XLM_FLOW_MAP } from '../data/investigation';
import AddrChip from '../components/AddrChip';

const CHAIN_COLORS = {
    Base: 'cyan',
    Ethereum: 'purple',
    BSC: 'yellow',
};

const STATUS_CLASSES = {
    'ACTIVE Swapping': 'active',
    'SWAPPED → Accumulator': 'dormant',
    'UNTOUCHED': 'critical',
};

export default function Bridge() {
    const [chainFilter, setChainFilter] = useState('all');

    const filteredTxs = chainFilter === 'all'
        ? BRIDGE_OUT_TXS
        : BRIDGE_OUT_TXS.filter(tx => tx.chain === chainFilter);

    const chains = ['all', 'Base', 'Ethereum', 'BSC'];

    const { lastUpdate, source, xlmFrozen, xlmInIntermediaries, xlmConverted,
        usdcBridgedOut, usdcFromXlm, totalOffChain, negotiations, negotiationsNote } = BRIDGE_STATUS;

    return (
        <section className="section active">
            <h1 className="section-title">Cross-Chain Tracking</h1>
            <p className="section-subtitle">
                All Allbridge Core <code>swap_and_bridge</code> outgoing transactions from Stellar to EVM chains.
            </p>

            {/* Latest Intel Banner */}
            <div className="alert-banner" style={{ borderColor: 'var(--orange)', background: 'var(--orange-bg)' }}>
                <div className="alert-icon">📡</div>
                <div>
                    <div className="alert-title" style={{ color: 'var(--orange)' }}>
                        LATEST INTEL — {BRIDGE_STATUS.lastUpdate}
                    </div>
                    <div className="alert-text">
                        Source: <strong>{source}</strong> —{' '}
                        <strong>{xlmFrozen}</strong> frozen in main wallet.{' '}
                        Stream 1: <strong>{usdcBridgedOut}</strong> (direct borrow, immediately bridged).{' '}
                        Stream 2: <strong>{xlmConverted}</strong> (via intermediaries).{' '}
                        Total off-chain: <strong style={{ color: 'var(--red)' }}>{totalOffChain}</strong>.{' '}
                        {negotiations && (
                            <span style={{ color: 'var(--green)', fontWeight: 700 }}>
                                🤝 {negotiationsNote}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card red">
                    <div className="stat-label">Total Off-Chain (Est)</div>
                    <div className="stat-value">{totalOffChain}</div>
                    <div className="stat-detail">Both streams combined</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-label">Stream 1 — Direct USDC Borrow</div>
                    <div className="stat-value">{usdcBridgedOut.split(' ')[0]}</div>
                    <div className="stat-detail">Bridged immediately post-exploit</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-label">Stream 2 — XLM Conversion</div>
                    <div className="stat-value">{usdcFromXlm.split(' ')[0]}</div>
                    <div className="stat-detail">{xlmConverted}</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-label">XLM Frozen</div>
                    <div className="stat-value">{xlmFrozen.split(' ')[0]}</div>
                    <div className="stat-detail">Main attacker wallet</div>
                </div>
                <div className="stat-card yellow">
                    <div className="stat-label">Intermediary Wallets</div>
                    <div className="stat-value">{xlmInIntermediaries.split(' ')[0]}</div>
                    <div className="stat-detail">⚠️ Status TBD</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-label">Negotiations</div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>IN PROGRESS</div>
                    <div className="stat-detail">Per Blend core team</div>
                </div>
            </div>

            {/* Destination Address */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🎯 EVM Destination (All Chains)</h3>
                </div>
                <div className="profile-field">
                    <span className="field-label">Address</span>
                    <AddrChip address={BRIDGE_BATCHES.destAddress} />
                </div>
                <p className="trace-note" style={{ marginTop: '12px' }}>
                    Same address receives funds on Base, Ethereum, and BSC. All bridge calls use Soroban's{' '}
                    <code>swap_and_bridge</code> via Allbridge Core contracts.
                </p>
            </div>

            {/* Per-Chain Destination Cards */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Per-Chain Breakdown</h3>
                    <span className="card-badge">{BRIDGE_CHAIN_SUMMARY.length} CHAINS</span>
                </div>
                <div className="network-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {BRIDGE_CHAIN_SUMMARY.map((chain) => (
                        <div
                            key={chain.chain}
                            className={`network-node`}
                            style={{ borderLeftColor: `var(--${CHAIN_COLORS[chain.chain]})`, borderLeftWidth: '3px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div className="node-label" style={{ marginBottom: 0 }}>
                                    {chain.chain} <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Chain ID {chain.chainId}</span>
                                </div>
                                <span className={`card-badge ${STATUS_CLASSES[chain.destStatus] || ''}`} style={{ fontSize: '0.55rem' }}>
                                    {chain.destStatus}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="node-detail">Total Bridged</span>
                                    <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{chain.totalBridged}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="node-detail">Batches</span>
                                    <span className="mono" style={{ fontSize: '0.82rem' }}>{chain.batches}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="node-detail">Swap Router</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{chain.swapRouter}</span>
                                </div>
                                <div className="node-detail" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                    {chain.note}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* XLM Laundering Network */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">🕸️ XLM Laundering Network</h3>
                    <span className="card-badge critical">{XLM_FLOW_MAP.length} WALLETS</span>
                </div>
                <p className="trace-note" style={{ marginBottom: '16px' }}>
                    16.18M XLM was fanned out to 6 intermediary wallets using a dust-triggered C2 pattern.
                    Each withdrawal is preceded by a 0.001 XLM signal from a paired trigger address.
                </p>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Role</th>
                                <th>Address</th>
                                <th>Trigger</th>
                                <th>Received</th>
                                <th>Remaining</th>
                                <th>Drained</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {XLM_FLOW_MAP.map((w, i) => (
                                <tr key={w.address}>
                                    <td className="mono">{i + 1}</td>
                                    <td>
                                        <span className={`tag ${w.role === 'Primary Swap Hub' ? 'red' :
                                            w.role === 'Relay' ? 'orange' :
                                                w.role === 'Distribution' ? 'yellow' :
                                                    w.role === 'Funder/Ops' ? 'purple' : 'cyan'
                                            }`}>{w.role}</span>
                                    </td>
                                    <td><AddrChip address={w.address} /></td>
                                    <td className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.trigger}</td>
                                    <td className="mono" style={{ fontWeight: 600 }}>{w.received.toLocaleString()} XLM</td>
                                    <td className="mono" style={{
                                        fontWeight: 600,
                                        color: w.remaining < 100 ? 'var(--green)' : 'var(--orange)'
                                    }}>{w.remaining.toLocaleString()} XLM</td>
                                    <td className="mono" style={{ color: 'var(--red)' }}>
                                        {((1 - w.remaining / w.received) * 100).toFixed(0)}%
                                    </td>
                                    <td style={{ fontSize: '0.72rem', maxWidth: '200px' }}>{w.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bridge Out TX Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Bridge Out Transactions ({filteredTxs.length})</h3>
                    <span className="card-badge critical">{BRIDGE_OUT_TXS.length} TOTAL</span>
                </div>

                {/* Chain Filter */}
                <div className="filter-bar">
                    {chains.map((c) => (
                        <button
                            key={c}
                            className={`filter-btn ${chainFilter === c ? 'active' : ''}`}
                            onClick={() => setChainFilter(c)}
                        >
                            {c === 'all' ? `All (${BRIDGE_OUT_TXS.length})` : `${c} (${BRIDGE_OUT_TXS.filter(tx => tx.chain === c).length})`}
                        </button>
                    ))}
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Chain</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Destination</th>
                                <th>Bridge Contract</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTxs.map((tx, i) => (
                                <tr key={`${tx.chain}-${tx.batch}`}>
                                    <td className="mono">
                                        {chainFilter === 'all'
                                            ? i + 1
                                            : tx.batch
                                        }
                                    </td>
                                    <td>
                                        <span className={`tag ${CHAIN_COLORS[tx.chain]}`}>
                                            {tx.chain}
                                        </span>
                                    </td>
                                    <td className="mono" style={{ fontWeight: 600 }}>{tx.amount}</td>
                                    <td>
                                        <code style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>{tx.method}</code>
                                    </td>
                                    <td>
                                        <AddrChip address={tx.dest} />
                                    </td>
                                    <td style={{ fontSize: '0.72rem' }}>
                                        {tx.allbridgeContract.startsWith('0x') ? (
                                            <AddrChip address={tx.allbridgeContract} />
                                        ) : (
                                            <span className="mono" style={{ color: 'var(--text-muted)' }}>{tx.allbridgeContract}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="tag green">{tx.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Allbridge Decoder Reference */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Allbridge XDR Decoder Reference</h3>
                </div>
                <div className="oracle-trace">
                    <span className="invoke">Param 5</span> → Amount (U128): e.g., 50,000 USDC (7 decimal places)
                    <span className="invoke">Param 6</span> → Destination Address (Bytes): last 20 bytes = EVM address
                    <span className="invoke">Param 7</span> → Chain ID (U32): <span className="highlight">9</span> = Base, <span className="highlight">1</span> = Ethereum, <span className="highlight">2</span> = BSC
                    <span className="invoke">Param 8</span> → Token Address (Bytes): last 20 bytes = EVM token contract
                </div>
                <div className="conclusion-box" style={{ marginTop: '16px' }}>
                    <strong>How to decode new bridge TXs:</strong> When new <code>swap_and_bridge</code> calls appear on the attacker wallet,
                    run <code>python scripts/decode_allbridge.py</code> with the base64 XDR parameters to extract destination chain, address, and amount.
                </div>
            </div>
        </section>
    );
}
