import { useState } from 'react';
import { ADDRESSES } from '../data/investigation';
import AddrChip from '../components/AddrChip';

const TAG_COLORS = {
    attacker: 'red',
    protocol: 'blue',
    sdf: 'cyan',
    liquidator: 'orange',
    phishing: 'purple',
    infra: 'yellow',
};

export default function Registry() {
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? ADDRESSES : ADDRESSES.filter(a => a.tag === filter);
    const tags = ['all', ...new Set(ADDRESSES.map(a => a.tag))];

    return (
        <section className="section active">
            <h1 className="section-title">Address Registry</h1>
            <p className="section-subtitle">Complete list of investigated entities.</p>

            <div className="filter-bar">
                {tags.map(t => (
                    <button
                        key={t}
                        className={`filter-btn ${filter === t ? 'active' : ''} ${TAG_COLORS[t] || ''}`}
                        onClick={() => setFilter(t)}
                    >
                        {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Network</th>
                                <th>Label</th>
                                <th>Address</th>
                                <th>Tag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.network}</td>
                                    <td>{a.label}</td>
                                    <td><AddrChip address={a.address} /></td>
                                    <td><span className={`tag ${TAG_COLORS[a.tag] || ''}`}>{a.tag}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
