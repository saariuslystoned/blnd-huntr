import { useLiveBalances } from '../hooks/useHorizon';
import { formatBalance, TRACKED_ACCOUNTS } from '../api/horizon';

const DISPLAY_ORDER = [
    { key: 'attacker', label: 'Attacker', highlight: ['XLM', 'USDC', 'USTRY'] },
    { key: 'xliq', label: 'XLIQ (Liquidator)', highlight: ['XLM', 'USDC', 'BLND'] },
    { key: 'yhnf', label: 'YHNF (Liquidator)', highlight: ['XLM', 'USDC', 'BLND'] },
    { key: 'blendTreasury', label: 'Blend Treasury (SXI3)', highlight: ['XLM'] },
    { key: 'sdfConduit', label: 'SDF Conduit', highlight: ['XLM'] },
];

function BalanceRow({ label, balances, highlights }) {
    if (!balances) return (
        <tr className="balance-row error">
            <td>{label}</td>
            <td colSpan={3} className="mono" style={{ color: 'var(--text-muted)' }}>Failed to load</td>
        </tr>
    );

    const xlm = balances.XLM || '0';

    return (
        <tr className="balance-row">
            <td>{label}</td>
            <td className="mono highlight-value">{formatBalance(xlm)} XLM</td>
            <td className="mono">{balances.USDC ? `${formatBalance(balances.USDC)} USDC` : '—'}</td>
            <td className="mono">
                {highlights
                    .filter(a => a !== 'XLM' && a !== 'USDC' && balances[a])
                    .map(a => `${formatBalance(balances[a])} ${a}`)
                    .join(', ') || '—'}
            </td>
        </tr>
    );
}

export default function LiveBalances() {
    const { balances, loading, error, lastUpdated, refresh } = useLiveBalances();

    return (
        <div className="card live-card">
            <div className="card-header">
                <h3 className="card-title">
                    <span className="pulse-dot" style={{ display: 'inline-block', marginRight: '8px' }}></span>
                    Live Stellar Balances
                </h3>
                <div className="live-meta">
                    {loading && <span className="live-loading">Loading...</span>}
                    {lastUpdated && (
                        <span className="live-timestamp">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button className="refresh-btn" onClick={refresh} disabled={loading}>↻</button>
                </div>
            </div>

            {error && <div className="live-error">Horizon API Error: {error}</div>}

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>XLM</th>
                            <th>USDC</th>
                            <th>Other</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DISPLAY_ORDER.map(({ key, label, highlight }) => (
                            <BalanceRow
                                key={key}
                                label={label}
                                balances={balances?.[key]}
                                highlights={highlight}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
