import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/ui/DataTable';
import StatusPill from '../components/ui/StatusPill';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';
import KPICard from '../components/ui/KPICard';
import { Plus, Play, CheckCircle, XCircle, Route, FileText, Zap, ChevronsRight, Truck, User, MapPin, Weight, DollarSign, Milestone } from 'lucide-react';
import './PageCommon.css';

export default function TripsPage() {
    const { state, apiCall, refreshData } = useApp();
    const { vehicles, drivers, trips } = state;
    const [modalOpen, setModalOpen] = useState(false);
    const [completeModal, setCompleteModal] = useState(null);
    const [endOdometer, setEndOdometer] = useState('');
    const [form, setForm] = useState({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', revenue: '' });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const userRole = state.auth.user?.role;
    const canManage = userRole === 'Admin' || userRole === 'Manager';

    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => d.status === 'On Duty');

    const isLicenseValid = (driver, vehicleType) => {
        if (!driver) return false;
        const today = new Date().toISOString().split('T')[0];
        if (driver.licenseExpiry < today) return false;
        if (!driver.licenseCategories.includes(vehicleType)) return false;
        return true;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);
        const vehicle = vehicles.find(v => v._id === form.vehicleId);
        const driver = drivers.find(d => d._id === form.driverId);
        const weight = Number(form.cargoWeight);

        if (!vehicle || !driver) { setError('Select a vehicle and driver'); setIsSaving(false); return; }
        if (weight > vehicle.maxCapacity) { setError(`Cargo weight (${weight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`); setIsSaving(false); return; }
        if (!isLicenseValid(driver, vehicle.type)) { setError(`Driver license is invalid or expired for ${vehicle.type} category`); setIsSaving(false); return; }

        try {
            await apiCall('/trips', 'POST', { ...form, cargoWeight: weight, revenue: Number(form.revenue || 0), startOdometer: vehicle.odometer, status: 'Draft' });
            await refreshData();
            setModalOpen(false);
            setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', revenue: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDispatch = async (id) => {
        try {
            await apiCall(`/trips/${id}/dispatch`, 'PATCH');
            await refreshData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleComplete = async () => {
        if (!endOdometer) return;
        setIsSaving(true);
        try {
            await apiCall(`/trips/${completeModal._id}/complete`, 'PATCH', { endOdometer: Number(endOdometer) });
            await refreshData();
            setCompleteModal(null);
            setEndOdometer('');
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this trip? Asset statuses will be reverted.')) return;
        try {
            await apiCall(`/trips/${id}/cancel`, 'PATCH');
            await refreshData();
        } catch (err) {
            alert(err.message);
        }
    };

    const columns = [
        { key: 'route', label: 'Route', accessor: row => `${row.origin} → ${row.destination}`, render: row => <strong>{row.origin} → {row.destination}</strong> },
        {
            key: 'vehicle',
            label: 'Vehicle',
            accessor: row => (row.vehicleId?.name || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.name || '—'),
            render: row => (row.vehicleId?.name || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.name || '—')
        },
        {
            key: 'driver',
            label: 'Driver',
            accessor: row => (row.driverId?.name || drivers.find(d => d._id === (row.driverId?._id || row.driverId))?.name || '—'),
            render: row => (row.driverId?.name || drivers.find(d => d._id === (row.driverId?._id || row.driverId))?.name || '—')
        },
        { key: 'cargo', label: 'Cargo (kg)', accessor: 'cargoWeight', render: row => (row.cargoWeight || 0).toLocaleString() },
        { key: 'revenue', label: 'Revenue (₹)', accessor: 'revenue', render: row => `₹${(row.revenue || 0).toLocaleString()}` },
        { key: 'status', label: 'Status', accessor: 'status', render: row => <StatusPill status={row.status} /> },
        {
            key: 'actions', label: 'Actions', sortable: false, hidden: !canManage, render: row => (
                <div className="action-btns">
                    {row.status === 'Draft' && (
                        <button className="btn-icon" onClick={() => handleDispatch(row._id)} title="Dispatch"><Play size={15} /></button>
                    )}
                    {row.status === 'Dispatched' && (
                        <button className="btn-icon" onClick={() => { setCompleteModal(row); setEndOdometer(''); }} title="Complete"><CheckCircle size={15} /></button>
                    )}
                    {(row.status === 'Draft' || row.status === 'Dispatched') && (
                        <button className="btn-icon btn-danger" title="Cancel" onClick={() => handleCancel(row._id)}><XCircle size={15} /></button>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Route size={22} style={{ color: 'var(--accent)' }} />Trip Dispatcher</h1>
                    <p>Create and manage delivery trips</p>
                </div>
                {canManage && (
                    <button className="btn-primary" onClick={() => { setError(''); setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', revenue: '' }); setModalOpen(true); }}>
                        <Plus size={18} /> New Trip
                    </button>
                )}
            </div>

            <div className="trip-stats">
                <div className="stat-chip"><FileText size={14} style={{ color: 'var(--text-muted)' }} /><span className="stat-num">{trips.filter(t => t.status === 'Draft').length}</span> Drafts</div>
                <div className="stat-chip"><Zap size={14} style={{ color: '#f59e0b' }} /><span className="stat-num">{trips.filter(t => t.status === 'Dispatched').length}</span> Active</div>
                <div className="stat-chip"><CheckCircle size={14} style={{ color: '#10b981' }} /><span className="stat-num">{trips.filter(t => t.status === 'Completed').length}</span> Completed</div>
                <div className="stat-chip"><XCircle size={14} style={{ color: '#ef4444' }} /><span className="stat-num">{trips.filter(t => t.status === 'Cancelled').length}</span> Cancelled</div>
            </div>

            <DataTable columns={columns} data={trips} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Trip">
                <form onSubmit={handleCreate} className="modal-form">
                    {error && (
                        <div className="info-card" style={{ background: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', marginBottom: '16px', color: '#ef4444', fontWeight: 600 }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Truck size={13} />Vehicle (Available)</label>
                            <CustomSelect
                                value={form.vehicleId}
                                onChange={val => setForm({ ...form, vehicleId: val })}
                                options={availableVehicles.map(v => ({ value: v._id, label: `${v.name} — ${v.maxCapacity}kg max` }))}
                                placeholder="Select vehicle..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13} />Driver (On Duty)</label>
                            <CustomSelect
                                value={form.driverId}
                                onChange={val => setForm({ ...form, driverId: val })}
                                options={availableDrivers.map(d => ({ value: d._id, label: `${d.name} — ${d.licenseCategories.join(', ')}` }))}
                                placeholder="Select driver..."
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} />Origin</label><input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Mumbai" required /></div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Milestone size={13} />Destination</label><input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Pune" required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Weight size={13} />Cargo Weight (kg)</label><input type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} required /></div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={13} />Revenue (₹)</label><input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value })} /></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Connecting...' : 'Create Trip'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip" width="400px">
                <div className="modal-form">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Enter the final odometer reading for <strong>
                            {completeModal && (completeModal.vehicleId?.name || vehicles.find(v => v._id === (completeModal.vehicleId?._id || completeModal.vehicleId))?.name)}
                        </strong>
                    </p>
                    <div className="form-group">
                        <label>End Odometer (km)</label>
                        <input type="number" value={endOdometer} onChange={e => setEndOdometer(e.target.value)} required />
                    </div>
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => setCompleteModal(null)}>Cancel</button>
                        <button className="btn-primary" onClick={handleComplete} disabled={isSaving}>
                            {isSaving ? 'Updating...' : 'Mark Completed'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
