'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6'];

function getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (regionFilter !== 'all') params.set('region', regionFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        fetch(`/api/employees?${params}`)
            .then(r => r.json())
            .then(d => { setEmployees(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [search, regionFilter, statusFilter]);

    const getUtilColor = (u) => u >= 90 ? 'red' : u >= 70 ? 'amber' : 'green';

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">👥 Employee Directory</h1>
                <p className="page-subtitle">{employees.length} employees across all global regions</p>
            </div>

            <div className="filter-bar">
                <input
                    className="filter-input"
                    placeholder="Search by name, role, or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="filter-select" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                    <option value="all">All Regions</option>
                    <option value="NA">North America</option>
                    <option value="SA">South Asia</option>
                    <option value="EU">Europe</option>
                    <option value="LATAM">Latin America</option>
                    <option value="UAE">UAE</option>
                </select>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="travel">Traveling</option>
                </select>
            </div>

            {loading ? (
                <div className="data-grid data-grid-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                <div><div className="skeleton" style={{ width: 120, height: 16, marginBottom: 6 }} /><div className="skeleton" style={{ width: 80, height: 12 }} /></div>
                            </div>
                            <div className="skeleton" style={{ height: 6, marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 12, width: '60%' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="data-grid data-grid-3">
                    {employees.map(emp => (
                        <Link href={`/employees/${emp.id}`} key={emp.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card employee-card card-glow">
                                <div className="emp-card-header">
                                    <div className="emp-avatar" style={{ background: getColor(emp.name) }}>
                                        {getInitials(emp.name)}
                                    </div>
                                    <div className="emp-info">
                                        <h3>{emp.name}</h3>
                                        <p>{emp.role}</p>
                                    </div>
                                    <span className={`badge badge-${emp.status}`} style={{ marginLeft: 'auto' }}>
                                        {emp.status === 'on_leave' ? 'On Leave' : emp.status === 'travel' ? 'Traveling' : 'Active'}
                                    </span>
                                </div>

                                <div className="emp-meta">
                                    <span className="emp-meta-item">🏢 {emp.department}</span>
                                    <span className="emp-meta-item">🌍 {emp.region_name}</span>
                                </div>

                                {emp.skills && emp.skills.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                                        {emp.skills.slice(0, 3).map((s, i) => (
                                            <span key={i} style={{
                                                fontSize: 10, padding: '3px 8px',
                                                background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                                                borderRadius: 12, color: 'var(--text-muted)',
                                            }}>{s.name}</span>
                                        ))}
                                        {emp.skills.length > 3 && (
                                            <span style={{ fontSize: 10, padding: '3px 8px', color: 'var(--text-muted)' }}>+{emp.skills.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                <div className="utilization-bar">
                                    <div className="utilization-label">
                                        <span>Utilization</span>
                                        <span style={{ fontWeight: 600, color: emp.utilization >= 90 ? 'var(--danger)' : emp.utilization >= 70 ? 'var(--warning)' : 'var(--success)' }}>{emp.utilization}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className={`progress-fill ${getUtilColor(emp.utilization)}`} style={{ width: `${emp.utilization}%` }} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && employees.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p className="empty-state-text">No employees found matching your criteria</p>
                </div>
            )}
        </div>
    );
}
