import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/ui/DataTable';
import StatusPill from '../components/ui/StatusPill';
import Modal from '../components/ui/Modal';
import { Plus, Play, CheckCircle, XCircle } from 'lucide-react';
import './PageCommon.css';

export default function TripsPage() {
    const { state, dispatch } = useApp();
    const { vehicles, drivers, trips } = state;
    const [modalOpen, setModalOpen] = useState(false);
    const [completeModal, setCompleteModal] = useState(null);
    const [endOdometer, setEndOdometer] = useState('');
    const [form, setForm] = useState({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', revenue: '' });
    const [error, setError] = useState('');

    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => d.status === 'On Duty');

    const isLicenseValid = (driver, vehicleType) => {
        if (!driver) return false;
        const today = new Date().toISOString().split('T')[0];
        if (driver.licenseExpiry < today) return false;
        if (!driver.licenseCategories.includes(vehicleType)) return false;
        return true;
    };

    const handleCreate = (e) => {
        e.preventDefault();
        setError('');
        const vehicle = vehicles.find(v => v.id === form.vehicleId);
        const driver = drivers.find(d => d.id === form.driverId);
        const weight = Number(form.cargoWeight);

        if (!vehicle || !driver) { setError('Select a vehicle and driver'); return; }
        if (weight > vehicle.maxCapacity) { setError(`Cargo weight (${weight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`); return; }
        if (!isLicenseValid(driver, vehicle.type)) { setError(`Driver license is invalid or expired for ${vehicle.type} category`); return; }

        dispatch({ type: 'CREATE_TRIP', payload: { ...form, cargoWeight: weight, revenue: Number(form.revenue || 0), startOdometer: vehicle.odometer, endOdometer: null } });
        setModalOpen(false);
        setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', revenue: '' });
    };

    const handleComplete = () => {
        if (!endOdometer) return;
        dispatch({ type: 'COMPLETE_TRIP', payload: { tripId: completeModal.id, endOdometer: Number(endOdometer) } });
        setCompleteModal(null);
        setEndOdometer('');
    };

    const columns = [
        { key: 'route', label: 'Route', accessor: row => `${row.origin} → ${row.destination}`, render: row => <strong>{row.origin} → {row.destination}</strong> },
        { key: 'vehicle', label: 'Vehicle', accessor: row => vehicles.find(v => v.id === row.vehicleId)?.name || '—', render: row => vehicles.find(v => v.id === row.vehicleId)?.name || '—' },
        { key: 'driver', label: 'Driver', accessor: row => drivers.find(d => d.id === row.driverId)?.name || '—', render: row => drivers.find(d => d.id === row.driverId)?.name || '—' },
        { key: 'cargo', label: 'Cargo (kg)', accessor: 'cargoWeight', render: row => row.cargoWeight.toLocaleString() },
        { key: 'revenue', label: 'Revenue (₹)', accessor: 'revenue', render: row => `₹${(row.revenue || 0).toLocaleString()}` },
        { key: 'status', label: 'Status', accessor: 'status', render: row => <StatusPill status={row.status} /> },
        {
            key: 'actions', label: 'Actions', sortable: false, render: row => (
                <div className="action-btns">
                    {row.status === 'Draft' && (
                        <button className="btn-icon" onClick={() => dispatch({ type: 'DISPATCH_TRIP', payload: row.id })} title="Dispatch"><Play size={15} /></button>
                    )}
                    {row.status === 'Dispatched' && (
                        <button className="btn-icon" onClick={() => { setCompleteModal(row); setEndOdometer(''); }} title="Complete"><CheckCircle size={15} /></button>
                    )}
                    {(row.status === 'Draft' || row.status === 'Dispatched') && (
                        <button className="btn-icon btn-danger" onClick={() => dispatch({ type: 'CANCEL_TRIP', payload: row.id })} title="Cancel"><XCircle size={15} /></button>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1>Trip Dispatcher</h1>
                    <p>Create and manage delivery trips</p>
                </div>
                <button className="btn-primary" onClick={() => { setError(''); setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', revenue: '' }); setModalOpen(true); }}>
                    <Plus size={18} /> New Trip
                </button>
            </div>

            <div className="trip-stats">
                <div className="stat-chip"><span className="stat-num">{trips.filter(t => t.status === 'Draft').length}</span> Drafts</div>
                <div className="stat-chip"><span className="stat-num">{trips.filter(t => t.status === 'Dispatched').length}</span> Active</div>
                <div className="stat-chip"><span className="stat-num">{trips.filter(t => t.status === 'Completed').length}</span> Completed</div>
            </div>

            <DataTable columns={columns} data={trips} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Trip">
                <form onSubmit={handleCreate} className="modal-form">
                    {error && <div className="form-error">{error}</div>}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Vehicle (Available)</label>
                            <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                                <option value="">Select vehicle...</option>
                                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.maxCapacity}kg max</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Driver (On Duty)</label>
                            <select value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} required>
                                <option value="">Select driver...</option>
                                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — {d.licenseCategories.join(', ')}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Origin</label><input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Mumbai" required /></div>
                        <div className="form-group"><label>Destination</label><input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Pune" required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Cargo Weight (kg)</label><input type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} required /></div>
                        <div className="form-group"><label>Revenue (₹)</label><input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value })} /></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Create Trip</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip" width="400px">
                <div className="modal-form">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter the final odometer reading for <strong>{completeModal && vehicles.find(v => v.id === completeModal.vehicleId)?.name}</strong></p>
                    <div className="form-group">
                        <label>End Odometer (km)</label>
                        <input type="number" value={endOdometer} onChange={e => setEndOdometer(e.target.value)} required />
                    </div>
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => setCompleteModal(null)}>Cancel</button>
                        <button className="btn-primary" onClick={handleComplete}>Mark Completed</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
