export default function PhishingNetwork() {
    return (
        <section className="section active">
            <h1 className="section-title">Phishing Network Map</h1>
            <p className="section-subtitle">EVM address-poisoning operation linked to the attacker's gas funding.</p>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Vanity Address Operation</h3>
                    <span className="card-badge critical">Linked</span>
                </div>
                <p className="trace-note">
                    The Ethereum accumulator wallet (<code>0x0b2B16E1...3eC6</code>) was funded by at least 3 known
                    address-poisoning wallets. These create near-lookalike addresses to trick users into sending funds
                    to attacker-controlled wallets.
                </p>

                <div className="network-grid" style={{ marginTop: '20px' }}>
                    <div className="network-node phish">
                        <div className="node-label">Phishing #1064860</div>
                        <div className="node-detail">Funded vanity gas for 0x0B2bC...3EC6</div>
                    </div>
                    <div className="network-node phish">
                        <div className="node-label">Phishing #1701177</div>
                        <div className="node-detail">Funded vanity gas for 0x0b208...3eC6</div>
                    </div>
                    <div className="network-node phish">
                        <div className="node-label">Phishing #1674496</div>
                        <div className="node-detail">Funded vanity gas for 0x0b2ce...3eC6</div>
                    </div>
                </div>

                <div className="conclusion-box" style={{ marginTop: '20px' }}>
                    <strong>Implication:</strong> The Blend exploit attacker has operational ties to an active Ethereum
                    address-poisoning ring. This suggests a professional threat actor with existing laundering infrastructure,
                    not an opportunistic first-time exploiter.
                </div>
            </div>
        </section>
    );
}
