import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import {
    FaUser, FaHashtag, FaEye, FaPen, FaCheckCircle,
    FaDiscord, FaShieldAlt, FaCog, FaCreditCard, FaArrowRight,
    FaRegSmileBeam, FaRocket, FaCertificate
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Account = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Real-time Data: Poll every 5 seconds to keep stats and health updated
    useEffect(() => {
        fetchProfile();
        const interval = setInterval(fetchProfile, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profiles/@me');
            setProfile(res.data.profile);
            setUserData(res.data.user);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const completionSteps = [
        { label: 'Upload Avatar', done: !!profile?.avatar, icon: FaUser, link: '/design' },
        { label: 'Write Bio', done: !!profile?.bio, icon: FaPen, link: '/account/settings' },
        { label: 'Discord Link', done: !!userData?.discord?.id, icon: FaDiscord, action: 'discord' },
        { label: 'Social Icons', done: profile?.socials?.length > 0, icon: FaHashtag, link: '/account/settings' },
    ];
    const completedCount = completionSteps.filter(s => s.done).length;
    const progress = Math.round((completedCount / completionSteps.length) * 100);

    const handleStepClick = (step) => {
        if (step.action === 'discord' && !step.done) {
            if (!userData?.discord?.id) {
                window.location.href = `/api/auth/discord?token=${localStorage.getItem('vynn_token')}`;
            }
        }
    };

    const displayUser = userData || authUser;

    return (
        <div className="animate-fade-in w-full overflow-hidden">
            {/* Command Center Header */}
            <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <div>
                    <h1 className="page-title text-3xl font-black">Command Center</h1>
                    <p className="text-secondary text-sm flex items-center gap-2 mt-1">
                        Welcome back, <span className="text-white font-bold">{displayUser?.displayName || displayUser?.username}</span> <FaRegSmileBeam className="text-orange-500" />
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link to="/premium" className="action-button-premium flex-1 md:flex-none justify-center">
                        <FaRocket /> GO PRO
                    </Link>
                    <Link to="/account/settings" className="action-button-outline flex-1 md:flex-none justify-center">
                        <FaCog /> SETTINGS
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="dash-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-10 gap-4">
                <StatCard label="Username" value={displayUser?.username} icon={FaUser} sub="Primary handle" color="#3b82f6" />
                <StatCard label="Display Name" value={displayUser?.displayName || displayUser?.username} icon={FaUser} sub="Profile title" color="#f97316" />
                <StatCard label="Vynn Tag" value={`#${displayUser?.tag || '0000'}`} icon={FaHashtag} sub="Social discriminator" color="#a855f7" />
                <StatCard label="Global Views" value={profile?.views || 0} icon={FaEye} sub="Total reach" color="#22c55e" />
            </div>

            {/* Main Content Layout */}
            <div className="dash-grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Completion - Left Side (2 cols) */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 md:p-8 mb-8 rounded-[32px]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Profile Health</h3>
                                <p className="text-secondary text-xs">Complete these steps to unlock full potential.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-orange-500">{progress}%</span>
                                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Strength</p>
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="progress-bar-container mb-10 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                            />
                        </div>

                        {/* Interactive Checklist */}
                        <div className="dash-grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completionSteps.map((step, i) => {
                                const ItemWrapper = step.link ? Link : 'div';
                                return (
                                    <ItemWrapper
                                        to={step.link}
                                        key={i}
                                        onClick={() => handleStepClick(step)}
                                        className={`checklist-item ${step.done ? 'checklist-item-done' : ''} p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.05] hover:border-white/10`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors ${step.done ? 'bg-white/5 text-muted' : 'bg-orange-500/10 text-orange-500'}`}>
                                                <step.icon />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${step.done ? 'text-muted line-through' : 'text-white'}`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-[10px] text-secondary">
                                                    {step.done ? 'Step Completed' : 'Tap to Complete'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`${step.done ? 'text-green-500' : 'text-white/10'}`}>
                                            <FaCheckCircle size={18} />
                                        </div>
                                    </ItemWrapper>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <Link to="/premium" className="promo-banner flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <FaCertificate size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold mb-1 text-indigo-100">Become a Verified Creator</h4>
                            <p className="text-secondary text-xs">Verified accounts get a blue checkmark, custom SEO settings, and appear higher in discovery.</p>
                        </div>
                        <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                            <FaArrowRight />
                        </div>
                    </Link>
                </div>

                {/* Right Side: Account Actions */}
                <div className="flex flex-col gap-6">
                    <section className="glass-panel p-6 md:p-8 rounded-[32px]">
                        <h3 className="mb-2 font-bold text-lg">Management</h3>
                        <p className="text-secondary mb-6 text-xs">Quick links to control your experience.</p>

                        <div className="flex flex-col gap-3">
                            <QuickLink to="/account/settings" icon={FaPen} label="Edit Identity" sub="Name, bio, and handle" />
                            <QuickLink to="/account/settings" icon={FaShieldAlt} label="Privacy & Security" sub="Protect your account" />
                            <QuickLink to="/premium" icon={FaCreditCard} label="Vynn Premium" sub="Manage subscription" highlight />
                            <QuickLink to="/account/settings" icon={FaCog} label="System Preferences" sub="General platform settings" />
                        </div>
                    </section>

                    <section className="glass-panel p-6 md:p-8 rounded-[32px]">
                        <h3 className="mb-2 font-bold text-lg">Social Auth</h3>
                        <p className="text-secondary mb-6 text-xs">Connect for faster logins.</p>

                        <button
                            className="discord-connect-btn w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold flex items-center justify-center gap-2 transition-all"
                            onClick={() => {
                                if (!displayUser?.discord?.id) {
                                    window.location.href = `/api/auth/discord?token=${localStorage.getItem('vynn_token')}`;
                                }
                            }}
                            disabled={!!displayUser?.discord?.id}
                        >
                            <FaDiscord size={20} />
                            {displayUser?.discord?.id ? 'Connected' : 'Sync Discord'}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ label, value, icon: Icon, sub, color }) => (
    <div className="stat-card">
        <div className="stat-card-icon-bg" style={{ color }}>
            <Icon />
        </div>
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-sub">{sub}</p>
    </div>
);

const QuickLink = ({ to, icon: Icon, label, sub, highlight }) => (
    <Link to={to} className={`action-link ${highlight ? 'action-link-highlight' : ''}`}>
        <div className={`action-link-icon ${highlight ? 'action-link-icon-highlight' : ''}`}>
            <Icon />
        </div>
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: highlight ? '#f97316' : 'white' }}>{label}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{sub}</p>
        </div>
        <FaArrowRight size={10} className="action-link-arrow" />
    </Link>
);

export default Account;
