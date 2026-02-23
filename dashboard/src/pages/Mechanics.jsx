import { ORACLE_PRICES, TOP_FILLS, LIQUIDATED_POSITIONS, LIQUIDATORS, STATS, EXPLOIT } from '../data/investigation';
import AddrChip from '../components/AddrChip';

export default function Mechanics() {
    return (
        <section className="section active">
            <h1 className="section-title">Exploit Mechanics</h1>
            <p className="section-subtitle">Technical breakdown of the oracle price manipulation and liquidation cascade.</p>

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
                    The attacker manipulated the Reflector on-chain oracle for two consecutive reports.
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
