import { useApp } from '../context/AppContext';
import KPICard from '../components/ui/KPICard';
import { Fuel, TrendingUp, DollarSign, Truck, Download, ChartNoAxesCombined, Droplets, PieChart as PieChartIcon, TrendingDown, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import './PageCommon.css';
import './DashboardPage.css';

export default function AnalyticsPage() {
    const { state } = useApp();
    const { vehicles, trips, expenses, maintenance } = state;

    // Fuel Efficiency per vehicle (km/L)
    const fuelEfficiency = vehicles.map(v => {
        const vTrips = trips.filter(t => (t.vehicleId?._id || t.vehicleId) === v._id && t.status === 'Completed' && t.endOdometer && t.startOdometer);
        const totalKm = vTrips.reduce((s, t) => s + (t.endOdometer - t.startOdometer), 0);
        const totalLiters = expenses.filter(e => (e.vehicleId?._id || e.vehicleId) === v._id && e.type === 'Fuel').reduce((s, e) => s + (e.liters || 0), 0);
        return { name: v.name, kmPerL: totalLiters > 0 ? +(totalKm / totalLiters).toFixed(1) : 0, totalKm, totalLiters };
    }).filter(v => v.kmPerL > 0 || v.totalKm > 0);

    // Vehicle ROI
    const vehicleROI = vehicles.map(v => {
        const revenue = trips.filter(t => (t.vehicleId?._id || t.vehicleId) === v._id && t.status === 'Completed').reduce((s, t) => s + (t.revenue || 0), 0);
        const fuelCost = expenses.filter(e => (e.vehicleId?._id || e.vehicleId) === v._id && e.type === 'Fuel').reduce((s, e) => s + (e.cost || 0), 0);
        const maintCost = maintenance.filter(m => (m.vehicleId?._id || m.vehicleId) === v._id).reduce((s, m) => s + (m.cost || 0), 0);
        const roi = v.acquisitionCost ? +(((revenue - fuelCost - maintCost) / v.acquisitionCost) * 100).toFixed(1) : 0;
        return { name: v.name, revenue, costs: fuelCost + maintCost, roi, acquisitionCost: v.acquisitionCost || 0 };
    });

    // Expense breakdown by type
    const COLORS = ['#3b82f6', '#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'];
    const expenseByType = [
        { name: 'Fuel', value: expenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + (e.cost || 0), 0) },
        { name: 'Maintenance', value: maintenance.reduce((s, m) => s + (m.cost || 0), 0) },
        { name: 'Tolls & Other', value: expenses.filter(e => e.type !== 'Fuel').reduce((s, e) => s + (e.cost || 0), 0) },
    ].filter(d => d.value > 0);

    // Cost per km
    const costPerKm = vehicles.map(v => {
        const vTrips = trips.filter(t => (t.vehicleId?._id || t.vehicleId) === v._id && t.status === 'Completed' && t.endOdometer && t.startOdometer);
        const totalKm = vTrips.reduce((s, t) => s + (t.endOdometer - t.startOdometer), 0);
        const totalCost = expenses.filter(e => (e.vehicleId?._id || e.vehicleId) === v._id).reduce((s, e) => s + (e.cost || 0), 0) +
            maintenance.filter(m => (m.vehicleId?._id || m.vehicleId) === v._id).reduce((s, m) => s + (m.cost || 0), 0);
        return { name: v.name, costPerKm: totalKm > 0 ? +(totalCost / totalKm).toFixed(1) : 0 };
    }).filter(v => v.costPerKm > 0);

    const totalRevenue = trips.filter(t => t.status === 'Completed').reduce((s, t) => s + (t.revenue || 0), 0);
    const totalCosts = expenses.reduce((s, e) => s + (e.cost || 0), 0) + maintenance.reduce((s, m) => s + (m.cost || 0), 0);

    const exportCSV = (data, filename) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h];
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ChartNoAxesCombined size={22} style={{ color: 'var(--accent)' }} />Analytics & Reports</h1>
                    <p>Data-driven operational insights</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={() => exportCSV(fuelEfficiency, 'fleet_fuel_efficiency_report.csv')}><Download size={16} /> Fuel Report</button>
                    <button className="btn-secondary" onClick={() => exportCSV(vehicleROI.map(v => ({ Vehicle: v.name, Revenue: v.revenue, Costs: v.costs, ROI: v.roi + '%' })), 'payroll_roi_registry.csv')}><Download size={16} /> ROI Report</button>
                    <button className="btn-primary" onClick={() => exportCSV(
                        expenses.map(e => ({
                            Vehicle: e.vehicleId?.name || vehicles.find(v => v._id === (e.vehicleId?._id || e.vehicleId))?.name,
                            Type: e.type,
                            Amount: e.cost,
                            Date: new Date(e.date).toLocaleDateString()
                        })),
                        'health_audit_full_export.csv'
                    )}><Download size={16} /> Health Audit Export</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                <KPICard icon={TrendingUp} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="green" />
                <KPICard icon={DollarSign} label="Total Costs" value={`₹${totalCosts.toLocaleString()}`} color="red" />
                <KPICard icon={Truck} label="Net Profit" value={`₹${(totalRevenue - totalCosts).toLocaleString()}`} color={totalRevenue - totalCosts >= 0 ? 'green' : 'red'} />
                <KPICard icon={Fuel} label="Avg Fuel Eff." value={fuelEfficiency.length ? `${(fuelEfficiency.reduce((s, v) => s + v.kmPerL, 0) / fuelEfficiency.length).toFixed(1)} km/L` : '—'} color="orange" />
            </div>

            <div className="dashboard-grid">
                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Droplets size={16} style={{ color: '#10b981' }} />Fuel Efficiency (km/L per Vehicle)</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={fuelEfficiency}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="kmPerL" fill="#10b981" radius={[6, 6, 0, 0]} name="km/L" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={16} style={{ color: 'var(--accent)' }} />Expense Breakdown</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={expenseByType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}>
                                    {expenseByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} style={{ color: '#10b981' }} />Vehicle ROI (%)</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={vehicleROI}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                                <Bar dataKey="costs" fill="#ef4444" radius={[6, 6, 0, 0]} name="Costs (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingDown size={16} style={{ color: '#f59e0b' }} />Cost per Kilometer (₹/km)</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={costPerKm}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="costPerKm" fill="#f59e0b" radius={[6, 6, 0, 0]} name="₹/km" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
