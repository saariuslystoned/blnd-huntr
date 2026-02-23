import { EVM_CHAINS } from '../data/investigation';
import AddrChip from '../components/AddrChip';

export default function Ethereum() {
    const { exploiter2, accumulator, vanityRing, totalValue } = EVM_CHAINS.ethereum;
    return (
        <section className="section active">
            <h1 className="section-title">Ethereum Monitoring</h1>
            <p className="section-subtitle">Tracking Exploiter 2, Accumulator, and vanity gas rings. Total on Ethereum: <strong>{totalValue}</strong></p>

            <div className="card" style={{ borderLeft: '3px solid var(--critical)' }}>
                <div className="card-header">
                    <h3 className="card-title">🔴 {exploiter2.label}</h3>
                    <span className="card-badge critical">{exploiter2.status}</span>
                </div>
                <div className="network-node accumulator">
                    <div className="node-label"><AddrChip address={exploiter2.address} /></div>
                    <div className="node-detail">
                        Balance: <strong>{exploiter2.balance}</strong><br />
                        Transactions: <strong>{exploiter2.txCount}</strong><br />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{exploiter2.note}</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">💰 {accumulator.label} (Accumulator)</h3>
                    <span className="card-badge">{accumulator.status}</span>
                </div>
                <div className="network-node accumulator">
                    <div className="node-label"><AddrChip address={accumulator.address} /></div>
                    <div className="node-detail">
                        Balance: <strong>{accumulator.balance}</strong><br />
                        Transactions: <strong>{accumulator.txCount}</strong><br />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{accumulator.note}</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Vanity Gas Ring #1</h3>
                </div>
                <div className="network-grid">
                    {vanityRing.map((v, i) => (
                        <div key={i} className="network-node vanity">
                            <div className="node-label">{v.address}</div>
                            <div className="node-detail">Funded by {v.funder}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
