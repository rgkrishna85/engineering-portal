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

const DEPT_COLORS = {
    'MDA': { primary: '#6366f1', secondary: '#818cf8' },
    'ICEE': { primary: '#10b981', secondary: '#34d399' },
    'OPS': { primary: '#f59e0b', secondary: '#fbbf24' },
    'PE': { primary: '#ec4899', secondary: '#f472b6' },
    'PPE': { primary: '#8b5cf6', secondary: '#a78bfa' }
};

export default function WorkloadPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDept, setCurrentDept] = useState('MDA');
    const [selectedManager, setSelectedManager] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'trend'

    useEffect(() => {
        setLoading(true);
        fetch(`/api/workload?department=${currentDept}`)
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
                setSelectedManager(null);
                setSelectedEmployee(null);
            })
            .catch(() => setLoading(false));
    }, [currentDept]);

    if (loading && !data) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing team workloads...</div>;
    if (!data && !loading) return <div className="empty-state">Failed to load workload data</div>;

    const managerData = selectedManager ? data?.managerStats.find(m => m.id === selectedManager) : null;
    const currentStats = selectedManager ? managerData : data?.deptStats;
    const deptTheme = DEPT_COLORS[currentDept] || DEPT_COLORS['MDA'];

    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">📈 {currentDept} Workload Analytics</h1>
                    <p className="page-subtitle">
                        {selectedManager
                            ? `Managing ${managerData.team_count} reportees in ${currentDept}`
                            : `Collective workload for ${data?.deptStats?.total_employees || 0} Engineering staff`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="tabs" style={{ marginBottom: 0, padding: 4, background: 'var(--bg-glass)', borderRadius: 12 }}>
                        {Object.keys(DEPT_COLORS).map(dept => (
                            <button
                                key={dept}
                                className={`tab ${currentDept === dept ? 'active' : ''}`}
                                onClick={() => setCurrentDept(dept)}
                                style={{ padding: '6px 16px', fontSize: 13, borderRadius: 8 }}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div className="tabs" style={{ marginBottom: 0 }}>
                    <button
                        className={`tab ${!selectedManager ? 'active' : ''}`}
                        onClick={() => { setSelectedManager(null); setViewMode('trend'); }}
                    >
                        🏢 {currentDept} Overview
                    </button>
                    {data?.managerStats.map(m => (
                        <button
                            key={m.id}
                            className={`tab ${selectedManager === m.id ? 'active' : ''}`}
                            onClick={() => { setSelectedManager(m.id); setViewMode('individual'); }}
                        >
                            👨‍💼 {m.name}
                        </button>
                    ))}
                </div>

                {selectedManager && (
                    <div style={{ display: 'flex', gap: 8, background: 'var(--bg-glass)', padding: 4, borderRadius: 8 }}>
                        <button
                            className={`btn ${viewMode === 'individual' ? 'btn-primary' : ''}`}
                            style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: 'none', background: viewMode === 'individual' ? deptTheme.primary : 'transparent' }}
                            onClick={() => setViewMode('individual')}
                        >
                            Individual Status
                        </button>
                        <button
                            className={`btn ${viewMode === 'trend' ? 'btn-primary' : ''}`}
                            style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, border: 'none', background: viewMode === 'trend' ? deptTheme.primary : 'transparent' }}
                            onClick={() => setViewMode('trend')}
                        >
                            12W Trend
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Refreshing workload data...</div>
            ) : (
                <>
                    {/* Legend - Only show in individual view */}
                    {selectedManager && viewMode === 'individual' && (
                        <div className="card" style={{ padding: '12px 20px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
                            {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 3, background: color, boxShadow: `0 2px 4px ${color}33` }} />
                                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{status.replace('-', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="card" style={{ padding: '32px', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                                    {!selectedManager ? `${currentDept} Department Aggregate Trend` : viewMode === 'individual' ? 'Weekly Team Availability Matrix' : 'Team Utilization Trend'}
                                </h2>
                                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                                    {selectedManager ? `Detailed analysis for ${managerData.team_count} Engineering staff` : `Aggregated historical data for ${data?.deptStats?.total_employees} staff`}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Period</div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>Q1 2026 - Current</div>
                            </div>
                        </div>

                        {/* Main Visualization Container */}
                        <div style={{
                            height: 380,
                            overflowX: 'auto',
                            display: 'flex',
                            alignItems: 'flex-end',
                            paddingBottom: 50,
                            position: 'relative',
                            paddingLeft: 40
                        }}>
                            {/* Y-Axis scale */}
                            <div style={{ position: 'absolute', left: 0, top: 0, height: 330, width: 40, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', paddingRight: 12 }}>
                                <span>Max</span>
                                <span>80%</span>
                                <span>40%</span>
                                <span>0</span>
                            </div>

                            <div style={{ display: 'flex', gap: selectedManager && viewMode === 'individual' ? 6 : 16, flex: 1, paddingLeft: 20, paddingRight: 20 }}>
                                {selectedManager && viewMode === 'individual' ? (
                                    // INDIVIDUAL REPORTEE VIEW
                                    managerData.team.map((emp) => (
                                        <div key={emp.id} style={{
                                            flex: 1,
                                            minWidth: 45,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 16,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                            onClick={() => setSelectedEmployee(emp)}>
                                            <div style={{
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 3,
                                                height: 320,
                                                justifyContent: 'flex-end',
                                                padding: '0 2px'
                                            }}>
                                                {emp.dailyWorkload.map((day, idx) => (
                                                    <div key={idx} style={{
                                                        width: '100%',
                                                        height: `${(day.hours / 12) * 60}px`,
                                                        background: STATUS_COLORS[day.status],
                                                        borderRadius: 3,
                                                        opacity: 0.9,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        boxShadow: `0 2px 8px ${STATUS_COLORS[day.status]}22`
                                                    }} title={`${day.day}: ${day.hours}h (${day.activity})`} />
                                                ))}
                                            </div>
                                            <div style={{
                                                transform: 'rotate(-45deg)',
                                                whiteSpace: 'nowrap',
                                                fontSize: 11,
                                                marginTop: 20,
                                                width: 0,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {emp.name.split(' ')[0]}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // TREND VIEW
                                    currentStats?.workload.map((val, i) => {
                                        const maxTrendVal = Math.max(...(currentStats?.workload || [1000]));
                                        const heightPercent = (val / maxTrendVal) * 100;
                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                                <div style={{ position: 'relative', width: '100%', height: 320, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                    <div style={{
                                                        width: '85%',
                                                        height: `${heightPercent}%`,
                                                        background: `linear-gradient(to top, ${deptTheme.primary}, ${deptTheme.secondary})`,
                                                        borderRadius: '6px 6px 2px 2px',
                                                        transition: 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                        boxShadow: `0 8px 24px ${deptTheme.primary}44`,
                                                        position: 'relative'
                                                    }}>
                                                        <span style={{
                                                            position: 'absolute',
                                                            bottom: '100%',
                                                            marginBottom: 10,
                                                            fontSize: 12,
                                                            fontWeight: 800,
                                                            width: '100%',
                                                            textAlign: 'center',
                                                            color: 'var(--text-primary)',
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                        }}>
                                                            {val}h
                                                        </span>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{weeks[i]}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="data-grid data-grid-3" style={{ marginTop: 40 }}>
                            <div className="card card-glow" style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Global Capacity</div>
                                <div style={{ fontSize: 28, fontWeight: 800 }}>
                                    {((selectedManager ? managerData.team_count : data?.deptStats?.total_employees) * 40 * (viewMode === 'trend' ? 12 : 1)).toLocaleString()}h
                                </div>
                            </div>
                            <div className="card card-glow" style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Actual Workload</div>
                                <div style={{ fontSize: 28, fontWeight: 800 }}>
                                    {viewMode === 'trend'
                                        ? currentStats?.workload.reduce((a, b) => a + b, 0).toLocaleString()
                                        : managerData?.team.reduce((acc, emp) => acc + emp.dailyWorkload.reduce((s, d) => s + d.hours, 0), 0).toLocaleString()}h
                                </div>
                            </div>
                            <div className="card card-glow" style={{ padding: 24, background: `linear-gradient(135deg, ${deptTheme.primary}11, transparent)` }}>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Net Utilization</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: deptTheme.primary }}>
                                    {selectedManager ? (viewMode === 'trend' ? 95 : 88) : 84}%
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Activity Drill-down Overlay */}
            {selectedEmployee && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.3s ease'
                }} onClick={() => setSelectedEmployee(null)}>
                    <div className="card" style={{ width: '100%', maxWidth: 550, padding: 40, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', right: 24, top: 24, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedEmployee(null)}>&times;</button>

                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontSize: 12, color: deptTheme.primary, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.1em' }}>Engineering Performance Matrix</div>
                            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{selectedEmployee.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{selectedEmployee.role} • {currentDept} Unit</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {selectedEmployee.dailyWorkload.map((day, idx) => (
                                <div key={idx} style={{
                                    padding: 20,
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: `6px solid ${STATUS_COLORS[day.status]}`,
                                    transition: 'transform 0.2s'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{day.day}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{day.activity}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: STATUS_COLORS[day.status], fontSize: 18 }}>{day.hours}h</div>
                                        <div style={{ fontSize: 10, textTransform: 'uppercase', opacity: 0.6, fontWeight: 700, letterSpacing: '0.05em' }}>{day.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 40 }}>
                <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 800, color: 'var(--text-secondary)' }}>Department Management Hierarchy</h3>
                <div className="data-grid data-grid-4">
                    {data?.managerStats.map(m => (
                        <div
                            key={m.id}
                            className="card"
                            onClick={() => { setSelectedManager(m.id); setViewMode('individual'); }}
                            style={{
                                cursor: 'pointer',
                                border: selectedManager === m.id ? `2px solid ${deptTheme.primary}` : '1px solid var(--border-color)',
                                padding: 20,
                                transition: 'all 0.3s ease',
                                transform: selectedManager === m.id ? 'scale(1.02)' : 'scale(1)',
                                background: selectedManager === m.id ? `${deptTheme.primary}08` : 'var(--bg-card)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${deptTheme.primary}, ${deptTheme.secondary})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                    fontWeight: 900,
                                    color: '#fff',
                                    boxShadow: `0 4px 12px ${deptTheme.primary}33`
                                }}>
                                    {m.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.team_count} reportees</div>
                                </div>
                                <div style={{ fontSize: 18 }}>›</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .tab.active {
                    background: ${deptTheme.primary} !important;
                }
            `}</style>
        </div>
    );
}
