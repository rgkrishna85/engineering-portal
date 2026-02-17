'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6'];
function getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2); }

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then(r => r.json())
            .then(d => { setProject(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading project...</div>;
    if (!project) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><p>Project not found</p></div>;

    const hoursPercent = project.budget_hours > 0 ? Math.round(project.spent_hours / project.budget_hours * 100) : 0;

    return (
        <div>
            <Link href="/projects" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Back to Projects</Link>

            {/* Header */}
            <div className="card" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: project.region_color || 'var(--accent-gradient)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{project.name}</h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{project.client} • {project.region_name}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {project.status && (
                                <span className={`badge badge-${project.status}`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                            )}
                            {project.priority && (
                                <span className={`badge badge-${project.priority}`}>
                                    {project.priority} priority
                                </span>
                            )}
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                📅 {project.start_date || 'TBD'} → {project.end_date || 'TBD'}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: 28, fontWeight: 800 }}>{project.progress}%</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Progress</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: hoursPercent > 90 ? 'var(--danger)' : 'var(--text-primary)' }}>{hoursPercent}%</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Budget Used</div>
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.6 }}>{project.description}</p>
                <div className="progress-bar" style={{ height: 8, marginTop: 16 }}>
                    <div className={`progress-fill ${project.progress === 100 ? 'green' : ''}`} style={{ width: `${project.progress}%` }} />
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {['overview', 'deliverables', 'reviews'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t === 'overview' ? '📋 Overview' : t === 'deliverables' ? '📦 Deliverables' : '📝 Reviews'}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className="data-grid data-grid-2">
                    {/* Hours Breakdown */}
                    <div className="card">
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⏱️ Hours Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>{project.budget_hours.toLocaleString()}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Budget Hours</div>
                            </div>
                            <div style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: hoursPercent > 90 ? 'var(--danger)' : 'var(--success)' }}>{project.spent_hours.toLocaleString()}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Spent Hours</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remaining: {(project.budget_hours - project.spent_hours).toLocaleString()} hours</div>
                    </div>

                    {/* Team */}
                    <div className="card">
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>👥 Project Team ({project.team?.length || 0})</h3>
                        {project.team?.map((m, i) => (
                            <Link href={`/employees/${m.employee_id}`} key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', color: 'inherit',
                            }}>
                                <div className="emp-avatar" style={{ width: 36, height: 36, fontSize: 13, background: getColor(m.employee_name) }}>
                                    {getInitials(m.employee_name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.employee_name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{m.spent_hours}/{m.allocated_hours}h</div>
                                    <div className="progress-bar" style={{ width: 80, height: 4 }}>
                                        <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(m.spent_hours / m.allocated_hours * 100))}%` }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'deliverables' && (
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📦 Engineering Deliverables</h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>Deliverable</th><th>Assignee</th><th>Due Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {project.deliverables?.map(d => (
                                <tr key={d.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{d.title}</div>
                                        {d.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{d.description}</div>}
                                    </td>
                                    <td>{d.assignee_name || 'Unassigned'}</td>
                                    <td>
                                        <div>{d.due_date}</div>
                                        {d.completed_date && <div style={{ fontSize: 10, color: 'var(--success)' }}>✓ {d.completed_date}</div>}
                                    </td>
                                    <td><span className={`badge badge-${d.status}`}>{d.status.replace('_', ' ')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'reviews' && (
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📝 Review History</h3>
                    {project.reviews?.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr><th>Deliverable / Type</th><th>Reviewer / Date</th><th>Status</th><th>Rating</th><th>Evidence</th></tr>
                            </thead>
                            <tbody>
                                {project.reviews.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{r.deliverable_title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.review_type} Review</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{r.reviewer_name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.review_date}</div>
                                        </td>
                                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                                        <td>{r.rating ? '⭐'.repeat(r.rating) : '—'}</td>
                                        <td>
                                            {r.doc_url && (
                                                <a href={r.doc_url} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 12, fontWeight: 600 }} target="_blank" rel="noopener noreferrer">
                                                    📄 Findings Doc
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No reviews recorded for this project yet.</p>}

                    {project.reviews?.some(r => r.comments) && (
                        <div style={{ marginTop: 32 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📝 Detailed Findings</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {project.reviews.filter(r => r.comments).map(r => (
                                    <div key={r.id} style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700 }}>{r.reviewer_name} — {r.deliverable_title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.review_date}</div>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comments}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
