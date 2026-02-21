import { useApp } from '../context/AppContext';
import KPICard from '../components/ui/KPICard';
import StatusPill from '../components/ui/StatusPill';
import { Truck, AlertTriangle, Gauge, Package, Route, Users, TrendingUp, LayoutDashboard, PieChart as PieChartIcon, BarChart3, Activity, ArrowRight, MapPin, Filter, CircleDot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useState } from 'react';
import './DashboardPage.css';

export default function DashboardPage() {
    const { state } = useApp();
    const { vehicles, drivers, trips, maintenance, expenses } = state;
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState('All');

    const filtered = vehicles.filter(v =>
        (typeFilter === 'All' || v.type === typeFilter) &&
        (statusFilter === 'All' || v.status === statusFilter) &&
        (regionFilter === 'All' || v.region === regionFilter)
    );

    const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
    const inShop = vehicles.filter(v => v.status === 'In Shop').length;
    const available = vehicles.filter(v => v.status === 'Available').length;
    const totalActive = vehicles.filter(v => v.status !== 'Retired').length;
    const utilization = totalActive ? Math.round((activeFleet / totalActive) * 100) : 0;
    const pendingTrips = trips?.filter(t => t.status === 'Draft').length || 0;
    const onDutyDrivers = drivers?.filter(d => d.status === 'On Duty' || d.status === 'On Trip').length || 0;

    const statusData = [
        { name: 'Available', value: available, color: '#10b981' },
        { name: 'On Trip', value: activeFleet, color: '#3b82f6' },
        { name: 'In Shop', value: inShop, color: '#f59e0b' },
        { name: 'Retired', value: vehicles.filter(v => v.status === 'Retired').length, color: '#6b7280' },
    ].filter(d => d.value > 0);

    const tripsByStatus = [
        { name: 'Draft', count: trips.filter(t => t.status === 'Draft').length },
        { name: 'Dispatched', count: trips.filter(t => t.status === 'Dispatched').length },
        { name: 'Completed', count: trips.filter(t => t.status === 'Completed').length },
        { name: 'Cancelled', count: trips.filter(t => t.status === 'Cancelled').length },
    ];

    const totalFuelCost = expenses?.filter(e => e.type === 'Fuel').reduce((s, e) => s + (e.cost || 0), 0) || 0;
    const totalMaintCost = maintenance?.reduce((s, m) => s + (m.cost || 0), 0) || 0;
    const costTrend = [
        { month: 'Jan', fuel: 8000, maint: 5000 },
        { month: 'Feb', fuel: totalFuelCost, maint: totalMaintCost },
    ];

    const recentTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><LayoutDashboard size={22} style={{ color: 'var(--accent)' }} />Command Center</h1>
                    <p>Fleet overview and operational insights</p>
                </div>
                <div className="header-filters">
                    <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                        <option value="All">All Regions</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                    </select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                        <option value="Bike">Bike</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                    </select>
                </div>
            </div>

            <div className="kpi-grid">
                <KPICard icon={Truck} label="Active Fleet" value={activeFleet} color="blue" description="Vehicles currently on trip" />
                <KPICard icon={AlertTriangle} label="Maintenance Alerts" value={inShop} color="orange" description="Vehicles currently in shop" />
                <KPICard icon={Gauge} label="Utilization Rate" value={`${utilization}%`} color="green" description="Percent of fleet assigned" />
                <KPICard icon={Package} label="Pending Cargo" value={pendingTrips} color="purple" description="Shipments waiting assignment" />
                <KPICard icon={Users} label="On Duty Drivers" value={onDutyDrivers} color="blue" />
                <KPICard icon={TrendingUp} label="Total Revenue" value={`₹${trips?.filter(t => t.status === 'Completed').reduce((s, t) => s + (t.revenue || 0), 0).toLocaleString()}`} color="green" />
            </div>

            <div className="dashboard-grid">
                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={16} style={{ color: 'var(--accent)' }} />Fleet Status Distribution</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={16} style={{ color: 'var(--accent)' }} />Trips Overview</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={tripsByStatus}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} style={{ color: 'var(--accent)' }} />Cost Trends</h3>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={costTrend}>
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Line type="monotone" dataKey="fuel" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Fuel Cost" />
                                <Line type="monotone" dataKey="maint" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Maintenance" />
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

            {filtered.length > 0 && (typeFilter !== 'All' || statusFilter !== 'All' || regionFilter !== 'All') ? (
                <div className="filtered-vehicles">
                    <h3>Filtered Vehicles ({filtered.length})</h3>
                    <div className="vehicle-chips">
                        {filtered.map(v => (
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
