import { XLIQ_PROFILE, YHNF_PROFILE } from '../data/investigation';
import AddrChip from '../components/AddrChip';

function ProfileCard({ profile, title }) {
    return (
        <div className="card profile-card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <span className="card-badge">{profile.fills || profile.opCount} fills</span>
            </div>

            <div className="profile-grid">
                <div className="profile-field">
                    <span className="field-label">Address</span>
                    <AddrChip address={profile.address} />
                </div>
                <div className="profile-field">
                    <span className="field-label">Created</span>
                    <span>{profile.created}</span>
                </div>
                <div className="profile-field">
                    <span className="field-label">Home Domain</span>
                    <span>{profile.homeDomain}</span>
                </div>
                <div className="profile-field">
                    <span className="field-label">Multisig</span>
                    <span>{profile.multisig}</span>
                </div>
                <div className="profile-field">
                    <span className="field-label">Creator</span>
                    <AddrChip address={profile.creator} />
                    <span className="field-note">{profile.creatorLabel}</span>
                </div>
                {profile.xlmBalance && (
                    <div className="profile-field">
                        <span className="field-label">XLM Balance</span>
                        <span className="mono highlight-value">{profile.xlmBalance}</span>
                    </div>
                )}
                {profile.assets && (
                    <div className="profile-field">
                        <span className="field-label">Assets</span>
                        <span className="mono">{Array.isArray(profile.assets) ? profile.assets.join(', ') : profile.assets}</span>
                    </div>
                )}
                {profile.contract && (
                    <div className="profile-field">
                        <span className="field-label">Custom Contract</span>
                        <AddrChip address={profile.contract} />
                    </div>
                )}
            </div>

            <div className="findings-section">
                <h4>Key Findings</h4>
                <ul className="findings-list">
                    {profile.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                    ))}
                </ul>
            </div>

            <div className="conclusion-box">
                <strong>Summary:</strong> {profile.conclusion}
            </div>
        </div>
    );
}

export default function Liquidators() {
    return (
        <section className="section active">
            <h1 className="section-title">Liquidator Profiles</h1>
            <p className="section-subtitle">The two dominant auction bots in the post-exploit liquidation cascade.</p>

            <div className="cols-2">
                <ProfileCard profile={XLIQ_PROFILE} title="XLIQ — 19 Fills" />
                <ProfileCard profile={YHNF_PROFILE} title="YHNF — 31 Fills" />
            </div>
        </section>
    );
}

