import { useState, useMemo } from 'react';
import { AUCTION_FILLS, LIQUIDATOR_SUMMARY, GLOBAL_TOTALS, POOL_CONTRACT } from '../data/auctions';
import AddrChip from '../components/AddrChip';

const TYPE_COLORS = { Liquidation: 'red', BadDebt: 'orange', Interest: 'blue' };
const FILLERS = ['All', ...new Set(AUCTION_FILLS.map(f => f.filler))];
const FILLER_LABELS = {
    'GAPU4WSJMFW6Q4G5CLADCNWFIAOGTCC5XXY3DVUA23W7ZPUIYSSGXLIQ': 'XLIQ',
    'GAIN2HU2ITUZPLGNWSH7JXXROL7MYIWDYXCUQDMQVJXFBEBPETSZYHNF': 'YHNF',
    'GDQY3T2ZJXVGV23R32AIHKPC2RLMMYSEK3EGRZ4MA2CYEGXHE63BLEND': 'BLEND',
    'GALB73DWWDC2EWEIUX6CUCZ2DGR7HSYFQIYDM4DCX6USS5GZNMZ3CASH': 'CASH',
    'GCBYMMOSIINFRGFEJKEUGNCUNAOUQYZ6DOQXA47P76UGCUQSXVNWWM3L': 'Unknown',
    'GASND6BBFGDGWDLP2DJCFDAKL7GHHZAYQ6PENFHSHMLEMFKAVLZCDQXJ': 'QXJ',
};

function shortTime(iso) {
    return iso.replace('2026-02-22T', '').replace('Z', '') + ' UTC';
}

/** Parse a multi-asset string like "11.18 XLM, 72.92 USDC" into array of {amount, asset} */
function parseAssets(str) {
    if (!str || str === '—') return [];
    return str.split(',').map(s => s.trim()).filter(Boolean).map(part => {
        const m = part.match(/^([\d,.]+)\s+(.+)$/);
        if (!m) return { amount: part, asset: '' };
        return { amount: m[1], asset: m[2] };
    });
}

/** Render list of assets as colored chips */
function AssetList({ str, highlight }) {
    const items = parseAssets(str);
    if (items.length === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                    <span className="mono" style={{
                        fontSize: '0.75rem',
                        fontWeight: highlight && item.asset === 'XLM' ? 700 : 500,
                        color: highlight && item.asset === 'XLM' ? 'var(--red)' : 'var(--text-primary)',
                    }}>
                        {item.amount}
                    </span>
                    <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: item.asset === 'XLM' ? 'var(--red-bg)' :
                            item.asset === 'USDC' ? 'var(--green-bg)' :
                                item.asset === 'EURC' ? 'var(--blue-bg)' :
                                    item.asset.includes('LP') ? 'var(--purple-bg)' :
                                        'var(--bg-hover)',
                        color: item.asset === 'XLM' ? 'var(--red)' :
                            item.asset === 'USDC' ? 'var(--green)' :
                                item.asset === 'EURC' ? 'var(--blue)' :
                                    item.asset.includes('LP') ? 'var(--purple)' :
                                        'var(--text-secondary)',
                    }}>
                        {item.asset}
                    </span>
                </div>
            ))}
        </div>
    );
}

/** Parse the summary collateral/liability string (uses · separator) into line items */
function parseSummaryAssets(str) {
    if (!str || str === '—') return [];
    return str.split('·').map(s => s.trim()).filter(Boolean).map(part => {
        const m = part.match(/^([\d,.]+)\s+(.+)$/);
        if (!m) return { amount: part, asset: '' };
        return { amount: m[1], asset: m[2] };
    });
}

function SummaryAssetList({ str }) {
    const items = parseSummaryAssets(str);
    if (items.length === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
            {items.map((item, i) => (
                <span key={i} style={{ display: 'inline-flex', gap: '4px', alignItems: 'baseline', fontSize: '0.72rem' }}>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.amount}</span>
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: item.asset === 'XLM' ? 'var(--red-bg)' :
                            item.asset === 'USDC' ? 'var(--green-bg)' :
                                item.asset === 'EURC' ? 'var(--blue-bg)' :
                                    item.asset.includes('LP') ? 'var(--purple-bg)' :
                                        'var(--bg-hover)',
                        color: item.asset === 'XLM' ? 'var(--red)' :
                            item.asset === 'USDC' ? 'var(--green)' :
                                item.asset === 'EURC' ? 'var(--blue)' :
                                    item.asset.includes('LP') ? 'var(--purple)' :
                                        'var(--text-secondary)',
                    }}>
                        {item.asset}
                    </span>
                </span>
            ))}
        </div>
    );
}

export default function Auctions() {
    const [fillerFilter, setFillerFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const filtered = useMemo(() => {
        return AUCTION_FILLS.filter(f => {
            if (fillerFilter !== 'All' && f.filler !== fillerFilter) return false;
            if (typeFilter !== 'All' && f.type !== typeFilter) return false;
            return true;
        });
    }, [fillerFilter, typeFilter]);

    // Count types
    const typeCounts = useMemo(() => {
        const counts = { Liquidation: 0, BadDebt: 0, Interest: 0 };
        AUCTION_FILLS.forEach(f => { counts[f.type] = (counts[f.type] || 0) + 1; });
        return counts;
    }, []);

    return (
        <section className="section active">
            <h1 className="section-title">Auction Fill Report</h1>
            <p className="section-subtitle">
                All 60 verified auction fills from the Blend YieldBlox Pool liquidation cascade.
            </p>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card red">
                    <div className="stat-label">Total Fills</div>
                    <div className="stat-value">60</div>
                    <div className="stat-detail">{typeCounts.Liquidation} Liquidations · {typeCounts.BadDebt} Bad Debt · {typeCounts.Interest} Interest</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-label">XLM Seized</div>
                    <div className="stat-value">83.09M</div>
                    <div className="stat-detail">Collateral from liquidations</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-label">LP Tokens Seized</div>
                    <div className="stat-value">4.39M</div>
                    <div className="stat-detail">BLND-USDC LP units</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-label">Liquidators</div>
                    <div className="stat-value">6</div>
                    <div className="stat-detail">Unique filler addresses</div>
                </div>
            </div>

            {/* Pool Contract */}
            <div className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>POOL CONTRACT</span>
                    <AddrChip address={POOL_CONTRACT} />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Blend YieldBlox Pool</span>
                </div>
            </div>

            {/* Liquidator Summary Cards */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Liquidator Breakdown</h3>
                    <span className="card-badge">6 LIQUIDATORS</span>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Liquidator</th>
                                <th style={{ textAlign: 'center' }}>Fills</th>
                                <th>Collateral Seized</th>
                                <th>Liabilities Settled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LIQUIDATOR_SUMMARY.map(s => (
                                <tr key={s.filler}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span className="tag cyan" style={{ minWidth: '54px', textAlign: 'center' }}>{s.label}</span>
                                            <AddrChip address={s.filler} />
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="mono" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.fills}</span>
                                    </td>
                                    <td>
                                        <SummaryAssetList str={s.totalCollateral} />
                                    </td>
                                    <td>
                                        <SummaryAssetList str={s.totalLiabilities} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Totals */}
            <div className="cols-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Total Collateral Seized</h3>
                        <span className="card-badge" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>COLLATERAL</span>
                    </div>
                    {Object.entries(GLOBAL_TOTALS.collateral).map(([asset, amount]) => (
                        <div key={asset} className="impact-row">
                            <span className="impact-label">{asset}</span>
                            <span className={`impact-value mono ${asset === 'XLM' ? 'red' : ''}`}>{amount}</span>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Total Liabilities Settled</h3>
                        <span className="card-badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>LIABILITIES</span>
                    </div>
                    {Object.entries(GLOBAL_TOTALS.liabilities).map(([asset, amount]) => (
                        <div key={asset} className="impact-row">
                            <span className="impact-label">{asset}</span>
                            <span className="impact-value mono">{amount}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Fills ({filtered.length} of 60)</h3>
                </div>

                <div className="filter-bar" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <select
                        value={fillerFilter}
                        onChange={e => setFillerFilter(e.target.value)}
                        style={{
                            background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'inherit',
                        }}
                    >
                        <option value="All">All Fillers</option>
                        {FILLERS.filter(f => f !== 'All').map(f => (
                            <option key={f} value={f}>{FILLER_LABELS[f] || f.slice(0, 8)} ({AUCTION_FILLS.filter(x => x.filler === f).length} fills)</option>
                        ))}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        style={{
                            background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'inherit',
                        }}
                    >
                        <option value="All">All Types</option>
                        <option value="Liquidation">Liquidation ({typeCounts.Liquidation})</option>
                        <option value="BadDebt">Bad Debt ({typeCounts.BadDebt})</option>
                        <option value="Interest">Interest ({typeCounts.Interest})</option>
                    </select>
                    {fillerFilter !== 'All' || typeFilter !== 'All' ? (
                        <button
                            onClick={() => { setFillerFilter('All'); setTypeFilter('All'); }}
                            style={{
                                background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                                padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                            }}
                        >
                            Clear Filters
                        </button>
                    ) : null}
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Time (UTC)</th>
                                <th>Type</th>
                                <th>Filler</th>
                                <th>Liquidated Account</th>
                                <th>Collateral (Seized)</th>
                                <th>Liability (Paid)</th>
                                <th>TX</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(f => (
                                <tr key={f.fill}>
                                    <td className="mono" style={{ fontWeight: 600 }}>{f.fill}</td>
                                    <td className="mono" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{shortTime(f.time)}</td>
                                    <td><span className={`tag ${TYPE_COLORS[f.type] || 'blue'}`}>{f.type}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)',
                                                background: 'var(--cyan-bg)', padding: '1px 6px', borderRadius: '4px',
                                            }}>
                                                {FILLER_LABELS[f.filler] || '?'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {f.liquidated === '?' ? (
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pool (bad debt / interest)</span>
                                        ) : (
                                            <AddrChip address={f.liquidated} />
                                        )}
                                    </td>
                                    <td><AssetList str={f.collateral} highlight /></td>
                                    <td><AssetList str={f.liability} /></td>
                                    <td>
                                        <a
                                            href={`https://stellar.expert/explorer/public/tx/${f.tx}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="tx-link"
                                            title={f.tx}
                                        >
                                            {f.tx.slice(0, 8)}…
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
