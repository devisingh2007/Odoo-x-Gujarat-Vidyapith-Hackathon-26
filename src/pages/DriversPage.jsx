import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/ui/DataTable';
import StatusPill from '../components/ui/StatusPill';
import Modal from '../components/ui/Modal';
import { Plus, Edit, Shield, AlertTriangle } from 'lucide-react';
import './PageCommon.css';

export default function DriversPage() {
    const { state, dispatch } = useApp();
    const { drivers, trips } = state;
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', licenseCategories: [], licenseExpiry: '', safetyScore: 85 });

    const today = new Date().toISOString().split('T')[0];

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', phone: '', licenseCategories: [], licenseExpiry: '', safetyScore: 85 });
        setModalOpen(true);
    };
    const openEdit = (d) => {
        setEditing(d);
        setForm({ name: d.name, phone: d.phone, licenseCategories: d.licenseCategories, licenseExpiry: d.licenseExpiry, safetyScore: d.safetyScore });
        setModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const data = { ...form, safetyScore: Number(form.safetyScore) };
        if (editing) {
            dispatch({ type: 'UPDATE_DRIVER', payload: { ...data, id: editing.id } });
        } else {
            dispatch({ type: 'ADD_DRIVER', payload: { ...data, status: 'On Duty', tripsCompleted: 0, joinDate: today } });
        }
        setModalOpen(false);
    };

    const toggleCategory = (cat) => {
        setForm(f => ({
            ...f,
            licenseCategories: f.licenseCategories.includes(cat) ? f.licenseCategories.filter(c => c !== cat) : [...f.licenseCategories, cat]
        }));
    };

    const getCompletionRate = (driverId) => {
        const driverTrips = trips.filter(t => t.driverId === driverId);
        if (driverTrips.length === 0) return '—';
        const completed = driverTrips.filter(t => t.status === 'Completed').length;
        return `${Math.round((completed / driverTrips.length) * 100)}%`;
    };

    const columns = [
        {
            key: 'name', label: 'Driver', accessor: 'name', render: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                        {row.name.charAt(0)}
                    </div>
                    <div><strong>{row.name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.phone}</span></div>
                </div>
            )
        },
        {
            key: 'categories', label: 'License', accessor: row => row.licenseCategories.join(', '), render: row => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {row.licenseCategories.map(c => <span key={c} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', color: '#3b82f6' }}>{c}</span>)}
                </div>
            )
        },
        {
            key: 'expiry', label: 'License Expiry', accessor: 'licenseExpiry', render: row => {
                const expired = row.licenseExpiry < today;
                return <span style={{ color: expired ? '#ef4444' : 'var(--text-primary)', fontWeight: expired ? 600 : 400 }}>
                    {expired && <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {row.licenseExpiry}
                </span>;
            }
        },
        {
            key: 'safety', label: 'Safety Score', accessor: 'safetyScore', render: row => {
                const color = row.safetyScore >= 85 ? '#10b981' : row.safetyScore >= 70 ? '#f59e0b' : '#ef4444';
                return <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${row.safetyScore}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                    <span style={{ color, fontWeight: 600, fontSize: '0.8rem' }}>{row.safetyScore}</span>
                </div>;
            }
        },
        {
            key: 'completion', label: 'Completion', accessor: row => row.tripsCompleted, render: row => (
                <span>{row.tripsCompleted} trips ({getCompletionRate(row.id)})</span>
            )
        },
        { key: 'status', label: 'Status', accessor: 'status', render: row => <StatusPill status={row.status} /> },
        {
            key: 'actions', label: 'Actions', sortable: false, render: row => (
                <div className="action-btns">
                    <button className="btn-icon" onClick={() => openEdit(row)} title="Edit"><Edit size={15} /></button>
                    {row.status !== 'On Trip' && (
                        <>
                            {row.status !== 'On Duty' && <button className="btn-icon" onClick={() => dispatch({ type: 'SET_DRIVER_STATUS', payload: { id: row.id, status: 'On Duty' } })} title="Set On Duty"><Shield size={15} /></button>}
                            {row.status !== 'Off Duty' && <button className="btn-icon" onClick={() => dispatch({ type: 'SET_DRIVER_STATUS', payload: { id: row.id, status: 'Off Duty' } })} title="Set Off Duty" style={{ color: 'var(--text-muted)' }}><Shield size={15} /></button>}
                            {row.status !== 'Suspended' && <button className="btn-icon btn-danger" onClick={() => dispatch({ type: 'SET_DRIVER_STATUS', payload: { id: row.id, status: 'Suspended' } })} title="Suspend"><AlertTriangle size={15} /></button>}
                        </>
                    )}
                </div>
            )
        },
    ];

    // License expiry warnings
    const expiringDrivers = drivers.filter(d => {
        const daysUntil = (new Date(d.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntil < 90;
    });

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1>Driver Profiles</h1>
                    <p>Manage driver compliance and performance</p>
                </div>
                <button className="btn-primary" onClick={openAdd}><Plus size={18} /> Add Driver</button>
            </div>

            {expiringDrivers.length > 0 && (
                <div className="info-card" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        🚨 <strong style={{ color: '#ef4444' }}>Compliance Alert:</strong> {expiringDrivers.length} driver(s) have licenses expiring within 90 days.
                        {expiringDrivers.map(d => <span key={d.id} style={{ marginLeft: '8px', color: '#ef4444', fontWeight: 500 }}>{d.name} ({d.licenseExpiry})</span>)}
                    </p>
                </div>
            )}

            <DataTable columns={columns} data={drivers} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
                <form onSubmit={handleSave} className="modal-form">
                    <div className="form-row">
                        <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                        <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                    </div>
                    <div className="form-group">
                        <label>License Categories</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['Truck', 'Van', 'Bike'].map(cat => (
                                <button
                                    key={cat} type="button"
                                    onClick={() => toggleCategory(cat)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', border: '1px solid',
                                        borderColor: form.licenseCategories.includes(cat) ? 'var(--accent)' : 'var(--border)',
                                        background: form.licenseCategories.includes(cat) ? 'rgba(59,130,246,0.15)' : 'var(--input-bg)',
                                        color: form.licenseCategories.includes(cat) ? 'var(--accent)' : 'var(--text-muted)',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                                    }}
                                >{cat}</button>
                            ))}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>License Expiry</label><input type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} required /></div>
                        <div className="form-group"><label>Safety Score (0–100)</label><input type="number" min="0" max="100" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} /></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">{editing ? 'Save' : 'Add Driver'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
