import { BRIDGE_BATCHES } from '../data/investigation';
import AddrChip from '../components/AddrChip';

export default function Bridge() {
    return (
        <section className="section active">
            <h1 className="section-title">Cross-Chain Tracking</h1>
            <p className="section-subtitle">Allbridge Core outgoing path monitoring.</p>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Bridge Decoder Information</h3>
                </div>
                <div className="oracle-trace">
                    <span className="invoke">Chain ID 9</span> → Base (Confirmed)
                    <span className="invoke">Chain ID 1</span> → Ethereum (High)
                    <span className="invoke">Chain ID 2</span> → BSC (Med)
                    <span className="warn">Param 6 (Dest)</span> → <AddrChip address={BRIDGE_BATCHES.destAddress} />
                    <span className="warn">Param 5 (Amt)</span> → {BRIDGE_BATCHES.batchSize}
                </div>
                <div className="stats-grid" style={{ marginTop: '20px' }}>
                    <div className="stat-card purple">
                        <div className="stat-label">Total Bridged Out</div>
                        <div className="stat-value">{BRIDGE_BATCHES.totalBridged}</div>
                        <div className="stat-detail">USDC Batched</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
