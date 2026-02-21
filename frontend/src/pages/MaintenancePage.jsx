import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/ui/DataTable';
import StatusPill from '../components/ui/StatusPill';
import Modal from '../components/ui/Modal';
import { Plus, CheckCircle, Wrench, Car, Settings, DollarSign, CalendarDays, AlignLeft } from 'lucide-react';
import './PageCommon.css';

export default function MaintenancePage() {
    const { state, apiCall, refreshData } = useApp();
    const { vehicles, maintenance } = state;
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', serviceType: 'Oil Change', description: '', cost: '', serviceDate: '', nextDueDate: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Filter vehicles that are not retired for the assignment dropdown
    const nonRetiredVehicles = vehicles.filter(v => v.status !== 'Retired');

    const handleAdd = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiCall('/maintenance', 'POST', { ...form, cost: Number(form.cost), status: 'In Progress' });
            await refreshData();
            setModalOpen(false);
            setForm({ vehicleId: '', serviceType: 'Oil Change', description: '', cost: '', serviceDate: '', nextDueDate: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleComplete = async (id) => {
        try {
            await apiCall(`/maintenance/${id}/complete`, 'PATCH');
            await refreshData();
        } catch (err) {
            alert(err.message);
        }
    };

    const userRole = state.auth.user?.role;
    const canManage = userRole === 'Admin' || userRole === 'Manager';

    const columns = [
        {
            key: 'vehicle',
            label: 'Vehicle',
            accessor: row => row.vehicleId?.name || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.name || '—',
            render: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar-small"><Wrench size={14} /></div>
                    <div>
                        <strong>{row.vehicleId?.name || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.name || '—'}</strong>
                        <br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.vehicleId?.licensePlate || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.licensePlate || ''}</span>
                    </div>
                </div>
            )
        },
        { key: 'type', label: 'Service Type', accessor: 'serviceType' },
        { key: 'date', label: 'Service Date', accessor: 'serviceDate', render: row => new Date(row.serviceDate).toLocaleDateString() },
        {
            key: 'cost',
            label: 'Cost (₹)',
            accessor: 'cost',
            render: row => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    ₹{(row.cost || 0).toLocaleString()}
                </span>
            )
        },
        { key: 'status', label: 'Status', accessor: 'status', render: row => <StatusPill status={row.status} /> },
        {
            key: 'actions', label: 'Actions', sortable: false, hidden: !canManage, render: row => (
                row.status === 'In Progress' ? (
                    <button className="btn-icon" onClick={() => handleComplete(row._id)} title="Mark Complete" style={{ color: 'var(--accent)' }}>
                        <CheckCircle size={15} />
                    </button>
                ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Archive</span>
            )
        },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Wrench size={22} style={{ color: 'var(--accent)' }} />Maintenance & Service Logs</h1>
                    <p>Track preventive and reactive vehicle maintenance</p>
                </div>
                {canManage && <button className="btn-primary" onClick={() => {
                    setForm({ vehicleId: '', serviceType: 'Oil Change', description: '', cost: '', serviceDate: new Date().toISOString().split('T')[0], nextDueDate: '' });
                    setModalOpen(true);
                }}><Plus size={18} /> Log Service</button>}
            </div>

            <div className="info-card" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ⚠️ <strong style={{ color: '#f59e0b' }}>Auto-Logic:</strong> Adding a service log automatically moves the vehicle to <StatusPill status="In Shop" /> status, removing it from the dispatcher's selection pool.
                </p>
            </div>

            <DataTable columns={columns} data={maintenance} pageSize={10} onRowClick={(row) => console.log('Row details:', row)} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Service Record">
                <form onSubmit={handleAdd} className="modal-form">
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={13} />Vehicle</label>
                        <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                            <option value="">Select vehicle...</option>
                            {nonRetiredVehicles.map(v => <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} ({v.status})</option>)}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={13} />Service Type</label>
                            <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                                <option>Oil Change</option><option>Tire Rotation</option><option>Brake Inspection</option>
                                <option>Engine Repair</option><option>Battery Replacement</option><option>General Service</option><option>Other</option>
                            </select>
                        </div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={13} />Cost (₹)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Enter cost" required /></div>
                    </div>
                    <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlignLeft size={13} />Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Details of the service performed" rows={2} /></div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={13} />Service Date</label><input type="date" value={form.serviceDate} onChange={e => setForm({ ...form, serviceDate: e.target.value })} required /></div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={13} />Next Due Date</label><input type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} /></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Logging...' : 'Log Service'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
