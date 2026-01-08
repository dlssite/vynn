import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { FaUser, FaUserPlus, FaRocket, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const Onboarding = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        referralCode: ''
    });

    useEffect(() => {
        // If user is already completed, redirect to dashboard
        if (user && user.onboardingCompleted) {
            navigate('/dashboard');
        }

        // Auto-fill from localStorage for Discord flow
        const savedRef = localStorage.getItem('vynn_referrer');
        if (savedRef && !formData.referralCode) {
            setFormData(prev => ({ ...prev, referralCode: savedRef }));
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put('/auth/onboarding', formData);
            toast.success('Welcome to Vynn!');
            localStorage.removeItem('vynn_referrer');
            await checkAuth(); // Refresh user data
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0c',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

            <div className="animate-fade-in" style={{
                maxWidth: '500px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '32px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #f97316 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'white',
                        fontSize: '2rem',
                        boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)'
                    }}>
                        <FaRocket />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Welcome to Vynn</h1>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Finalize your identity to start crafting your unique digital aesthetic.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Username Input */}
                    <div style={{ textAlign: 'left' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                            <FaUser size={12} /> Choose Username
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. aesthetic_king"
                            className="form-input"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                fontSize: '1rem'
                            }}
                        />
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Lowercase, numbers, and underscores only.</p>
                    </div>

                    {/* Referral Input (Optional) */}
                    <div style={{ textAlign: 'left' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                            <FaUserPlus size={12} /> Referral Code (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="VYNN-XXXX"
                            className="form-input"
                            value={formData.referralCode}
                            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                fontSize: '1rem',
                                textTransform: 'uppercase'
                            }}
                        />
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Get a 100 Credit bonus with a referral code!</p>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <Button
                            type="submit"
                            loading={loading}
                            fullWidth
                            style={{
                                padding: '18px',
                                borderRadius: '18px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                background: 'linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            Complete Setup <FaArrowRight size={14} />
                        </Button>
                    </div>
                </form>

                {/* Benefits */}
                <div style={{
                    marginTop: '40px',
                    paddingTop: '32px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <FaCheckCircle style={{ color: '#10b981' }} /> Custom Profile
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <FaCheckCircle style={{ color: '#10b981' }} /> Shared Links
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <FaCheckCircle style={{ color: '#10b981' }} /> Social Badges
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
