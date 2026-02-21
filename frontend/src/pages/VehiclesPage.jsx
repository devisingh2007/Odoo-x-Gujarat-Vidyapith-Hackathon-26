import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/ui/DataTable';
import StatusPill from '../components/ui/StatusPill';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';
import { Plus, Edit, Trash2, Power, Truck, Car, Tag, CreditCard, Package, Gauge, MapPin, DollarSign } from 'lucide-react';
import './PageCommon.css';

export default function VehiclesPage() {
    const { state, apiCall, refreshData } = useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', model: '', licensePlate: '', type: 'Truck', maxCapacity: '', odometer: '', region: 'North', acquisitionCost: '' });
    const [isSaving, setIsSaving] = useState(false);

    const openAdd = () => { setEditing(null); setForm({ name: '', model: '', licensePlate: '', type: 'Truck', maxCapacity: '', odometer: '', region: 'North', acquisitionCost: '' }); setModalOpen(true); };
    const openEdit = (v) => { setEditing(v); setForm({ ...v, maxCapacity: String(v.maxCapacity), odometer: String(v.odometer), acquisitionCost: String(v.acquisitionCost || '') }); setModalOpen(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const data = { ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost || 0) };

        try {
            if (editing) {
                await apiCall(`/vehicles/${editing._id}`, 'PATCH', data);
            } else {
                await apiCall('/vehicles', 'POST', { ...data, status: 'Available' });
            }
            await refreshData();
            setModalOpen(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRetire = async (v) => {
        try {
            const newStatus = v.status === 'Retired' ? 'Available' : 'Retired';
            await apiCall(`/vehicles/${v._id}`, 'PATCH', { status: newStatus });
            await refreshData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await apiCall(`/vehicles/${id}`, 'DELETE');
            await refreshData();
        } catch (err) {
            alert(err.message);
        }
    };

    const userRole = state.auth.user?.role;
    const canManage = userRole === 'Admin' || userRole === 'Manager';

    const columns = [
        { key: 'name', label: 'Vehicle', accessor: 'name', render: row => <div><strong>{row.name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.model}</span></div> },
        { key: 'plate', label: 'License Plate', accessor: 'licensePlate' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'capacity', label: 'Max Load (kg)', accessor: 'maxCapacity', render: row => row.maxCapacity.toLocaleString() },
        { key: 'odometer', label: 'Odometer (km)', accessor: 'odometer', render: row => row.odometer.toLocaleString() },
        { key: 'region', label: 'Region', accessor: 'region' },
        { key: 'status', label: 'Status', accessor: 'status', render: row => <StatusPill status={row.status} /> },
        {
            key: 'actions', label: 'Actions', sortable: false, hidden: !canManage, render: row => (
                <div className="action-btns">
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit Details"><Edit size={15} /></button>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); toggleRetire(row); }} title={row.status === 'Retired' ? 'Re-commission Asset' : 'Mark Out of Service'} style={{ color: row.status === 'Retired' ? 'var(--accent)' : 'inherit' }}><Power size={15} /></button>
                    <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} title="Delete Permanent"><Trash2 size={15} /></button>
                </div>
            )
        },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Truck size={22} style={{ color: 'var(--accent)' }} />Vehicle Registry</h1>
                    <p>Manage fleet assets and their status</p>
                </div>
                {canManage && <button className="btn-primary" onClick={openAdd}><Plus size={18} /> Add Vehicle</button>}
            </div>

            <DataTable columns={columns} data={state.vehicles} pageSize={10} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
                <form onSubmit={handleSave} className="modal-form">
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={13} />Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Truck-01" required /></div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={13} />Model</label><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. Tata 407" required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={13} />License Plate</label><input value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} placeholder="MH-12-AB-1234" required /></div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Truck size={13} />Type</label>
                            <CustomSelect
                                value={form.type}
                                onChange={val => setForm({ ...form, type: val })}
                                options={['Truck', 'Van', 'Bike']}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={13} />Max Capacity (kg)</label><input type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} required /></div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Gauge size={13} />Odometer (km)</label><input type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} />Region</label>
                            <CustomSelect
                                value={form.region}
                                onChange={val => setForm({ ...form, region: val })}
                                options={['North', 'South', 'East', 'West']}
                            />
                        </div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={13} />Acquisition Cost (₹)</label><input type="number" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} /></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Processing...' : (editing ? 'Save Changes' : 'Add Vehicle')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
