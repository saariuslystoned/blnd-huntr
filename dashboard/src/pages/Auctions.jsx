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

    // Extract XLM amounts from collateral strings for summary
    const extractXlm = (str) => {
        const match = str.match(/([\d,]+\.?\d*)\s*XLM/);
        if (!match) return 0;
        return parseFloat(match[1].replace(/,/g, ''));
    };

    const totalXlmSeized = useMemo(() => {
        return filtered.reduce((sum, f) => sum + extractXlm(f.collateral), 0);
    }, [filtered]);

    return (
        <section className="section active">
            <h1 className="section-title">Auction Fill Report</h1>
            <p className="section-subtitle">
                All 60 verified auction fills from the Blend YieldBlox Pool liquidation cascade.
                Pool: <AddrChip address={POOL_CONTRACT} />
            </p>

            {/* Liquidator Summary Cards */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Liquidator Totals</h3>
                    <span className="card-badge critical">60 Fills</span>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Liquidator</th>
                                <th>Fills</th>
                                <th>XLM Seized (Collateral)</th>
                                <th>Total Collateral</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LIQUIDATOR_SUMMARY.map(s => {
                                // Extract XLM from total collateral
                                const xlmMatch = s.totalCollateral.match(/([\d,]+\.?\d*)\s*XLM/);
                                const xlmSeized = xlmMatch ? xlmMatch[1] : '—';
                                return (
                                    <tr key={s.filler}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span className="tag cyan">{s.label}</span>
                                                <AddrChip address={s.filler} />
                                            </div>
                                        </td>
                                        <td className="mono">{s.fills}</td>
                                        <td className="mono highlight-value">{xlmSeized} XLM</td>
                                        <td className="mono" style={{ fontSize: '0.72rem', maxWidth: '400px' }}>{s.totalCollateral}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Totals */}
            <div className="cols-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Total Collateral Seized</h3>
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
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {totalXlmSeized > 0 && (
                            <span className="card-badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                                {totalXlmSeized.toLocaleString('en-US', { maximumFractionDigits: 2 })} XLM selected
                            </span>
                        )}
                    </div>
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
                        <option value="Liquidation">Liquidation</option>
                        <option value="BadDebt">Bad Debt</option>
                        <option value="Interest">Interest</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Filler</th>
                                <th>Liquidated</th>
                                <th>Collateral (Seized)</th>
                                <th>Liability (Paid)</th>
                                <th>TX</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(f => (
                                <tr key={f.fill}>
                                    <td className="mono">{f.fill}</td>
                                    <td className="mono" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{shortTime(f.time)}</td>
                                    <td><span className={`tag ${TYPE_COLORS[f.type] || 'blue'}`}>{f.type}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--cyan)' }}>{FILLER_LABELS[f.filler] || '?'}</span>
                                            <AddrChip address={f.filler} />
                                        </div>
                                    </td>
                                    <td>{f.liquidated === '?' ? <span style={{ color: 'var(--text-muted)' }}>unknown</span> : <AddrChip address={f.liquidated} />}</td>
                                    <td className="mono" style={{ fontSize: '0.72rem', maxWidth: '240px', wordBreak: 'break-word' }}>{f.collateral}</td>
                                    <td className="mono" style={{ fontSize: '0.72rem', maxWidth: '280px', wordBreak: 'break-word' }}>{f.liability}</td>
                                    <td>
                                        <a
                                            href={`https://stellar.expert/explorer/public/tx/${f.tx}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="tx-link"
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
