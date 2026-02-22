import { EVM_CHAINS } from '../data/investigation';

export default function BSC() {
    const { bsc } = EVM_CHAINS;
    return (
        <section className="section active">
            <h1 className="section-title">BSC Tracking</h1>
            <p className="section-subtitle">Untouched bridge funds.</p>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">USDC Holding Wallet</h3>
                    <span className="card-badge dormant">{bsc.status}</span>
                </div>
                <div className="stats-grid">
                    <div className="stat-card yellow">
                        <div className="stat-label">Parked USDC</div>
                        <div className="stat-value">{bsc.balance}</div>
                        <div className="stat-detail">Binance-Peg USDC</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
