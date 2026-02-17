'use client';
import { useState, useEffect } from 'react';

export default function TrainingPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('catalog');

    useEffect(() => {
        fetch('/api/training')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading training data...</div>;
    if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><p>Failed to load</p></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">🎓 Training & Skills</h1>
                <p className="page-subtitle">Track training programs, certifications, and team skill development</p>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'catalog' ? 'active' : ''}`} onClick={() => setTab('catalog')}>📚 Training Catalog</button>
                <button className={`tab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>🎯 Skills Matrix</button>
            </div>

            {tab === 'catalog' && (
                <div className="data-grid data-grid-2">
                    {data.trainings.map(t => (
                        <div key={t.id} className="card card-glow" style={{ position: 'relative', overflow: 'hidden' }}>
                            {t.mandatory ? <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f43f5e,#fb7185)' }} /> : null}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t.title}</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.provider} • {t.duration_hours} hours</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {t.mandatory ? <span className="badge badge-critical">Mandatory</span> : <span className="badge badge-medium">Optional</span>}
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{t.category}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{t.description}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: 18, fontWeight: 700 }}>{t.enrolled}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Enrolled</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{t.completed}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Completed</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning)' }}>{t.avgScore || '—'}%</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Score</div>
                                </div>
                            </div>

                            {t.enrolled > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <div className="utilization-label">
                                        <span>Completion Rate</span>
                                        <span>{t.enrolled > 0 ? Math.round(t.completed / t.enrolled * 100) : 0}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill green" style={{ width: `${t.enrolled > 0 ? Math.round(t.completed / t.enrolled * 100) : 0}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {tab === 'skills' && (
                <div>
                    {Object.entries(data.skillsByCategory).map(([category, skills]) => (
                        <div key={category} className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                                {category === 'Engineering' ? '🔧' : category === 'Technology' ? '💻' : category === 'Management' ? '📋' : category === 'Design' ? '🎨' : category === 'Quality' ? '✅' : category === 'Standards' ? '📏' : category === 'Documentation' ? '📝' : category === 'Soft Skills' ? '🗣️' : '📌'} {category}
                            </h3>
                            {skills.map(s => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ width: 160, fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                                    <div style={{ flex: 1 }}>
                                        <div className="progress-bar" style={{ height: 8 }}>
                                            <div className="progress-fill" style={{ width: `${(s.avg_proficiency / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80, textAlign: 'right' }}>{s.avg_proficiency}/5.0</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 60, textAlign: 'right' }}>{s.employee_count} people</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
