'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navSections = [
    {
        title: 'Overview',
        links: [
            { href: '/', icon: '📊', label: 'Dashboard' },
            { href: '/regions', icon: '🌍', label: 'Global Regions' },
        ],
    },
    {
        title: 'Management',
        links: [
            { href: '/employees', icon: '👥', label: 'Employees', badge: '198' },
            { href: '/projects', icon: '📁', label: 'Projects', badge: '10' },
            { href: '/workload', icon: '📈', label: 'Workload Mgmt' },
            { href: '/training', icon: '🎓', label: 'Training & Skills' },
            { href: '/workflows', icon: '⚙️', label: 'Workflows' },
        ],
    },
    {
        title: 'Tools',
        links: [
            { href: '/chat', icon: '🤖', label: 'AI Assistant' },
        ],
    },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">⚡</div>
                    <div className="sidebar-brand-text">
                        <h1>EngineAI</h1>
                        <span>Engineering Portal</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.title} className="sidebar-section">
                            <div className="sidebar-section-title">{section.title}</div>
                            {section.links.map((link) => {
                                const isActive = pathname === link.href ||
                                    (link.href !== '/' && pathname.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                                        onClick={onClose}
                                    >
                                        <span className="sidebar-link-icon">{link.icon}</span>
                                        <span>{link.label}</span>
                                        {link.badge && (
                                            <span className="sidebar-link-badge">{link.badge}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-color)',
                    flexShrink: 0,
                }}>
                    <div style={{
                        padding: '12px',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                            AI-Powered Portal
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            v2.0 • Enterprise Edition
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
