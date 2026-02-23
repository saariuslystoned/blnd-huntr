import { useState } from 'react';
import { EVM_CHAINS } from '../data/investigation';
import AddrChip from '../components/AddrChip';

const CHAIN_TABS = [
    { id: 'ethereum', label: 'Ethereum', color: 'var(--purple)', badge: 'CONSOLIDATED' },
    { id: 'base', label: 'Base', color: 'var(--cyan)', badge: 'DRAINED' },
    { id: 'bsc', label: 'BSC', color: 'var(--yellow)', badge: 'UNTOUCHED' },
];

export default function EvmChains() {
    const [chain, setChain] = useState('ethereum');
    const { ethereum, base, bsc } = EVM_CHAINS;

    return (
        <section className="section active">
            <h1 className="section-title">EVM Chain Monitoring</h1>
            <p className="section-subtitle">
                Same attacker address across all three chains:{' '}
                <code>0x2d1ce29b4af15fb6e76ba9995bbe1421e8546482</code>
            </p>

            {/* Chain Tab Bar */}
            <div className="filter-bar" style={{ marginBottom: '24px' }}>
                {CHAIN_TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`filter-btn ${chain === t.id ? 'active' : ''}`}
                        onClick={() => setChain(t.id)}
                        style={chain === t.id ? { borderColor: t.color, color: t.color } : {}}
                    >
                        {t.label}
                        <span className="badge" style={{ marginLeft: '6px', background: chain === t.id ? t.color : undefined }}>
                            {t.badge}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── ETHEREUM ── */}
            {chain === 'ethereum' && (
                <>
                    <div className="stats-grid" style={{ marginBottom: '20px' }}>
                        <div className="stat-card red">
                            <div className="stat-label">Exploiter 2 (ETH)</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>467.29 ETH</div>
                            <div className="stat-detail">~$863K · 45 TXs</div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-label">Accumulator (ETH)</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>300.00 ETH</div>
                            <div className="stat-detail">~$554K · DORMANT</div>
                        </div>
                        <div className="stat-card blue">
                            <div className="stat-label">ETH Total (on-chain)</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>767.29 ETH</div>
                            <div className="stat-detail">~$1.42M across 2 wallets</div>
                        </div>
                    </div>

                    {/* Exploiter 2 */}
                    <div className="card" style={{ borderLeft: '3px solid var(--critical)' }}>
                        <div className="card-header">
                            <h3 className="card-title">🔴 {ethereum.exploiter2.label}</h3>
                            <span className="card-badge critical">{ethereum.exploiter2.status}</span>
                        </div>
                        <div className="network-node accumulator">
                            <div className="node-label"><AddrChip address={ethereum.exploiter2.address} /></div>
                            <div className="node-detail">
                                <strong>ETH Balance:</strong> 467.293506693636236063 ETH<br />
                                <strong>Tokens:</strong> FlashLoan, ROBO (spam — $0)<br />
                                <strong>Transactions:</strong> {ethereum.exploiter2.txCount}<br />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ethereum.exploiter2.note}</span>
                            </div>
                        </div>
                    </div>

                    {/* Accumulator */}
                    <div className="card" style={{ marginTop: '16px' }}>
                        <div className="card-header">
                            <h3 className="card-title">💤 {ethereum.accumulator.label} — Accumulator</h3>
                            <span className="card-badge dormant">{ethereum.accumulator.status}</span>
                        </div>
                        <div className="network-node accumulator">
                            <div className="node-label"><AddrChip address={ethereum.accumulator.address} /></div>
                            <div className="node-detail">
                                <strong>ETH Balance:</strong> 300.000000021 ETH<br />
                                <strong>Tokens:</strong> FlashLoan (spam — $0)<br />
                                <strong>Transactions:</strong> {ethereum.accumulator.txCount} · <strong>Outgoing: ZERO</strong><br />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ethereum.accumulator.note}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vanity Gas Ring */}
                    <div className="card" style={{ marginTop: '16px' }}>
                        <div className="card-header">
                            <h3 className="card-title">🕸️ Vanity Gas Ring (0x0b2…3eC6 pattern)</h3>
                            <span className="card-badge">{ethereum.vanityRing.length} WALLETS</span>
                        </div>
                        <p className="trace-note" style={{ marginBottom: '12px' }}>
                            Phishing-funded dust wallets with vanity addresses mimicking the accumulator — used to obfuscate gas origin.
                        </p>
                        <div className="network-grid">
                            {ethereum.vanityRing.map((v, i) => (
                                <div key={i} className="network-node vanity">
                                    <div className="node-label" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.address}</div>
                                    <div className="node-detail">Funded by <span style={{ color: 'var(--red)' }}>{v.funder}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── BASE ── */}
            {chain === 'base' && (
                <>
                    <div className="stats-grid" style={{ marginBottom: '20px' }}>
                        <div className="stat-card cyan">
                            <div className="stat-label">Remaining Balance</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>19.23 ETH</div>
                            <div className="stat-detail">~$35.5K · 28 TXs</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-label">Bridged Out</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>~380 ETH</div>
                            <div className="stat-detail">Via Relay + Across → Ethereum</div>
                        </div>
                        <div className="stat-card blue">
                            <div className="stat-label">Spam Tokens</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>7</div>
                            <div className="stat-detail">BINDER, INV, LGNS, ROBO… ($0)</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Main Attacker Wallet — Base</h3>
                            <span className="card-badge">{base.status}</span>
                        </div>
                        <div className="network-node accumulator">
                            <div className="node-label"><AddrChip address={base.attacker} /></div>
                            <div className="node-detail">
                                <strong>ETH Balance:</strong> 19.230867300554960522 ETH (~$35.5K)<br />
                                <strong>Tokens:</strong> 7 spam/dust tokens — BINDER, INV, LGNS, Plankton, ROBO, TBA, US_POOL ($0)<br />
                                <strong>Total TXs:</strong> 28<br />
                                <strong>Activity:</strong> UniswapX Priority Order swaps (USDC → ETH), then bridge out<br />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{base.note}</span>
                            </div>
                        </div>
                        <div className="profile-field" style={{ marginTop: '16px' }}>
                            <span className="field-label">UniswapX Priority Order Reactor</span>
                            <AddrChip address="0x000000001ec5656dcdb24d90dfa42742738de729" />
                        </div>
                        <div className="profile-field">
                            <span className="field-label">USDC Contract (Circle, Base)</span>
                            <AddrChip address="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" />
                        </div>
                        <div className="profile-field">
                            <span className="field-label">Uniswap V4 Router</span>
                            <AddrChip address={base.router} />
                        </div>
                    </div>

                    <div className="conclusion-box" style={{ marginTop: '16px' }}>
                        <strong>Note:</strong> UniswapX is NOT a mixer — it's Uniswap's advanced order routing for large trades with minimal slippage. The attacker chose this for efficiency, not privacy.
                    </div>
                </>
            )}

            {/* ── BSC ── */}
            {chain === 'bsc' && (
                <>
                    <div className="stats-grid" style={{ marginBottom: '20px' }}>
                        <div className="stat-card yellow">
                            <div className="stat-label">Parked USDC</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>38,746.50</div>
                            <div className="stat-detail">Binance-Peg USDC · ~$38.7K</div>
                        </div>
                        <div className="stat-card blue">
                            <div className="stat-label">BNB Balance</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>0.00184</div>
                            <div className="stat-detail">Dust only (~$1.09)</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-label">Outgoing TXs</div>
                            <div className="stat-value" style={{ fontSize: '1.1rem' }}>ZERO</div>
                            <div className="stat-detail">No swaps or transfers</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">USDC Holding Wallet — BSC</h3>
                            <span className="card-badge dormant">{bsc.status}</span>
                        </div>
                        <div className="network-node accumulator">
                            <div className="node-label"><AddrChip address={bsc.wallet} /></div>
                            <div className="node-detail">
                                <strong>BNB Balance:</strong> 0.001840000039944935 BNB (~$1.09)<br />
                                <strong>Token Balance:</strong> 38,746.50073 Binance-Peg USDC (~$38.7K)<br />
                                <strong>External TXs:</strong> 0<br />
                                <strong>Internal TXs:</strong> 1 (Allbridge incoming)<br />
                                <strong>Token Transfers:</strong> 2<br />
                                <strong>Funded By:</strong> Allbridge Core Bridge
                            </div>
                        </div>
                    </div>

                    <div className="alert-banner" style={{ marginTop: '16px', borderColor: 'var(--yellow)', background: 'rgba(234,179,8,0.08)' }}>
                        <div className="alert-icon">⚠️</div>
                        <div>
                            <div className="alert-title" style={{ color: 'var(--yellow)' }}>FUNDS PARKED — MONITORING</div>
                            <div className="alert-text">
                                38,746 USDC arrived via Allbridge and has not moved. Any outgoing transfer will appear in BSC token transfer logs.
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
