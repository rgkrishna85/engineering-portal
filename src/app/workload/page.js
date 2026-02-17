'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS = {
    'overtime': '#10b981', // 🟢 Green
    'standard': '#3b82f6', // 🔵 Blue
    'partial': '#f59e0b',  // 🟡 Yellow
    'no-load': '#ef4444',  // 🔴 Red
    'leave': '#6b7280',    // ⚪ Gray
    'holiday': '#8b5cf6'   // 🟣 Purple
};

export default function WorkloadPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedManager, setSelectedManager] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'trend'

    useEffect(() => {
        fetch('/api/workload?department=MDA')
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing team workloads...</div>;
    if (!data) return <div className="empty-state">Failed to load workload data</div>;

    const managerData = selectedManager ? data.managerStats.find(m => m.id === selectedManager) : null;
    const currentStats = selectedManager ? managerData : data.deptStats;

    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">📈 {selectedManager ? managerData.name : 'MDA'} Workload</h1>
                    <p className="page-subtitle">
                        {selectedManager
                            ? `Managing ${managerData.team_count} reportees in MDA department`
                            : `Collective workload for ${data.deptStats.total_employees} Engineering staff`}
                    </p>
                </div>
                {selectedManager && (
                    <div className="tabs" style={{ marginBottom: 0 }}>
                        <button
                            className={`tab ${viewMode === 'individual' ? 'active' : ''}`}
                            onClick={() => setViewMode('individual')}
                        >
                            👥 Team Status (Weekly)
                        </button>
                        <button
                            className={`tab ${viewMode === 'trend' ? 'active' : ''}`}
                            onClick={() => setViewMode('trend')}
                        >
                            📊 Performance Trend (12W)
                        </button>
                    </div>
                )}
            </div>

            <div className="tabs">
                <button
                    className={`tab ${!selectedManager ? 'active' : ''}`}
                    onClick={() => { setSelectedManager(null); setViewMode('trend'); }}
                >
                    🏢 Department Overview
                </button>
                {data.managerStats.map(m => (
                    <button
                        key={m.id}
                        className={`tab ${selectedManager === m.id ? 'active' : ''}`}
                        onClick={() => { setSelectedManager(m.id); setViewMode('individual'); }}
                    >
                        👨‍💼 {m.name}
                    </button>
                ))}
            </div>

            {/* Legend - Only show in individual view */}
            {selectedManager && viewMode === 'individual' && (
                <div className="card" style={{ padding: '12px 20px', marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                            <span style={{ textTransform: 'capitalize' }}>{status.replace('-', ' ')}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                            {!selectedManager ? 'Department Aggregate Trend' : viewMode === 'individual' ? 'Current Week Team Availability' : 'Team Performance Trend'}
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {selectedManager ? `Detailed data for ${managerData.team_count} staff` : `Aggregated data for ${data.deptStats.total_employees} staff`}
                        </p>
                    </div>
                </div>

                {/* Main Visualization Container */}
                <div style={{
                    height: 350,
                    overflowX: 'auto',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: 40, // Space for labels
                    position: 'relative'
                }}>
                    {/* Y-Axis Label */}
                    <div style={{ position: 'absolute', left: 0, top: 0, height: 310, width: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', paddingRight: 8 }}>
                        <span>Max</span>
                        <span>Mid</span>
                        <span>0</span>
                    </div>

                    <div style={{ display: 'flex', gap: selectedManager && viewMode === 'individual' ? 4 : 12, flex: 1, paddingLeft: 30, paddingRight: 20 }}>
                        {selectedManager && viewMode === 'individual' ? (
                            // INDIVIDUAL REPORTEE VIEW (Managers View)
                            managerData.team.map((emp) => (
                                <div key={emp.id} style={{
                                    flex: 1,
                                    minWidth: 40,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 12,
                                    cursor: 'pointer'
                                }} onClick={() => setSelectedEmployee(emp)}>
                                    <div style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        height: 300,
                                        justifyContent: 'flex-end'
                                    }}>
                                        {emp.dailyWorkload.map((day, idx) => (
                                            <div key={idx} style={{
                                                width: '100%',
                                                height: `${(day.hours / 12) * 60}px`, // Max 12h scale
                                                background: STATUS_COLORS[day.status],
                                                borderRadius: 2,
                                                opacity: 0.9,
                                                transition: 'all 0.2s ease',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }} title={`${day.day}: ${day.hours}h (${day.activity})`} />
                                        ))}
                                    </div>
                                    <div style={{
                                        transform: 'rotate(-45deg)',
                                        whiteSpace: 'nowrap',
                                        fontSize: 10,
                                        marginTop: 15,
                                        width: 0,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        fontWeight: 500,
                                        color: 'var(--text-muted)'
                                    }}>
                                        {emp.name.split(' ')[0]}
                                    </div>
                                </div>
                            ))
                        ) : (
                            // TREND VIEW (12 Weeks Aggregate)
                            currentStats?.workload.map((val, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        <div style={{
                                            width: '100%',
                                            height: `${(val / Math.max(...currentStats.workload)) * 300}px`,
                                            background: !selectedManager ? 'var(--indigo)' : 'var(--primary)',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.3s ease',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                                        }}>
                                            <span style={{ position: 'absolute', bottom: '100%', marginBottom: 4, fontSize: 10, fontWeight: 700, width: '100%', textAlign: 'center' }}>
                                                {val}h
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{weeks[i]}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="data-grid data-grid-3">
                    <div className="card card-glow" style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Capacity</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{((selectedManager ? managerData.team_count : data.deptStats.total_employees) * 40 * (viewMode === 'trend' ? 12 : 1)).toLocaleString()}h</div>
                    </div>
                    <div className="card card-glow" style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Actual Logged</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                            {viewMode === 'trend'
                                ? currentStats?.workload.reduce((a, b) => a + b, 0).toLocaleString()
                                : managerData?.team.reduce((acc, emp) => acc + emp.dailyWorkload.reduce((s, d) => s + d.hours, 0), 0).toLocaleString()}h
                        </div>
                    </div>
                    <div className="card card-glow" style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Utilization</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
                            {selectedManager ? (viewMode === 'trend' ? 95 : 88) : 82}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Drill-down Overlay */}
            {selectedEmployee && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setSelectedEmployee(null)}>
                    <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedEmployee(null)}>&times;</button>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Activity Drill-down</div>
                            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{selectedEmployee.name}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>{selectedEmployee.role} • {selectedEmployee.status}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {selectedEmployee.dailyWorkload.map((day, idx) => (
                                <div key={idx} style={{
                                    padding: 16,
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: `4px solid ${STATUS_COLORS[day.status]}`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{day.day}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{day.activity}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: STATUS_COLORS[day.status] }}>{day.hours}h</div>
                                        <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>{day.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 16, fontSize: 16 }}>Management Hierarchy</h3>
                <div className="data-grid data-grid-4">
                    {data.managerStats.map(m => (
                        <div key={m.id} className="card" onClick={() => setSelectedManager(m.id)} style={{ cursor: 'pointer', border: selectedManager === m.id ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                                    {m.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.team_count} reportees</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
