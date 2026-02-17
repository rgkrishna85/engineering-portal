'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (regionFilter !== 'all') params.set('region', regionFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        fetch(`/api/projects?${params}`)
            .then(r => r.json())
            .then(d => { setProjects(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [search, regionFilter, statusFilter]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📁 Project Portfolio</h1>
                <p className="page-subtitle">{projects.length} projects across global engineering operations</p>
            </div>

            <div className="filter-bar">
                <input className="filter-input" placeholder="Search projects or clients..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="filter-select" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                    <option value="all">All Regions</option>
                    <option value="NA">North America</option>
                    <option value="SA">South Asia</option>
                    <option value="EU">Europe</option>
                    <option value="LATAM">Latin America</option>
                    <option value="UAE">UAE</option>
                </select>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                </select>
            </div>

            {loading ? (
                <div className="data-grid data-grid-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="card"><div className="skeleton" style={{ height: 180 }} /></div>)}
                </div>
            ) : (
                <div className="data-grid data-grid-2">
                    {projects.map(p => {
                        const hoursUsed = p.budget_hours > 0 ? Math.round(p.spent_hours / p.budget_hours * 100) : 0;
                        return (
                            <Link href={`/projects/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card project-card card-glow" style={{ position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.region_color || 'var(--accent-primary)' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.client} • {p.region_name}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <span className={`badge badge-${p.priority}`}>{p.priority}</span>
                                            <span className={`badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{p.description}</p>

                                    {/* Progress */}
                                    <div style={{ marginBottom: 12 }}>
                                        <div className="utilization-label">
                                            <span>Progress</span>
                                            <span style={{ fontWeight: 600 }}>{p.progress}%</span>
                                        </div>
                                        <div className="progress-bar" style={{ height: 8 }}>
                                            <div className={`progress-fill ${p.progress === 100 ? 'green' : p.progress >= 50 ? '' : 'amber'}`} style={{ width: `${p.progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                        <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: 16, fontWeight: 700 }}>{(p.spent_hours / 1000).toFixed(1)}k</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>of {(p.budget_hours / 1000).toFixed(1)}k hrs</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: 16, fontWeight: 700 }}>{p.team_size}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Team</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: 16, fontWeight: 700 }}>{p.completed_deliverables}/{p.deliverable_count}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Deliverables</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                                        <span>📅 {p.start_date} → {p.end_date}</span>
                                        <span>📝 {p.completed_reviews}/{p.review_count} reviews</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
