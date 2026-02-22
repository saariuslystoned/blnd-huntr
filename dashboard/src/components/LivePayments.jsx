import { useLivePayments } from '../hooks/useHorizon';
import { formatBalance } from '../api/horizon';
import AddrChip from './AddrChip';

export default function LivePayments({ accountKey, label, limit = 8 }) {
    const { payments, loading, refresh } = useLivePayments(accountKey, limit);

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    };

    const getAsset = (p) => {
        if (p.asset_type === 'native') return 'XLM';
        return p.asset_code || p.type;
    };

    const getDirection = (p, accountKey) => {
        // For payments, check if this account is source or destination
        if (p.from === p.to) return 'self';
        if (p.type === 'create_account') return 'create';
        return p.from ? 'in/out' : '—';
    };

    return (
        <div className="card live-card">
            <div className="card-header">
                <h3 className="card-title">
                    <span className="pulse-dot" style={{ display: 'inline-block', marginRight: '8px' }}></span>
                    {label || 'Recent Payments'}
                </h3>
                <div className="live-meta">
                    {loading && <span className="live-loading">Loading...</span>}
                    <button className="refresh-btn" onClick={refresh} disabled={loading}>↻</button>
                </div>
            </div>

            {payments.length === 0 && !loading && (
                <p className="trace-note">No recent payments found.</p>
            )}

            {payments.length > 0 && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Asset</th>
                                <th>Amount</th>
                                <th>From</th>
                                <th>To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.id}>
                                    <td className="mono" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                        {formatTime(p.created_at)}
                                    </td>
                                    <td>
                                        <span className={`tag ${p.type === 'payment' ? 'blue' : p.type === 'create_account' ? 'green' : 'cyan'}`}>
                                            {p.type?.replace('_', ' ') || '—'}
                                        </span>
                                    </td>
                                    <td className="mono">{getAsset(p)}</td>
                                    <td className="mono">{p.amount ? formatBalance(p.amount) : p.starting_balance ? formatBalance(p.starting_balance) : '—'}</td>
                                    <td>{p.from ? <AddrChip address={p.from} /> : '—'}</td>
                                    <td>{p.to ? <AddrChip address={p.to} /> : p.account ? <AddrChip address={p.account} /> : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
