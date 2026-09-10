import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import ExpensesPage from './pages/ExpensesPage';
import DriversPage from './pages/DriversPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useState, useEffect } from 'react';
import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { state } = useApp();
  if (!state.auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(state.auth.user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  const { state, refreshData } = useApp();
  const [slowLoad, setSlowLoad] = useState(false);

  useEffect(() => {
    if (!state.loading) { setSlowLoad(false); return; }
    const t = setTimeout(() => setSlowLoad(true), 5000);
    return () => clearTimeout(t);
  }, [state.loading]);

  if (!state.auth.isAuthenticated) return <LoginPage />;

  if (state.loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white' }}>
        <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {slowLoad ? '⏳ Waking up server (Render free tier – ~30 sec)...' : 'Synchronizing fleet data...'}
        </p>
        {slowLoad && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>Please wait, the backend is starting up.</p>}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ marginBottom: '8px' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '8px' }}>{state.error}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '420px', marginBottom: '24px' }}>
          The backend may still be waking up. Wait 30 seconds then retry.
        </p>
        <button className="btn-primary" onClick={refreshData}>🔄 Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['Manager', 'Admin', 'Dispatcher']}><VehiclesPage /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute allowedRoles={['Manager', 'Admin', 'Dispatcher']}><TripsPage /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><MaintenancePage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute allowedRoles={['Manager', 'Financial Analyst', 'Admin']}><ExpensesPage /></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute allowedRoles={['Manager', 'Admin', 'Dispatcher', 'Safety Officer']}><DriversPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Manager', 'Financial Analyst', 'Admin']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="particles-layer"></div>
      <div className="nebula-overlay"></div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
