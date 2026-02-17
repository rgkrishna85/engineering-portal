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

export default function EmployeeDetail() {
    const { id } = useParams();
    const [emp, setEmp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/employees/${id}`)
            .then(r => r.json())
            .then(d => { setEmp(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><div className="typing-indicator" style={{ justifyContent: 'center' }}><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>Loading employee profile...</div>;
    if (!emp) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><p>Employee not found</p></div>;

    return (
        <div>
            <Link href="/employees" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Back to Directory</Link>

            {/* Profile Header */}
            <div className="card" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--accent-gradient)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div className="emp-avatar" style={{ width: 72, height: 72, fontSize: 28, background: getColor(emp.name) }}>
                        {getInitials(emp.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{emp.name}</h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{emp.role} • {emp.department}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <span className={`badge badge-${emp.status}`}>{emp.status === 'on_leave' ? 'On Leave' : emp.status === 'travel' ? 'Traveling' : 'Active'}</span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>🌍 {emp.region_name}</span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>📧 {emp.email}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px 24px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: emp.utilization >= 90 ? 'var(--danger)' : emp.utilization >= 70 ? 'var(--warning)' : 'var(--success)' }}>{emp.utilization}%</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Utilization</div>
                    </div>
                </div>
            </div>

            <div className="data-grid data-grid-2">
                {/* Skills */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎯 Skills & Proficiency</h3>
                    {emp.skills && emp.skills.length > 0 ? emp.skills.map((s, i) => (
                        <div key={i} className="skill-bar">
                            <span className="skill-name">{s.name}</span>
                            <div className="skill-dots">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className={`skill-dot ${n <= s.proficiency ? 'filled' : 'empty'}`} />
                                ))}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{s.category}</span>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills recorded</p>}
                </div>

                {/* Projects */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📁 Project Assignments</h3>
                    {emp.projects && emp.projects.length > 0 ? emp.projects.map((p, i) => (
                        <Link href={`/projects/${p.project_id}`} key={i} style={{
                            display: 'block', padding: '12px', marginBottom: 8, background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{p.project_name}</span>
                                <span className={`badge badge-${p.project_status}`}>{p.project_status}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Role: {p.assignment_role} • Client: {p.client}</div>
                            <div className="utilization-label">
                                <span>Hours: {p.spent_hours}/{p.allocated_hours}</span>
                                <span>{Math.round(p.spent_hours / p.allocated_hours * 100)}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(p.spent_hours / p.allocated_hours * 100))}%` }} />
                            </div>
                        </Link>
                    )) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No project assignments</p>}
                </div>

                {/* Trainings */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎓 Training History</h3>
                    {emp.trainings && emp.trainings.length > 0 ? (
                        <table className="data-table">
                            <thead><tr><th>Training</th><th>Status</th><th>Score</th></tr></thead>
                            <tbody>
                                {emp.trainings.map((t, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{t.title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.provider} • {t.duration_hours}h</div>
                                        </td>
                                        <td><span className={`badge badge-${t.status === 'completed' ? 'completed' : 'in_progress'}`}>{t.status}</span></td>
                                        <td>{t.score ? `${t.score}%` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No training records</p>}
                </div>

                {/* Leave & Travel */}
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>✈️ Leave & Travel</h3>
                    {emp.leaveTravel && emp.leaveTravel.length > 0 ? emp.leaveTravel.map((lt, i) => (
                        <div key={i} style={{
                            padding: '12px', marginBottom: 8, background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{lt.type === 'leave' ? '🏖️ Leave' : '✈️ Travel'}</span>
                                <span className={`badge badge-${lt.status === 'approved' ? 'active' : 'pending'}`}>{lt.status}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lt.start_date} → {lt.end_date}</div>
                            {lt.destination && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📍 {lt.destination}</div>}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lt.reason}</div>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No leave or travel records</p>}
                </div>
            </div>
        </div>
    );
}
