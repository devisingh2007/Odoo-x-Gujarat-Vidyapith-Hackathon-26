import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const { dispatch, state } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [showForgot, setShowForgot] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        const user = state.users.find(u => u.email === email && u.password === password);
        if (user) {
            dispatch({ type: 'LOGIN', payload: { email, password } });
            navigate('/');
        } else {
            setError('Invalid email or password');
        }
    };

    const quickLogin = (email, password) => {
        setEmail(email);
        setPassword(password);
        const user = state.users.find(u => u.email === email && u.password === password);
        if (user) {
            dispatch({ type: 'LOGIN', payload: { email, password } });
            navigate('/');
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-gradient" />
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Zap size={36} />
                    </div>
                    <h1>FleetFlow</h1>
                    <p>Modular Fleet & Logistics Management</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-wrap">
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
                            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-btn">Sign In</button>

                    <button type="button" className="forgot-btn" onClick={() => setShowForgot(!showForgot)}>
                        Forgot Password?
                    </button>

                    {showForgot && (
                        <div className="forgot-msg">
                            Contact your administrator to reset your password.
                        </div>
                    )}
                </form>

                <div className="quick-login">
                    <span className="quick-label">Quick Access (Demo)</span>
                    <div className="quick-btns">
                        <button onClick={() => quickLogin('manager@fleetflow.com', 'manager123')}>Manager</button>
                        <button onClick={() => quickLogin('dispatch@fleetflow.com', 'dispatch123')}>Dispatcher</button>
                        <button onClick={() => quickLogin('safety@fleetflow.com', 'safety123')}>Safety</button>
                        <button onClick={() => quickLogin('finance@fleetflow.com', 'finance123')}>Finance</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
