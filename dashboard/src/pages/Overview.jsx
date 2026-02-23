import { STATS, TIMELINE } from '../data/investigation';
import LiveBalances from '../components/LiveBalances';

export default function Overview() {
    return (
        <section className="section active">
            <div className="hero-header">
                <div className="hero-tag">Active Forensic Track</div>
                <h1 className="section-title">Blend Protocol Exploit</h1>
                <p className="section-subtitle">
                    Cross-chain investigation into the February 22, 2026 oracle manipulation.
                </p>
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
                    <div className="stat-label">Frozen (Main Wallet)</div>
                    <div className="stat-value">{STATS.frozenXlm}</div>
                    <div className="stat-detail">🔒 Locked on Stellar</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-label">Total Off-Chain (Est)</div>
                    <div className="stat-value">{STATS.netExtraction}</div>
                    <div className="stat-detail">$1M USDC + ~$1M from XLM → bridged</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-label">XLM Conversion (Slippage)</div>
                    <div className="stat-value orange">{STATS.slippageBurn}</div>
                    <div className="stat-detail">{STATS.xlmConverted}</div>
                </div>
                <div className="stat-card yellow">
                    <div className="stat-label">Intermediary XLM</div>
                    <div className="stat-value">{STATS.intermediaryXlm}</div>
                    <div className="stat-detail">⚠️ 6 wallets — status TBD</div>
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
                    </div>
                    <div className="flow-chain">
                        <div className="flow-node stellar">
                            <div className="flow-label">Stellar Drain</div>
                            <div className="flow-value">61.2M XLM</div>
                        </div>
                        <div className="flow-arrow"><span>→</span></div>
                        <div className="flow-node bridge">
                            <div className="flow-label">Allbridge</div>
                            <div className="flow-value">USDC</div>
                        </div>
                        <div className="flow-arrow"><span>→</span></div>
                        <div className="flow-node danger">
                            <div className="flow-label">EVM Chains</div>
                            <div className="flow-value">~$1M</div>
                        </div>
                    </div>
                    <div className="impact-summary">
                        <div className="impact-row">
                            <span className="impact-label">Backstop Wiped</span>
                            <span className="impact-value red">{STATS.backstopWiped}</span>
                        </div>
                        <div className="impact-row">
                            <span className="impact-label">XLM Supplier Haircut</span>
                            <span className="impact-value red">{STATS.bXlmHaircut}</span>
                        </div>
                        <div className="impact-row">
                            <span className="impact-label">USDC Supplier Haircut</span>
                            <span className="impact-value orange">{STATS.bUsdcHaircut}</span>
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
