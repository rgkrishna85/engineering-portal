'use client';

export default function Header({ onMenuToggle }) {
    return (
        <header className="header">
            <div className="header-left">
                <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
                    ☰
                </button>
                <div className="header-search">
                    <span className="header-search-icon">🔍</span>
                    <input type="text" placeholder="Search employees, projects, deliverables..." />
                </div>
            </div>
            <div className="header-right">
                <select className="region-selector" defaultValue="all">
                    <option value="all">All Regions</option>
                    <option value="NA">North America</option>
                    <option value="SA">South Asia</option>
                    <option value="EU">Europe</option>
                    <option value="LATAM">Latin America</option>
                    <option value="UAE">UAE</option>
                </select>
                <button className="header-btn" aria-label="Notifications">
                    🔔
                    <span className="badge-dot"></span>
                </button>
                <button className="header-btn" aria-label="Settings">⚙️</button>
                <div className="header-user">
                    <div className="header-avatar">SM</div>
                    <div className="header-user-info">
                        <span className="header-user-name">Sarah Mitchell</span>
                        <span className="header-user-role">Project Manager</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
