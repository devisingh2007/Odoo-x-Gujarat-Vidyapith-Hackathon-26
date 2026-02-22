import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';
import KPICard from '../components/ui/KPICard';
import { Plus, Trash2, Fuel, DollarSign, TrendingUp, Receipt, Car, Tag, Droplets, CalendarDays, Route, BarChart3 } from 'lucide-react';
import './PageCommon.css';

export default function ExpensesPage() {
    const { state, apiCall, refreshData } = useApp();
    const { vehicles, expenses, maintenance, trips } = state;
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', tripId: '', type: 'Fuel', liters: '', cost: '', date: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiCall('/expenses', 'POST', { ...form, liters: Number(form.liters || 0), cost: Number(form.cost) });
            await refreshData();
            setModalOpen(false);
            setForm({ vehicleId: '', tripId: '', type: 'Fuel', liters: '', cost: '', date: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await apiCall(`/expenses/${id}`, 'DELETE');
            await refreshData();
        } catch (err) {
            alert(err.message);
        }
    };

    const totalFuel = expenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + e.cost, 0);
    const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
    const totalOps = totalFuel + totalMaint;
    const totalLiters = expenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + e.liters, 0);

    // Cost per vehicle
    const vehicleCosts = vehicles.map(v => {
        const vFuel = expenses.filter(e => (e.vehicleId?._id || e.vehicleId) === v._id && e.type === 'Fuel').reduce((s, e) => s + e.cost, 0);
        const vMaint = maintenance.filter(m => (m.vehicleId?._id || m.vehicleId) === v._id).reduce((s, m) => s + m.cost, 0);
        return { ...v, fuelCost: vFuel, maintCost: vMaint, totalCost: vFuel + vMaint };
    });

    const columns = [
        {
            key: 'vehicle',
            label: 'Vehicle',
            accessor: row => (row.vehicleId?.name || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.name || '—'),
            render: row => (row.vehicleId?.name || vehicles.find(v => v._id === (row.vehicleId?._id || row.vehicleId))?.name || '—')
        },
        {
            key: 'trip',
            label: 'Trip',
            accessor: row => { const t = row.tripId?.origin ? row.tripId : trips.find(t => t._id === (row.tripId?._id || row.tripId)); return t ? `${t.origin}→${t.destination}` : '—'; },
            render: row => { const t = row.tripId?.origin ? row.tripId : trips.find(tr => tr._id === (row.tripId?._id || row.tripId)); return t ? `${t.origin} → ${t.destination}` : '—'; }
        },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'liters', label: 'Liters', accessor: 'liters', render: row => row.liters > 0 ? row.liters : '—' },
        { key: 'cost', label: 'Cost (₹)', accessor: 'cost', render: row => `₹${row.cost.toLocaleString()}` },
        { key: 'date', label: 'Date', accessor: row => new Date(row.date).toLocaleDateString() },
        {
            key: 'actions', label: '', sortable: false, render: row => (
                <button className="btn-icon btn-danger" onClick={() => handleDelete(row._id)}><Trash2 size={15} /></button>
            )
        },
    ];

    const costColumns = [
        { key: 'name', label: 'Vehicle', accessor: 'name' },
        { key: 'fuel', label: 'Fuel Cost', accessor: 'fuelCost', render: row => `₹${row.fuelCost.toLocaleString()}` },
        { key: 'maint', label: 'Maintenance', accessor: 'maintCost', render: row => `₹${row.maintCost.toLocaleString()}` },
        { key: 'total', label: 'Total Ops Cost', accessor: 'totalCost', render: row => <strong style={{ color: row.totalCost > 0 ? '#f59e0b' : 'var(--text-muted)' }}>₹{row.totalCost.toLocaleString()}</strong> },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Receipt size={22} style={{ color: 'var(--accent)' }} />Expenses & Fuel Log</h1>
                    <p>Track operational costs and fuel consumption</p>
                </div>
                <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={18} /> Add Expense</button>
            </div>

            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                <KPICard icon={Fuel} label="Total Fuel" value={`₹${totalFuel.toLocaleString()}`} color="orange" />
                <KPICard icon={DollarSign} label="Total Maintenance" value={`₹${totalMaint.toLocaleString()}`} color="purple" />
                <KPICard icon={TrendingUp} label="Total Ops Cost" value={`₹${totalOps.toLocaleString()}`} color="red" />
                <KPICard icon={Fuel} label="Fuel Consumed" value={`${totalLiters}L`} color="blue" />
            </div>

            <DataTable columns={columns} data={expenses} />

            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} style={{ color: 'var(--accent)' }} />Cost Breakdown per Vehicle</h2>
            <DataTable columns={costColumns} data={vehicleCosts} searchable={false} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
                <form onSubmit={handleAdd} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={13} />Vehicle</label>
                            <CustomSelect
                                value={form.vehicleId}
                                onChange={val => setForm({ ...form, vehicleId: val })}
                                options={vehicles.map(v => ({ value: v._id, label: v.name }))}
                                placeholder="Select..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={13} />Type</label>
                            <CustomSelect
                                value={form.type}
                                onChange={val => setForm({ ...form, type: val })}
                                options={['Fuel', 'Toll', 'Other']}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={13} />Liters (if fuel)</label><input type="number" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} /></div>
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={13} />Cost (₹)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={13} />Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Route size={13} />Trip (optional)</label>
                            <CustomSelect
                                value={form.tripId}
                                onChange={val => setForm({ ...form, tripId: val })}
                                options={[
                                    { value: '', label: 'None' },
                                    ...trips.filter(t => (t.vehicleId?._id || t.vehicleId) === form.vehicleId).map(t => ({ value: t._id, label: `${t.origin}→${t.destination}` }))
                                ]}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
