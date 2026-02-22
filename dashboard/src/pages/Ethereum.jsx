import { EVM_CHAINS } from '../data/investigation';
import AddrChip from '../components/AddrChip';

export default function Ethereum() {
    const { accumulator, vanityRing } = EVM_CHAINS.ethereum;
    return (
        <section className="section active">
            <h1 className="section-title">Ethereum Monitoring</h1>
            <p className="section-subtitle">Tracking the accumulator and vanity gas rings.</p>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">💰 THE ACCUMULATOR</h3>
                    <span className="card-badge critical">Dormant</span>
                </div>
                <div className="network-node accumulator">
                    <div className="node-label"><AddrChip address={accumulator.address} /></div>
                    <div className="node-detail">
                        Balance: <strong>{accumulator.balance}</strong><br />
                        Outgoing TXs: <strong>{accumulator.outgoingTxs}</strong>
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
