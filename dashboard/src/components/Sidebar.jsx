const NAV_SECTIONS = [
    {
        label: 'General',
        items: [
            { id: 'overview', name: 'Overview' },
            { id: 'mechanics', name: 'Exploit Mechanics' },
            { id: 'auctions', name: 'Auction Fills', badge: '60' },
            { id: 'liquidators', name: 'Liquidators' },
        ],
    },
    {
        label: 'Infrastructure',
        items: [
            { id: 'bridge', name: 'Cross-Chain Bridge' },
        ],
    },
    {
        label: 'EVM Chains',
        items: [
            { id: 'ethereum', name: 'Ethereum', badge: 'DRMNT' },
            { id: 'base', name: 'Base' },
            { id: 'bsc', name: 'BSC' },
        ],
    },
    {
        label: 'Intelligence',
        items: [
            { id: 'registry', name: 'Address Registry' },
        ],
    },
];

export default function Sidebar({ activeSection, onNavigate, isOpen, onClose }) {
    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="icon">🕵️</span>
                        <span>blnd-huntr</span>
                    </div>
                    <div className="sidebar-status">
                        <span className="pulse-dot"></span>
                        <span>Active Tracking</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <div className="nav-section-label">{section.label}</div>
                            {section.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        if (window.innerWidth <= 1024) onClose();
                                    }}
                                >
                                    {item.name}
                                    {item.badge && <span className="badge">{item.badge}</span>}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    v2.1.0-react<br />
                    Updated Feb 23, 2026
                </div>
            </aside>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
        </>
    );
}
