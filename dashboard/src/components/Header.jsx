import { useState, useEffect } from 'react';

const PAGE_TITLES = {
    overview: 'USTRY Oracle Exploit — Investigation',
    mechanics: 'Exploit Mechanics & Oracle Trace',
    auctions: 'Auction Fill Report (60 Fills)',
    liquidators: 'Liquidator Profiles',
    stellar: 'Stellar Network Analysis',
    bridge: 'Cross-Chain Bridge Analytics',
    ethereum: 'Ethereum Accumulator Status',
    base: 'Base Network Activity',
    bsc: 'BSC Parked Funds',
    registry: 'Complete Address Registry',
};

export default function Header({ section, onToggleSidebar }) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                <button className="hamburger" onClick={onToggleSidebar}>☰</button>
                <span className="header-title">{PAGE_TITLES[section] || 'Investigation'}</span>
            </div>
            <div className="header-actions">
                <div className="header-time">{time}</div>
            </div>
        </header>
    );
}
