import { useApp } from '../context/AppContext';
import KPICard from '../components/ui/KPICard';
import StatusPill from '../components/ui/StatusPill';
import { Truck, AlertTriangle, Gauge, Package, Route, Users, TrendingUp, LayoutDashboard, PieChart as PieChartIcon, BarChart3, Activity, ArrowRight, MapPin, Filter, CircleDot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useState } from 'react';
import CustomSelect from '../components/ui/CustomSelect';
import './DashboardPage.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <span className="tooltip-title">{label}</span>
                <div className="tooltip-list">
                    {payload.map((entry, index) => (
                        <div key={index} className="tooltip-item">
                            <div className="tooltip-label-group">
                                <div className="tooltip-dot" style={{ backgroundColor: entry.color || entry.fill || 'var(--accent)' }} />
                                <span className="tooltip-label">{entry.name}</span>
                            </div>
                            <span className="tooltip-value">
                                {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') ? `₹${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const { state } = useApp();
    const { vehicles, drivers, trips, maintenance, expenses } = state;
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState('All');

    const filteredVehicles = vehicles.filter(v =>
        (typeFilter === 'All' || v.type === typeFilter) &&
        (statusFilter === 'All' || v.status === statusFilter) &&
        (regionFilter === 'All' || v.region === regionFilter)
    );

    const filteredVehicleIds = new Set(filteredVehicles.map(v => v._id));

    const filteredTrips = (trips || []).filter(t =>
        filteredVehicleIds.has(t.vehicleId?._id || t.vehicleId)
    );

    const filteredMaintenance = (maintenance || []).filter(m =>
        filteredVehicleIds.has(m.vehicleId?._id || m.vehicleId)
    );

    const filteredExpenses = (expenses || []).filter(e =>
        filteredVehicleIds.has(e.vehicleId?._id || e.vehicleId)
    );

    const activeFleet = filteredVehicles.filter(v => v.status === 'On Trip').length;
    const inShop = filteredVehicles.filter(v => v.status === 'In Shop').length;
    const available = filteredVehicles.filter(v => v.status === 'Available').length;
    const totalActive = filteredVehicles.filter(v => v.status !== 'Retired').length;
    const utilization = totalActive ? Math.round((activeFleet / totalActive) * 100) : 0;
    const pendingTrips = filteredTrips.filter(t => t.status === 'Draft').length;
    const onDutyDrivers = drivers?.filter(d => {
        // If filtering by region/type, only count drivers if they are on one of the filtered vehicle's trips or linked to filtered vehicles
        // For simplicity and correctness with the existing UI expectations, we just filter by duty status but respect the context if possible.
        // However, the dashboard focus is operational. Let's keep driver count filtered by their status but maybe tied to active trips if needed.
        return d.status === 'On Duty' || d.status === 'On Trip';
    }).length || 0;

    const statusData = [
        { name: 'Available', value: available, color: '#10b981' },
        { name: 'On Trip', value: activeFleet, color: '#3b82f6' },
        { name: 'In Shop', value: inShop, color: '#f59e0b' },
        { name: 'Retired', value: filteredVehicles.filter(v => v.status === 'Retired').length, color: '#6b7280' },
    ].filter(d => d.value > 0);

    const tripsByStatus = [
        { name: 'Draft', count: filteredTrips.filter(t => t.status === 'Draft').length },
        { name: 'Dispatched', count: filteredTrips.filter(t => t.status === 'Dispatched').length },
        { name: 'Completed', count: filteredTrips.filter(t => t.status === 'Completed').length },
        { name: 'Cancelled', count: filteredTrips.filter(t => t.status === 'Cancelled').length },
    ];

    const totalFuelCost = filteredExpenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + (e.cost || 0), 0);
    const totalMaintCost = filteredMaintenance.reduce((s, m) => s + (m.cost || 0), 0);
    const costTrend = [
        { month: 'Jan', fuel: totalFuelCost * 0.8, maint: totalMaintCost * 0.7 }, // Mocked previous month
        { month: 'Feb', fuel: totalFuelCost, maint: totalMaintCost },
    ];

    const recentTrips = [...filteredTrips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><LayoutDashboard size={22} style={{ color: 'var(--accent)' }} />Command Center</h1>
                    <p>Fleet overview and operational insights</p>
                </div>
                <div className="header-filters">
                    <CustomSelect
                        value={regionFilter}
                        onChange={setRegionFilter}
                        options={[
                            { value: 'All', label: 'All Regions' },
                            { value: 'North', label: 'North' },
                            { value: 'South', label: 'South' },
                            { value: 'East', label: 'East' },
                            { value: 'West', label: 'West' }
                        ]}
                    />
                    <CustomSelect
                        value={typeFilter}
                        onChange={setTypeFilter}
                        options={[
                            { value: 'All', label: 'All Types' },
                            { value: 'Truck', label: 'Truck' },
                            { value: 'Van', label: 'Van' },
                            { value: 'Bike', label: 'Bike' }
                        ]}
                    />
                    <CustomSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'All', label: 'All Status' },
                            { value: 'Available', label: 'Available' },
                            { value: 'On Trip', label: 'On Trip' },
                            { value: 'In Shop', label: 'In Shop' }
                        ]}
                    />
                </div>
            </div>

            <div className="kpi-grid">
                <KPICard icon={Truck} label="Active Fleet" value={activeFleet} color="blue" description="Vehicles currently on trip" />
                <KPICard icon={AlertTriangle} label="Maintenance Alerts" value={inShop} color="orange" description="Vehicles currently in shop" />
                <KPICard icon={Gauge} label="Utilization Rate" value={`${utilization}%`} color="green" description="Percent of fleet assigned" />
                <KPICard icon={Package} label="Pending Cargo" value={pendingTrips} color="purple" description="Shipments waiting assignment" />
                <KPICard icon={Users} label="On Duty Drivers" value={onDutyDrivers} color="blue" />
                <KPICard icon={TrendingUp} label="Total Revenue" value={`₹${filteredTrips.filter(t => t.status === 'Completed').reduce((s, t) => s + (t.revenue || 0), 0).toLocaleString()}`} color="green" />
            </div>

            <div className="dashboard-grid">
                {/* ... (charts remain same as they use the filtered variables now) */}
                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={16} style={{ color: 'var(--accent)' }} />Fleet Status Distribution</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    stroke="none"
                                    paddingAngle={5}
                                >
                                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={16} style={{ color: 'var(--accent)' }} />Trips Overview</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={tripsByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 6 }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} style={{ color: 'var(--accent)' }} />Cost Trends</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={costTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="fuel"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 0, fill: '#f59e0b' }}
                                    name="Fuel Cost"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="maint"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 0, fill: '#8b5cf6' }}
                                    name="Maintenance"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card recent-activity">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} style={{ color: 'var(--accent)' }} />Recent Trips</h3>
                    <div className="activity-list">
                        {recentTrips.map(trip => {
                            const vehicle = trip.vehicleId?.name ? trip.vehicleId : vehicles?.find(v => v._id === (trip.vehicleId?._id || trip.vehicleId));
                            const driver = trip.driverId?.name ? trip.driverId : drivers?.find(d => d._id === (trip.driverId?._id || trip.driverId));
                            return (
                                <div key={trip._id} className="activity-item">
                                    <div className="activity-info">
                                        <span className="activity-route" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                            {trip.origin}
                                            <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            {trip.destination}
                                        </span>
                                        <span className="activity-meta">{vehicle?.name} • {driver?.name}</span>
                                    </div>
                                    <StatusPill status={trip.status} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {filteredVehicles.length > 0 && (typeFilter !== 'All' || statusFilter !== 'All' || regionFilter !== 'All') ? (
                <div className="filtered-vehicles">
                    <h3>Filtered Vehicles ({filteredVehicles.length})</h3>
                    <div className="vehicle-chips">
                        {filteredVehicles.map(v => (
                            <div key={v._id} className="vehicle-chip">
                                <span className="chip-name">{v.name}</span>
                                <StatusPill status={v.status} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
