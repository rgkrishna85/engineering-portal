'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Loading real-time engineering operations data...</p>
                </div>
                <div className="kpi-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card kpi-card">
                            <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 14, width: '50%' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><p>Failed to load dashboard data</p></div>;

    const { kpis, regionStats, recentActivities, upcomingDeliverables } = data;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Engineering Operations Dashboard</h1>
                <p className="page-subtitle">Real-time overview across all global regions • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="card kpi-card purple card-glow">
                    <div className="kpi-header">
                        <span className="kpi-label">Total Employees</span>
                        <span className="kpi-icon">👥</span>
                    </div>
                    <div className="kpi-value">{kpis.totalEmployees}</div>
                    <div className="kpi-change up">
                        <span>{kpis.activeEmployees} active</span> • <span>{kpis.onLeave} on leave</span> • <span>{kpis.onTravel} traveling</span>
                    </div>
                </div>

                <div className="card kpi-card blue card-glow">
                    <div className="kpi-header">
                        <span className="kpi-label">Active Projects</span>
                        <span className="kpi-icon">📁</span>
                    </div>
                    <div className="kpi-value">{kpis.activeProjects}</div>
                    <div className="kpi-change">
                        <span style={{ color: 'var(--success)' }}>✓ {kpis.completedProjects} completed</span> • <span style={{ color: 'var(--text-muted)' }}>{kpis.onHoldProjects} on hold</span>
                    </div>
                </div>

                <div className="card kpi-card green card-glow">
                    <div className="kpi-header">
                        <span className="kpi-label">Avg Utilization</span>
                        <span className="kpi-icon">📈</span>
                    </div>
                    <div className="kpi-value">{kpis.avgUtilization}%</div>
                    <div className="progress-bar" style={{ marginTop: 8 }}>
                        <div className="progress-fill green" style={{ width: `${kpis.avgUtilization}%` }} />
                    </div>
                </div>

                <div className="card kpi-card amber card-glow">
                    <div className="kpi-header">
                        <span className="kpi-label">Hours Logged</span>
                        <span className="kpi-icon">⏱️</span>
                    </div>
                    <div className="kpi-value">{(kpis.totalSpentHours / 1000).toFixed(1)}k</div>
                    <div className="kpi-change">
                        of {(kpis.totalBudgetHours / 1000).toFixed(1)}k budgeted ({Math.round(kpis.totalSpentHours / kpis.totalBudgetHours * 100)}%)
                    </div>
                </div>

                <div className="card kpi-card rose card-glow">
                    <div className="kpi-header">
                        <span className="kpi-label">Pending Reviews</span>
                        <span className="kpi-icon">📝</span>
                    </div>
                    <div className="kpi-value">{kpis.pendingReviews}</div>
                    <div className="kpi-change">
                        {kpis.completedDeliverables}/{kpis.totalDeliverables} deliverables completed
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="data-grid data-grid-2">
                {/* Region Performance */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🌍 Regional Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {regionStats.map(r => (
                            <div key={r.id} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-glass)', transition: 'all 0.2s',
                            }}>
                                <div style={{
                                    width: 8, height: 32, borderRadius: 4,
                                    background: r.color, flexShrink: 0,
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {r.employee_count} employees • {r.active_projects} active projects
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 16, fontWeight: 700 }}>{r.avg_utilization || 0}%</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>utilization</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>⚡ Recent Activity</h3>
                    <ul className="activity-feed">
                        {recentActivities.map(a => {
                            const colors = {
                                deliverable: 'var(--info)',
                                project: 'var(--success)',
                                training: 'var(--warning)',
                                leave_travel: 'var(--accent-primary)',
                            };
                            return (
                                <li key={a.id} className="activity-item">
                                    <div className="activity-dot" style={{ background: colors[a.entity_type] || 'var(--text-muted)' }} />
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>{a.employee_name}</strong> {a.action.toLowerCase()}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.details}</div>
                                        <div className="activity-time">{new Date(a.timestamp).toLocaleString()}</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Project Status Chart */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 Project Hours by Region</h3>
                    <div className="chart-bars">
                        {regionStats.map(r => {
                            const maxHours = Math.max(...regionStats.map(x => {
                                const projs = data.projectsByStatus || [];
                                return x.employee_count * 200;
                            }));
                            const regionProjects = r.active_projects;
                            const height = Math.max(10, (r.avg_utilization || 0));
                            return (
                                <div key={r.id} className="chart-bar-item">
                                    <div className="chart-bar-value">{r.avg_utilization || 0}%</div>
                                    <div className="chart-bar" style={{
                                        height: `${height}%`,
                                        background: `linear-gradient(180deg, ${r.color}, ${r.color}88)`,
                                        width: '100%', maxWidth: 48,
                                    }} />
                                    <div className="chart-bar-label">{r.code}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Deliverables */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Upcoming Deliverables</h3>
                    {upcomingDeliverables.map(d => (
                        <div key={d.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{d.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {d.project_name} • {d.assignee_name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge badge-${d.status}`}>{d.status.replace('_', ' ')}</span>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Due: {d.due_date}</div>
                            </div>
                        </div>
                    ))}
                    <Link href="/projects" style={{
                        display: 'inline-block', marginTop: 16,
                        fontSize: 12, fontWeight: 600,
                    }}>View All Projects →</Link>
                </div>
            </div>
        </div>
    );
}
