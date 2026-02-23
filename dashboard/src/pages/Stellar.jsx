import { EXPLOIT } from '../data/investigation';
import AddrChip from '../components/AddrChip';
import LivePayments from '../components/LivePayments';

export default function Stellar() {
    return (
        <section className="section active">
            <h1 className="section-title">Stellar Network Analysis</h1>
            <p className="section-subtitle">Tracking the primary funding and bridge wallets.</p>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Primary Attacker Wallet</h3>
                    <span className="card-badge active">Holding ~45M XLM</span>
                </div>
                <div className="network-node phish">
                    <div className="node-label">
                        <AddrChip address="GBO7VUL2TOKPWFAWKATIW7K3QYA7WQ63VDY5CAE6AFUUX6BHZBOC2WXC" />
                    </div>
                    <div className="node-detail">Created Feb 14, 2026 | Funded by GC2XJK...FZIB</div>
                </div>

                <div className="table-wrapper" style={{ marginTop: '20px' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Target Asset</th>
                                <th>Amount</th>
                                <th>TX Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="tag red">E/BORROW</span></td>
                                <td>native XLM</td>
                                <td className="mono">61,249,278.3</td>
                                <td><a href={`https://stellar.expert/explorer/public/tx/${EXPLOIT.txHash}`} target="_blank" rel="noreferrer" className="tx-link">{EXPLOIT.txHash.slice(0, 10)}...</a></td>
                            </tr>
                            <tr>
                                <td><span className="tag orange">BRIDGE</span></td>
                                <td>USDC (Base)</td>
                                <td className="mono">~50,000.0</td>
                                <td className="mono">Batch #8</td>
                            </tr>
                            <tr>
                                <td><span className="tag blue">DUMP</span></td>
                                <td>USTRY/USDC</td>
                                <td className="mono">94,420.0</td>
                                <td className="mono">00:22 UTC</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Blend Treasury Funding (G...SXI3)</h3>
                </div>
                <p className="trace-note">
                    The Blend treasury held the largest collateral position in the pool.
                    511.8M XLM was wired from the SDF conduit across 17 transactions over 10 months.
                </p>
                <div className="stats-grid" style={{ marginTop: '16px' }}>
                    <div className="stat-card blue">
                        <div className="stat-label">SDF → Treasury</div>
                        <div className="stat-value">511.8M XLM</div>
                        <div className="stat-detail">17 wires over 10 months</div>
                    </div>
                    <div className="stat-card cyan">
                        <div className="stat-label">Total Inflow</div>
                        <div className="stat-value">538.5M XLM</div>
                        <div className="stat-detail">Largest pool position</div>
                    </div>
                </div>
            </div>

            <LivePayments accountKey="attacker" label="Attacker Recent Payments (Live)" limit={10} />
            <LivePayments accountKey="attackerFunder" label="Attacker Funder Recent Payments (Live)" limit={5} />
        </section>
    );
}
