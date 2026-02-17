'use client';
import { useState, useEffect } from 'react';

const regionEmojis = {
    'North America': '🇺🇸',
    'South Asia': '🇮🇳',
    'Europe': '🇪🇺',
    'Latin America': '🇧🇷',
    'UAE': '🇦🇪',
};

export default function RegionsPage() {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch('/api/regions')
            .then(r => r.json())
            .then(d => { setRegions(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading regions data...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">🌍 Global Regions</h1>
                <p className="page-subtitle">Engineering operations across {regions.length} global regions</p>
            </div>

            {/* Summary Stats */}
            <div className="kpi-grid" style={{ marginBottom: 28 }}>
                <div className="card kpi-card purple">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Regions</span>
                        <span className="kpi-icon">🌐</span>
                    </div>
                    <div className="kpi-value">{regions.length}</div>
                </div>
                <div className="card kpi-card blue">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Employees</span>
                        <span className="kpi-icon">👥</span>
                    </div>
                    <div className="kpi-value">{regions.reduce((s, r) => s + r.total_employees, 0)}</div>
                </div>
                <div className="card kpi-card green">
                    <div className="kpi-header">
                        <span className="kpi-label">Active Projects</span>
                        <span className="kpi-icon">📁</span>
                    </div>
                    <div className="kpi-value">{regions.reduce((s, r) => s + r.active_projects, 0)}</div>
                </div>
                <div className="card kpi-card amber">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Hours</span>
                        <span className="kpi-icon">⏱️</span>
                    </div>
                    <div className="kpi-value">{(regions.reduce((s, r) => s + r.total_hours, 0) / 1000).toFixed(1)}k</div>
                </div>
            </div>

            {/* Region Cards */}
            <div className="data-grid data-grid-2">
                {regions.map(r => (
                    <div key={r.id} className="card region-card card-glow" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                        <div className="region-color-bar" style={{ background: r.color }} />

                        <div className="region-header">
                            <div className="region-icon" style={{ background: `${r.color}20`, border: `1px solid ${r.color}40` }}>
                                {regionEmojis[r.name] || '🌍'}
                            </div>
                            <div>
                                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{r.name}</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Code: {r.code} • Timezone: {r.timezone}</p>
                            </div>
                        </div>

                        <div className="region-stats">
                            <div className="region-stat">
                                <div className="region-stat-value" style={{ color: r.color }}>{r.total_employees}</div>
                                <div className="region-stat-label">Employees</div>
                            </div>
                            <div className="region-stat">
                                <div className="region-stat-value">{r.active_projects}</div>
                                <div className="region-stat-label">Active Projects</div>
                            </div>
                            <div className="region-stat">
                                <div className="region-stat-value" style={{ color: r.avg_utilization >= 85 ? 'var(--warning)' : 'var(--success)' }}>{r.avg_utilization}%</div>
                                <div className="region-stat-label">Avg Utilization</div>
                            </div>
                            <div className="region-stat">
                                <div className="region-stat-value">{(r.total_hours / 1000).toFixed(1)}k</div>
                                <div className="region-stat-label">Hours Logged</div>
                            </div>
                        </div>

                        {/* Employee Status */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <span className="badge badge-active">{r.active_employees} active</span>
                            {r.on_leave > 0 && <span className="badge badge-on_leave">{r.on_leave} on leave</span>}
                            {r.on_travel > 0 && <span className="badge badge-travel">{r.on_travel} traveling</span>}
                        </div>

                        {/* Expandable details */}
                        {expanded === r.id && (
                            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                                {/* Team list */}
                                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>👥 Team Members</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                                    {r.employees.map(e => (
                                        <div key={e.id} style={{
                                            padding: '8px 10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12,
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{e.name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{e.role}</div>
                                            </div>
                                            <span className={`badge badge-${e.status}`} style={{ fontSize: 9 }}>{e.status === 'on_leave' ? 'Leave' : e.status === 'travel' ? 'Travel' : 'Active'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Projects */}
                                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>📁 Projects</h4>
                                {r.projects.map(p => (
                                    <div key={p.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 10px', marginBottom: 4, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 12,
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                                            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{p.client}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar" style={{ width: 60, height: 4 }}>
                                                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                                            </div>
                                            <span className={`badge badge-${p.status}`} style={{ fontSize: 9 }}>{p.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ fontSize: 11, color: 'var(--accent-secondary)', marginTop: 12, textAlign: 'center' }}>
                            {expanded === r.id ? 'Click to collapse ▲' : 'Click to expand details ▼'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
