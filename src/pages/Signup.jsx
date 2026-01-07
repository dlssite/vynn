import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ParticleBackground from '../components/ParticleBackground';
import toast from 'react-hot-toast';
import api from '../services/api'; // Services api
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaDiscord } from 'react-icons/fa';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: ''
    });
    const [isReferralLocked, setIsReferralLocked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Username availability state
    const [usernameStatus, setUsernameStatus] = useState('idle'); // idle, checking, available, taken, invalid
    const [usernameMessage, setUsernameMessage] = useState('');

    const { signup } = useAuth();
    const navigate = useNavigate();

    // Auto-fill referral code from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            setFormData(prev => ({ ...prev, referralCode: refCode }));
            setIsReferralLocked(true);
            // Proactively validate
            api.post('/referral/validate', { code: refCode })
                .then(res => {
                    if (res.data.valid) {
                        toast.success(`Welcome! You were referred by ${res.data.referrer.username}`);
                    }
                })
                .catch(() => {
                    setIsReferralLocked(false); // Unlock if invalid
                });
        }
    }, []);

    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (!formData.username) {
                setUsernameStatus('idle');
                setUsernameMessage('');
                return;
            }

            if (formData.username.length < 3) {
                setUsernameStatus('invalid');
                setUsernameMessage('Too short (min 3 chars)');
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                setUsernameStatus('invalid');
                setUsernameMessage('Only letters, numbers, and underscores');
                return;
            }

            setUsernameStatus('checking');

            try {
                // Using the specific endpoint we just created
                const response = await api.get(`/users/check-username/${formData.username}`);
                if (response.data.available) {
                    setUsernameStatus('available');
                    setUsernameMessage('Username available!');
                } else {
                    setUsernameStatus('taken');
                    setUsernameMessage(response.data.message || 'Username already taken');
                }
            } catch (error) {
                console.error("Check username failed", error);
                // Fallback or ignore if server error, don't block user but maybe warn
                setUsernameStatus('idle');
            }
        };

        const timeoutId = setTimeout(() => {
            if (formData.username) checkUsername();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username]);


   const handleChange = (e) => {
  let value = e.target.value;

  if (e.target.name === 'username') {
    value = value
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  setFormData({ ...formData, [e.target.name]: value });
};


   const handleSubmit = async (e) => {
  e.preventDefault();

  if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
    return toast.error('Please fix username errors');
  }

  if (formData.password !== formData.confirmPassword) {
    return toast.error('Passwords do not match');
  }

  setLoading(true);
  try {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanUsername = formData.username.trim().toLowerCase();
    const cleanReferral = formData.referralCode?.trim() || '';

    await signup(
      cleanEmail,
      formData.password,
      cleanUsername,
      cleanReferral
    );

    navigate('/account');
  } catch (error) {
    console.error(error);

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      'Failed to create account';

    toast.error(message);
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <ParticleBackground />

            {/* Background Effects */}
            <div className="ambient-glow" style={{ bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(255, 69, 0, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div className="ambient-glow" style={{ top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255, 140, 0, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 50, padding: '24px' }}
            >
                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
                    <div className="text-center" style={{ marginBottom: '32px' }}>
                        <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.05em' }}>VYNN<span style={{ color: 'var(--accent)' }}>.</span></h1>
                        </Link>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '8px' }}>Initialize</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Create your digital presence.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="username"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    value={formData.username}
                                    onChange={handleChange}
                                    style={{
                                        ...inputStyle,
                                        borderColor: usernameStatus === 'available' ? '#10B981' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#EF4444' : 'rgba(255,255,255,0.1)',
                                        paddingRight: '40px'
                                    }}
                                    required
                                    autoComplete="off"
                                />
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                                    {usernameStatus === 'checking' && <FaSpinner style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />}
                                    {usernameStatus === 'available' && <FaCheckCircle style={{ color: '#10B981' }} />}
                                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <FaTimesCircle style={{ color: '#EF4444' }} />}
                                </div>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                            {/* Validation Message */}
                            {usernameStatus !== 'idle' && usernameStatus !== 'checking' && (
                                <p style={{
                                    fontSize: '0.75rem',
                                    marginTop: '6px',
                                    color: usernameStatus === 'available' ? '#10B981' : '#EF4444'
                                }}>
                                    {usernameMessage}
                                </p>
                            )}
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </div>

                        {/* Referral Code Section */}
                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Referral Code <span style={{ opacity: 0.5, fontWeight: 'normal', textTransform: 'none' }}>(Optional)</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="referralCode"
                                    value={formData.referralCode || ''}
                                    onChange={handleChange}
                                    onBlur={async (e) => {
                                        if (e.target.value.length > 3) {
                                            try {
                                                const res = await api.post('/referral/validate', { code: e.target.value });
                                                if (res.data.valid) {
                                                    toast.success(`Referral valid! Referred by ${res.data.referrer.username}`);
                                                }
                                            } catch (err) {
                                                toast.error('Invalid referral code');
                                            }
                                        }
                                    }}
                                    placeholder="VYNN-XXXX or vynn+username"
                                    style={{
                                        ...inputStyle,
                                        opacity: isReferralLocked ? 0.7 : 1,
                                        cursor: isReferralLocked ? 'not-allowed' : 'text',
                                        background: isReferralLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'
                                    }}
                                    autoComplete="off"
                                    readOnly={isReferralLocked}
                                />
                                {isReferralLocked && (
                                    <div
                                        onClick={() => setIsReferralLocked(false)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '0.7rem',
                                            color: 'var(--accent)',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        CHANGE
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={loading || usernameStatus === 'checking' || usernameStatus === 'taken'}
                            style={{ marginTop: '16px', opacity: (loading || usernameStatus === 'checking' || usernameStatus === 'taken') ? 0.7 : 1 }}
                        >
                            {loading ? 'Creating Account (and rewards!)...' : 'Get Started'}
                        </Button>
                    </form>

                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    <a
                        href="/api/auth/discord"
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
                        Join with Discord
                    </a>

                    <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '32px' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'white', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
