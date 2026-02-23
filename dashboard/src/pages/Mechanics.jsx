import { ORACLE_PRICES, TOP_FILLS, LIQUIDATED_POSITIONS, LIQUIDATORS, STATS, EXPLOIT, SDEX_MANIPULATION } from '../data/investigation';
import AddrChip from '../components/AddrChip';

const TxLink = ({ hash, label }) => (
    <a href={`https://stellar.expert/explorer/public/tx/${hash}`} target="_blank" rel="noreferrer" className="tx-link">
        {label || `${hash.slice(0, 8)}...`}
    </a>
);

export default function Mechanics() {
    return (
        <section className="section active">
            <h1 className="section-title">Exploit Mechanics</h1>
            <p className="section-subtitle">Technical breakdown of the SDEX price manipulation, oracle exploit, and liquidation cascade.</p>

            {/* SDEX MANIPULATION — THE SMOKING GUN */}
            <div className="card" style={{ borderLeft: '3px solid var(--critical)' }}>
                <div className="card-header">
                    <h3 className="card-title">🔴 SDEX Manipulation — The Smoking Gun</h3>
                    <span className="card-badge critical">{SDEX_MANIPULATION.inflationFactor} Price Inflation</span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                    The attacker used a <strong>single-purpose burner account</strong> to place a {SDEX_MANIPULATION.inflationFactor} inflated USTRY sell offer on the Stellar DEX,
                    then used a <strong>second account</strong> to trade against it, setting the last traded price that the Reflector Oracle reported.
                    Total cost of the manipulation: <strong style={{ color: 'var(--critical)' }}>{SDEX_MANIPULATION.attackCost}</strong>.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="stat-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="stat-label">Burner Account</div>
                        <div className="stat-value" style={{ fontSize: '0.75rem' }}><AddrChip address={SDEX_MANIPULATION.burnerAccount} label="GCNF5...75HB" /></div>
                        <div className="stat-sub" style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>8 operations total · created for this attack only</div>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="stat-label">Trade Trigger Account</div>
                        <div className="stat-value" style={{ fontSize: '0.75rem' }}><AddrChip address={SDEX_MANIPULATION.triggerAccount} label="GDHRCQNC...ETN3" /></div>
                        <div className="stat-sub" style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Executed the trade that set the oracle price</div>
                    </div>
                    <div className="stat-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="stat-label">Oracle Price Set To</div>
                        <div className="stat-value">${SDEX_MANIPULATION.manipulatedPrice.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>USDC/USTRY</span></div>
                        <div className="stat-sub" style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: ~${SDEX_MANIPULATION.normalPrice} USDC/USTRY</div>
                    </div>
                </div>

                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Burner Account Operations (Complete Sequence)
                </h4>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Time (UTC)</th>
                                <th>TX</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SDEX_MANIPULATION.burnerOps.map((op) => (
                                <tr key={op.num} style={op.critical ? { background: 'rgba(239,68,68,0.12)', fontWeight: 600 } : {}}>
                                    <td>{op.num}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(op.time).toISOString().slice(5, 19).replace('T', ' ')}</td>
                                    <td><TxLink hash={op.tx} /></td>
                                    <td>{op.op}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <h4 style={{ color: 'var(--critical)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>🔴 Price-Setting Trade</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                        At <strong>00:10:21 UTC</strong>, the trigger account placed a <code>manage_buy_offer</code> buying {SDEX_MANIPULATION.priceSettingTx.filledAmount} with
                        a 108 USDC limit — crossing the burner's 106.74 sell offer. This executed a trade at {SDEX_MANIPULATION.priceSettingTx.filledValue},
                        which the Reflector Oracle then read as the USTRY market price.
                    </p>
                    <p style={{ margin: '0.75rem 0 0 0' }}>
                        <TxLink hash={SDEX_MANIPULATION.priceSettingTx.hash} label={`TX: ${SDEX_MANIPULATION.priceSettingTx.hash.slice(0, 16)}...`} />
                    </p>
                    {SDEX_MANIPULATION.offerStillActive && (
                        <p style={{ color: 'var(--warning)', margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                            ⚠️ The 106.74 sell offer is <strong>still active</strong> on the SDEX (offer #{SDEX_MANIPULATION.activeOfferId}, {SDEX_MANIPULATION.activeOfferRemaining} remaining)
                        </p>
                    )}
                </div>
            </div>

            {/* ORACLE TRACE */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Oracle Manipulation Trace</h3>
                    <span className="card-badge critical">Manipulated</span>
                </div>
                <div className="oracle-trace">
                    {ORACLE_PRICES.map((p, i) => (
                        <span key={i} className={p.status === 'manipulated' ? 'highlight' : 'warn'}>
                            {'{ '}price: {p.price}, timestamp: {p.timestamp}{' }'}
                            {p.status === 'manipulated' ? ' // ⚠️ 100× JUMP' : ' // Normal'}
                        </span>
                    ))}
                    <span className="invoke">Invoked CD74...MXXR lastprice("Stellar", CBLV...PNUR)</span>
                    <span className="event">├─ Result: Inflated Price (USTRY)</span>
                    <span className="invoke">Invoked CAS3...OWMA transfer([Blend Pool] → GBO7...WXC, 61.2M XLM)</span>
                    <span className="event">└─ Status: Confirmed</span>
                </div>
                <p className="trace-note">
                    The Blend pool oracle aggregator required 2 consecutive price reports within 10%.
                    The attacker's trade at 00:10 UTC set the last traded price. The oracle confirmed it at 00:15 and 00:20 UTC.
                </p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Top Liquidated Positions</h3>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Account</th>
                                <th>Fills</th>
                                <th>XLM Seized</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LIQUIDATED_POSITIONS.map((p) => (
                                <tr key={p.rank}>
                                    <td>{p.rank}</td>
                                    <td><AddrChip address={p.account} label={p.short} />{p.label && <span className="row-label">{p.label}</span>}</td>
                                    <td>{p.fills}</td>
                                    <td className="mono">{p.xlm}</td>
                                    <td>{p.pctTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Top 4 Fills (SXI3 — SDF Position)</h3>
                    <span className="card-badge">70.7M XLM in 2 min</span>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Time (UTC)</th>
                                <th>XLM Collateral</th>
                                <th>TX Hash</th>
                                <th>Filler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TOP_FILLS.map((f) => (
                                <tr key={f.num}>
                                    <td>{f.num}</td>
                                    <td>{f.time}</td>
                                    <td className="mono">{f.xlm}</td>
                                    <td>
                                        <a href={`https://stellar.expert/explorer/public/tx/${f.txHash}`} target="_blank" rel="noreferrer" className="tx-link">
                                            {f.txHash.slice(0, 8)}...
                                        </a>
                                    </td>
                                    <td>{f.filler}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Liquidator Summary</h3>
                    <span className="card-badge">{STATS.totalAuctionFills} fills total</span>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Fills</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LIQUIDATORS.map((l) => (
                                <tr key={l.account}>
                                    <td><AddrChip address={l.account} label={l.short} /></td>
                                    <td>{l.fills}</td>
                                    <td>{l.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
