import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
    LayoutDashboard, Truck, Route, Wrench, Receipt,
    Users, BarChart3, LogOut, Menu, X, Zap
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { path: '/vehicles', icon: Truck, label: 'Vehicles', roles: ['Manager', 'Dispatcher'] },
    { path: '/trips', icon: Route, label: 'Trips', roles: ['Manager', 'Dispatcher'] },
    { path: '/maintenance', icon: Wrench, label: 'Maintenance', roles: ['Manager'] },
    { path: '/expenses', icon: Receipt, label: 'Expenses', roles: ['Manager', 'Financial Analyst'] },
    { path: '/drivers', icon: Users, label: 'Drivers', roles: ['Manager', 'Dispatcher', 'Safety Officer'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['Manager', 'Financial Analyst'] },
];

export default function Sidebar() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const role = state.auth.user?.role;

    const filtered = navItems.filter(item => item.roles.includes(role));

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
                <Menu size={24} />
            </button>
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Zap size={28} className="logo-icon" />
                        {!collapsed && <span className="logo-text">FleetFlow</span>}
                    </div>
                    <button className="collapse-btn desktop-only" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <Menu size={18} /> : <X size={18} />}
                    </button>
                    <button className="collapse-btn mobile-only" onClick={() => setMobileOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {filtered.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                            end={item.path === '/'}
                        >
                            <item.icon size={20} />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">{state.auth.user?.name?.charAt(0)}</div>
                        {!collapsed && (
                            <div className="user-info">
                                <span className="user-name">{state.auth.user?.name}</span>
                                <span className="user-role">{state.auth.user?.role}</span>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={18} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
        </>
    );
}
