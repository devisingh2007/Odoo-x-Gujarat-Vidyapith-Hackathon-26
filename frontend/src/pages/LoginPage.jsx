import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const { dispatch, apiCall } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await apiCall('/auth/login', 'POST', { email, password });
            dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = async (email, password) => {
        setEmail(email);
        setPassword(password);
        // We'll call handleLogin manually after updating state, 
        // but since state updates are async, we use the values directly to avoid waiting
        setError('');
        setIsLoading(true);
        try {
            const data = await apiCall('/auth/login', 'POST', { email, password });
            dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Quick login failed');
        } finally {
            setIsLoading(false);
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
                    <span className="quick-label">Industry Roles (Demo Access)</span>
                    <div className="quick-btns">
                        <button onClick={() => quickLogin('admin@fleet.com', 'admin123')} disabled={isLoading} title="Full system control">
                            Fleet Manager
                        </button>
                        <button onClick={() => quickLogin('dispatcher@fleet.com', 'admin123')} disabled={isLoading} title="Trip & Driver assignment">
                            Dispatcher
                        </button>
                        <button onClick={() => quickLogin('safety@fleet.com', 'admin123')} disabled={isLoading} title="Compliance & Safety scores">
                            Safety Officer
                        </button>
                        <button onClick={() => quickLogin('analyst@fleet.com', 'admin123')} disabled={isLoading} title="ROI & Expense auditing">
                            Financial Analyst
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
