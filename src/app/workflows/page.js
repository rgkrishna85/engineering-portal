'use client';
import { useState, useEffect } from 'react';

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newWf, setNewWf] = useState({ name: '', description: '', steps: [{ title: '', assignee_role: '' }] });
    const [expanded, setExpanded] = useState(null);

    const fetchWorkflows = () => {
        fetch('/api/workflows')
            .then(r => r.json())
            .then(d => { setWorkflows(d); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchWorkflows(); }, []);

    const addStep = () => {
        setNewWf(prev => ({ ...prev, steps: [...prev.steps, { title: '', assignee_role: '' }] }));
    };

    const removeStep = (idx) => {
        setNewWf(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
    };

    const updateStep = (idx, field, value) => {
        setNewWf(prev => ({
            ...prev,
            steps: prev.steps.map((s, i) => i === idx ? { ...s, [field]: value } : s),
        }));
    };

    const createWorkflow = async () => {
        if (!newWf.name.trim()) return;
        try {
            await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWf),
            });
            setShowModal(false);
            setNewWf({ name: '', description: '', steps: [{ title: '', assignee_role: '' }] });
            setLoading(true);
            fetchWorkflows();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚙️ Workflows</h1>
                <p className="page-subtitle">Manage and create engineering process workflows</p>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Workflow</button>
                </div>
            </div>

            {loading ? (
                <div className="data-grid data-grid-2">
                    {[1, 2, 3].map(i => <div key={i} className="card"><div className="skeleton" style={{ height: 120 }} /></div>)}
                </div>
            ) : (
                <div className="data-grid data-grid-2">
                    {workflows.map(wf => (
                        <div key={wf.id} className="card card-glow" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === wf.id ? null : wf.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{wf.name}</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{wf.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span className={`badge badge-${wf.status}`}>{wf.status}</span>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{wf.step_count} steps</span>
                                </div>
                            </div>

                            {wf.creator_name && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Created by {wf.creator_name}</div>
                            )}

                            {expanded === wf.id && wf.steps && (
                                <div className="workflow-steps" style={{ marginTop: 16 }}>
                                    {wf.steps.map((step, i) => (
                                        <div key={step.id} className="workflow-step">
                                            <div className="workflow-step-title">
                                                <span style={{ color: 'var(--text-muted)', fontSize: 11, marginRight: 8 }}>Step {step.step_order}</span>
                                                {step.title}
                                            </div>
                                            <div className="workflow-step-meta">
                                                Assigned to: {step.assignee_role || 'Unassigned'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ fontSize: 11, color: 'var(--accent-secondary)', marginTop: 8 }}>
                                {expanded === wf.id ? 'Click to collapse ▲' : 'Click to expand steps ▼'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Workflow Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create New Workflow</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Workflow Name</label>
                            <input className="form-input" value={newWf.name} onChange={e => setNewWf({ ...newWf, name: e.target.value })} placeholder="e.g., Design Review Process" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-textarea" value={newWf.description} onChange={e => setNewWf({ ...newWf, description: e.target.value })} placeholder="Describe the workflow purpose..." />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Steps</label>
                            {newWf.steps.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 14, flexShrink: 0 }}>{i + 1}</span>
                                    <input className="form-input" style={{ flex: 1 }} placeholder="Step title" value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} />
                                    <input className="form-input" style={{ width: 140 }} placeholder="Assignee role" value={step.assignee_role} onChange={e => updateStep(i, 'assignee_role', e.target.value)} />
                                    {newWf.steps.length > 1 && (
                                        <button className="btn btn-secondary btn-icon" onClick={() => removeStep(i)} style={{ fontSize: 14, flexShrink: 0 }}>✕</button>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={addStep} style={{ marginTop: 4 }}>+ Add Step</button>
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={createWorkflow}>Create Workflow</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
