import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDiscord } from 'react-icons/fa';
import Button from '../components/Button';
import ParticleBackground from '../components/ParticleBackground';
import toast from 'react-hot-toast';
import api, { API_BASE_URL } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle SSO Redirects
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        if (redirect) {
            // Save redirect for after login
            sessionStorage.setItem('vynn_sso_redirect', redirect);

            // If already logged in, redirect back immediately
            if (isAuthenticated) {
                const token = localStorage.getItem('vynn_token');
                window.location.href = `${redirect}/login/callback?token=${token}`;
            }
        }
    }, [isAuthenticated, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);

            // Check for SSO redirect
            const ssoRedirect = sessionStorage.getItem('vynn_sso_redirect');
            if (ssoRedirect) {
                sessionStorage.removeItem('vynn_sso_redirect');
                const token = localStorage.getItem('vynn_token');
                window.location.href = `${ssoRedirect}/login/callback?token=${token}`;
                return;
            }

            navigate('/account');
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.error || 'Failed to login';
            if (!error.handled) toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: 'white',
        outline: 'none',
        transition: 'all 0.2s',
        fontSize: '1rem'
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <ParticleBackground />

            {/* Background Effects */}
            <div className="ambient-glow" style={{ top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(255, 69, 0, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div className="ambient-glow" style={{ bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255, 140, 0, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10, padding: '24px' }}
            >
                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
                    <div className="text-center" style={{ marginBottom: '32px' }}>
                        <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
                            <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.05em' }}>VYNN<span className="text-accent">.</span></h1>
                        </Link>
                        <h2 className="text-2xl font-medium" style={{ marginBottom: '8px' }}>Welcome Back</h2>
                        <p className="text-sm text-secondary">Enter the void.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="text-xs font-bold text-muted" style={{ display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                                <label className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                                <a href="#" className="text-xs text-secondary hover-text-primary">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={loading}
                            style={{ marginTop: '16px' }}
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </Button>
                    </form>

                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    <a
                        href={`${API_BASE_URL}/auth/discord`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            background: '#5865F2',
                            color: 'white',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            textDecoration: 'none'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#4752C4'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#5865F2'}
                    >
                        <FaDiscord size={20} />
                        Login with Discord
                    </a>

                    <div className="text-center text-sm text-secondary" style={{ marginTop: '32px' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'white', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                            Create one
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
