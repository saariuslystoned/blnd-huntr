import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Mechanics from './pages/Mechanics';
import Liquidators from './pages/Liquidators';

import Bridge from './pages/Bridge';
import Ethereum from './pages/Ethereum';
import Base from './pages/Base';
import BSC from './pages/BSC';

import Registry from './pages/Registry';
import Auctions from './pages/Auctions';

const PAGES = {
    overview: Overview,
    mechanics: Mechanics,
    auctions: Auctions,
    liquidators: Liquidators,

    bridge: Bridge,
    ethereum: Ethereum,
    base: Base,
    bsc: BSC,

    registry: Registry,
};

export default function App() {
    const [section, setSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const Page = PAGES[section] || Overview;

    return (
        <div className="app">
            <Sidebar
                activeSection={section}
                onNavigate={setSection}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="main">
                <Header
                    section={section}
                    onToggleSidebar={() => setSidebarOpen(o => !o)}
                />
                <div className="content">
                    <Page />
                </div>
            </main>
        </div>
    );
}
