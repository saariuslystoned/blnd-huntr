import { EVM_CHAINS } from '../data/investigation';
import AddrChip from '../components/AddrChip';

export default function Base() {
    const { base } = EVM_CHAINS;
    return (
        <section className="section active">
            <h1 className="section-title">Base Tracking</h1>
            <p className="section-subtitle">Active swapping through UniswapX Priority Orders.</p>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Main Attacker (Base)</h3>
                    <span className="card-badge active">{base.status}</span>
                </div>
                <div className="stats-grid">
                    <div className="stat-card cyan">
                        <div className="stat-label">Current Balance</div>
                        <div className="stat-value">{base.balance}</div>
                        <div className="stat-detail">USDC/ETH Mix</div>
                    </div>
                </div>
                <div className="profile-field" style={{ marginTop: '16px' }}>
                    <span className="field-label">Uniswap V4 Router</span>
                    <AddrChip address={base.router} />
                </div>
            </div>
        </section>
    );
}
