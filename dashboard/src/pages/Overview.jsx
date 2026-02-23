import { STATS, TIMELINE, ANNOUNCEMENT } from '../data/investigation';
import LiveBalances from '../components/LiveBalances';

export default function Overview() {
    return (
        <section className="section active">
            <div className="hero-header">
                <div className="hero-tag">Active Forensic Track</div>
                <h1 className="section-title">Blend Protocol — USTRY Oracle Exploit</h1>
                <p className="section-subtitle">
                    On-chain investigation into the <strong>February 2026 USTRY oracle manipulation</strong> that
                    drained the Blend Protocol (YieldBlox Pool) on the Stellar network.
                </p>
                <p className="section-subtitle" style={{ marginTop: '8px', opacity: 0.85, fontSize: '0.92em' }}>
                    <strong>Blend and the Reflector Oracle both functioned exactly as designed.</strong> The attacker
                    exploited the thin on-chain liquidity of USTRY — a low-volume asset — to artificially inflate its
                    DEX price, which the oracle read as the real market price. With USTRY collateral valued at an
                    inflated rate, the attacker borrowed ~61.2M XLM against it and walked away. The Blend protocol
                    and community were the target; no code was broken.
                </p>
            </div>

            {/* COMPENSATION ANNOUNCEMENT */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))',
                border: '1px solid #22c55e',
                borderLeft: '5px solid #22c55e',
                borderRadius: '10px',
                padding: '18px 22px',
                marginBottom: '20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
            }}>
                <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>✅</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#22c55e', marginBottom: '6px' }}>
                        {ANNOUNCEMENT.headline}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                        {ANNOUNCEMENT.body}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ⚠️ <em>{ANNOUNCEMENT.exclusions}</em> &nbsp;·&nbsp; {ANNOUNCEMENT.source} &nbsp;·&nbsp; {ANNOUNCEMENT.date}
                    </div>
                </div>
            </div>

            <div className="alert-banner">
                <div className="alert-icon">🔴</div>
                <div className="alert-content">
                    <div className="alert-title">CRITICAL TARGET: ACCUMULATOR WALLET</div>
                    <div className="alert-text">
                        <strong>0x0b2B16E1...3eC6</strong> currently holds <strong>$591,808 in ETH</strong> on
                        Ethereum. Status is <strong>DORMANT</strong>. Any outgoing transaction indicates further movement
                        to mixers or CEXs.
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card red">
                    <div className="stat-label">Drained from Pool</div>
                    <div className="stat-value red">{STATS.drainedXlm}</div>
                    <div className="stat-detail">+ {STATS.drainedUsdc}</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-label">Frozen</div>
                    <div className="stat-value">{STATS.frozenXlm}</div>
                    <div className="stat-detail">🔒 {STATS.frozenDetail}</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-label">Total Off-Chain (Est)</div>
                    <div className="stat-value">{STATS.netExtraction}</div>
                    <div className="stat-detail">{STATS.netExtractionDetail}</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-label">XLM → USDC Converted</div>
                    <div className="stat-value orange">{STATS.xlmConverted}</div>
                    <div className="stat-detail">Slippage: {STATS.slippage} ({STATS.slippageDetail})</div>
                </div>
                <div className="stat-card yellow">
                    <div className="stat-label">🚨 To Binance (KYC)</div>
                    <div className="stat-value">{STATS.xlmToBinance}</div>
                    <div className="stat-detail">{STATS.xlmToBinanceDetail}</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-label">⚠️ To ChangeNow (No KYC!)</div>
                    <div className="stat-value red">{STATS.xlmToChangeNow}</div>
                    <div className="stat-detail">{STATS.xlmToChangeNowDetail}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-label">Recovery Status</div>
                    <div className="stat-value green">{STATS.recovered}</div>
                    <div className="stat-detail">{STATS.recoveredPct} Recovered</div>
                </div>
            </div>

            <LiveBalances />

            <div className="cols-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Exploit Flow</h3>
                        <span className="card-badge red">Full Path</span>
                    </div>

                    {/* Phase 1: The Exploit */}
                    <div className="flow-phase">
                        <div className="flow-phase-label">① Oracle Manipulation</div>
                        <div className="flow-chain">
                            <div className="flow-node" style={{ background: 'var(--orange-bg)', borderColor: 'var(--orange)' }}>
                                <div className="flow-label">USTRY Liquidity</div>
                                <div className="flow-value">Thin Market</div>
                            </div>
                            <div className="flow-arrow"><span>→</span></div>
                            <div className="flow-node" style={{ background: 'var(--red-bg)', borderColor: 'var(--red)' }}>
                                <div className="flow-label">DEX Price Inflated</div>
                                <div className="flow-value">100×</div>
                            </div>
                            <div className="flow-arrow"><span>→</span></div>
                            <div className="flow-node" style={{ background: 'var(--purple-bg)', borderColor: 'var(--purple)' }}>
                                <div className="flow-label">Oracle Reads Price</div>
                                <div className="flow-value">Reflector</div>
                            </div>
                        </div>
                    </div>

                    {/* Phase 2: The Borrow */}
                    <div className="flow-phase">
                        <div className="flow-phase-label">② Collateral Borrow</div>
                        <div className="flow-chain">
                            <div className="flow-node" style={{ background: 'var(--orange-bg)', borderColor: 'var(--orange)' }}>
                                <div className="flow-label">Deposit ~150K USTRY</div>
                                <div className="flow-value">$159K Real</div>
                            </div>
                            <div className="flow-arrow"><span>→</span></div>
                            <div className="flow-node stellar">
                                <div className="flow-label">Blend Pool</div>
                                <div className="flow-value">Borrow</div>
                            </div>
                            <div className="flow-arrow"><span>→</span></div>
                            <div className="flow-node danger">
                                <div className="flow-label">Attacker Receives</div>
                                <div className="flow-value" style={{ color: 'var(--red)' }}>61.2M XLM</div>
                            </div>
                        </div>
                    </div>

                    {/* Phase 3: The Exit Channels */}
                    <div className="flow-phase">
                        <div className="flow-phase-label">③ Exit Channels</div>
                        <div className="flow-branches">
                            <div className="flow-branch">
                                <div className="flow-branch-connector blue" />
                                <div className="flow-node stellar" style={{ width: '100%' }}>
                                    <div className="flow-label">🔒 Frozen on Stellar</div>
                                    <div className="flow-value">~48M XLM</div>
                                    <div className="flow-detail">Main wallet + Swap Hub + Funder</div>
                                </div>
                            </div>
                            <div className="flow-branch">
                                <div className="flow-branch-connector yellow" />
                                <div className="flow-node" style={{ width: '100%', background: 'var(--yellow-bg)', borderColor: 'var(--yellow)' }}>
                                    <div className="flow-label">🚨 Binance (KYC)</div>
                                    <div className="flow-value">3.77M XLM</div>
                                    <div className="flow-detail">Relay 3.54M + Small 234K</div>
                                </div>
                            </div>
                            <div className="flow-branch">
                                <div className="flow-branch-connector red" />
                                <div className="flow-node danger" style={{ width: '100%' }}>
                                    <div className="flow-label">⚠️ ChangeNow (No KYC)</div>
                                    <div className="flow-value" style={{ color: 'var(--red)' }}>3.97M XLM</div>
                                    <div className="flow-detail">Instant swap, no identity</div>
                                </div>
                            </div>
                            <div className="flow-branch">
                                <div className="flow-branch-connector purple" />
                                <div className="flow-node bridge" style={{ width: '100%' }}>
                                    <div className="flow-label">DEX Swap → Allbridge</div>
                                    <div className="flow-value">~5M XLM → $787K</div>
                                    <div className="flow-detail">16 batches via path_payment</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phase 4: EVM Destinations */}
                    <div className="flow-phase">
                        <div className="flow-phase-label">④ EVM Destinations</div>
                        <div className="flow-chain">
                            <div className="flow-node" style={{ background: 'var(--cyan-bg)', borderColor: 'var(--cyan)' }}>
                                <div className="flow-label">Base</div>
                                <div className="flow-value">~$787K</div>
                                <div className="flow-detail">16 batches, swapping</div>
                            </div>
                            <div className="flow-arrow"><span>→</span></div>
                            <div className="flow-node" style={{ background: 'var(--purple-bg)', borderColor: 'var(--purple)' }}>
                                <div className="flow-label">Ethereum</div>
                                <div className="flow-value">~$172K</div>
                                <div className="flow-detail">→ Accumulator $591K</div>
                            </div>
                            <div className="flow-arrow"><span>→</span></div>
                            <div className="flow-node" style={{ background: 'var(--orange-bg)', borderColor: 'var(--orange)' }}>
                                <div className="flow-label">BSC</div>
                                <div className="flow-value">~$38.7K</div>
                                <div className="flow-detail">Untouched</div>
                            </div>
                        </div>
                    </div>

                    {/* Collateral Impact */}
                    <div className="impact-summary">
                        <div className="flow-phase-label" style={{ marginBottom: '8px' }}>Pool Impact</div>
                        <div className="impact-row">
                            <span className="impact-label">Backstop Wiped</span>
                            <span className="impact-value red">{STATS.backstopWiped}</span>
                        </div>
                        <div className="impact-row">
                            <span className="impact-label">XLM Supplier Haircut</span>
                            <span className="impact-value" style={{ color: '#22c55e' }}>{STATS.bXlmHaircut} — ✅ BEING COMPENSATED</span>
                        </div>
                        <div className="impact-row">
                            <span className="impact-label">USDC Supplier Haircut</span>
                            <span className="impact-value" style={{ color: '#22c55e' }}>{STATS.bUsdcHaircut} — ✅ BEING COMPENSATED</span>
                        </div>
                        <div className="impact-row">
                            <span className="impact-label">Liquidation Fills</span>
                            <span className="impact-value">{STATS.totalAuctionFills}</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Activity Timeline</h3>
                    </div>
                    <div className="timeline">
                        {TIMELINE.map((item, i) => (
                            <div key={i} className={`timeline-item ${item.severity}`}>
                                <div className="timeline-time">{item.time}</div>
                                <div className="timeline-title">{item.title}</div>
                                <div className="timeline-desc">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
