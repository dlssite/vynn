import { useState, useEffect } from 'react';
import { FaCheck, FaStar, FaBriefcase, FaUserShield, FaMagic, FaChartBar, FaGlobeAmericas, FaMinus, FaClock, FaInfinity, FaCheckCircle, FaBolt, FaDiscord } from 'react-icons/fa';
import Button from '../../components/Button';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Premium = () => {
    const { user: authUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/profiles/@me');
                setProfileUser(res.data.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const user = profileUser || authUser;
    const isPro = user?.isPremium;

    // Calculate remaining time
    const getRemainingTime = () => {
        if (!user?.premiumUntil) return null;
        const now = new Date();
        const expiry = new Date(user.premiumUntil);
        const diffTime = Math.abs(expiry - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const remainingDays = getRemainingTime();

    const featureSections = [
        {
            title: 'Aesthetics & Identity',
            icon: FaMagic,
            features: [
                { name: 'Atmospheric Synthesis', desc: 'CRT, VHS, Rain, and Snow effects', free: false, pro: true },
                { name: 'Aura Synthesis', desc: 'Sparkle, Rainbow, and Glow identity states', free: false, pro: true },
                { name: 'Video Backgrounds', desc: 'Dynamic motion backgrounds for your profile', free: false, pro: true },
                { name: 'Custom Cursors', desc: 'Personalize your pointer arsenal', free: false, pro: true },
                { name: 'Verified Creator Badge', desc: 'Official blue checkmark on your identity', free: false, pro: true },
                { name: 'Identity Branding', desc: 'Remove all Vynn watermarks and branding', free: false, pro: true },
            ]
        },
        {
            title: 'Connectivity & Limits',
            icon: FaBolt,
            features: [
                { name: 'Protocol Matrix', desc: 'Link up to 4 server nodes (vs 1 for free)', free: false, pro: true },
                { name: 'Expanded Linkage', desc: '3 custom link slots (vs 1 for free)', free: false, pro: true },
                { name: 'Custom Snapshots', desc: 'Save and load custom design templates', free: false, pro: true },
                { name: 'Premium Marketplace', desc: 'Priority access to exclusive frames and assets', free: false, pro: true },
                { name: 'Custom SEO', desc: 'Personalized social preview cards', free: false, pro: true },
                { name: 'Priority Support', desc: 'Skip the queue for expert assistance', free: false, pro: true },
            ]
        },
        {
            title: 'Community & Promotion',
            icon: FaBriefcase,
            features: [
                { name: 'Stellar Presentation', desc: 'Glowing gradient borders on server cards', free: false, pro: true },
                { name: 'Live Feeds', desc: 'Real-time Discord channel previews', free: false, pro: true },
                { name: 'Vanity URLs', desc: 'Custom server slugs (vynn.gg/servers/slug)', free: false, pro: true },
                { name: 'Elite Analytics', desc: 'Deep traffic insights and conversion data', free: false, pro: true },
                { name: 'Search Priority', desc: 'Boosted visibility in server discovery', free: false, pro: true },
            ]
        }
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '48px' }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '999px',
                    background: 'rgba(249, 115, 22, 0.1)', color: '#f97316',
                    fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                    letterSpacing: '0.1em', marginBottom: '24px',
                    border: '1px solid rgba(249, 115, 22, 0.2)'
                }}>
                    <FaStar /> Vynn Premium
                </div>

                {/* Status Banner */}
                {isPro && (
                    <div className="mb-10 animate-fade-in p-1 bg-gradient-to-r from-orange-500/20 to-orange-400/10 rounded-3xl inline-block">
                        <div className="bg-[#0a0a0a] rounded-[22px] px-8 py-4 border border-orange-500/30 flex flex-col md:flex-row items-center gap-6">
                            <div className="text-left">
                                <p className="text-secondary text-xs font-bold uppercase tracking-wider mb-1">Current Status</p>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                    <FaCheckCircle className="text-orange-500" />
                                    Active Member
                                </h2>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                            <div className="text-left">
                                <p className="text-secondary text-xs font-bold uppercase tracking-wider mb-1">Time Remaining</p>
                                <div className="text-xl font-bold text-white flex items-center gap-2">
                                    {user.isLifetimePremium ? (
                                        <>
                                            <FaInfinity className="text-purple-400" />
                                            <span>Lifetime Access</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaClock className="text-blue-400" />
                                            <span>{remainingDays ? `${remainingDays} Days` : 'Calculated...'}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                    Level up your <span style={{ color: '#f97316' }}>identity.</span>
                </h1>
                <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
                    Unlock the full potential of your digital presence with professional tools and exclusive customization.
                </p>
            </motion.div>

            <div className="dash-grid grid-cols-1 md-cols-2" style={{ maxWidth: '1000px', margin: '0 auto 96px auto' }}>
                {/* Free Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{ padding: '40px', borderRadius: '40px', display: 'flex', flexDirection: 'column', opacity: isPro ? 0.5 : 1 }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Basic</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>Essential features for everyone.</p>

                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '40px' }}>
                        $0 <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal', fontStyle: 'italic' }}>Forever</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px', flex: 1 }}>
                        {['1 Discord Slot', '1 Custom Link', 'Standard Analytics', 'Vynn Watermark'].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'rgba(161, 161, 161, 0.8)' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    <FaCheck />
                                </div>
                                <span style={{ fontSize: '0.875rem' }}>{item}</span>
                            </div>
                        ))}
                    </div>

                    <Button variant="secondary" fullWidth style={{ padding: '16px' }} disabled={!isPro}>
                        {isPro ? 'Downgrade' : 'Current Plan'}
                    </Button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`glass-panel ${isPro ? 'border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.2)]' : ''}`}
                    style={{
                        padding: '40px', borderRadius: '40px', position: 'relative', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        background: 'linear-gradient(to bottom, rgba(249, 115, 22, 0.08), transparent)',
                        borderColor: isPro ? 'rgba(249,115,22,0.5)' : 'rgba(249, 115, 22, 0.3)',
                    }}
                >
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <div style={{
                            background: '#f97316', color: 'white', fontSize: '10px', fontWeight: '900',
                            padding: '6px 12px', borderRadius: '999px', textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)'
                        }}>
                            {isPro ? 'Active' : 'Most Popular'}
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Professional <FaStar style={{ color: '#f97316', fontSize: '0.875rem' }} />
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>For creators and power users.</p>

                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '40px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        $4.99
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal', fontStyle: 'italic' }}>/ month</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px', flex: 1 }}>
                        {[
                            { text: 'Dynamic Video Backgrounds', icon: FaMagic },
                            { text: 'Elite Audience Analytics', icon: FaChartBar },
                            { text: 'Custom SEO & Social Cards', icon: FaGlobeAmericas },
                            { text: 'Verified Creator Badge', icon: FaUserShield },
                            { text: 'Protocol Expansion (4 Slots)', icon: FaDiscord },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    background: 'rgba(249, 115, 22, 0.2)', color: '#f97316',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px'
                                }}>
                                    <item.icon />
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <Button fullWidth style={{ padding: '16px', boxShadow: '0 8px 24px rgba(249, 115, 22, 0.2)' }} disabled={isPro}>
                        {isPro ? 'Plan Active' : 'Upgrade to Pro'}
                    </Button>
                </motion.div>
            </div>

            {/* Comprehensive Feature Showcase */}
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '48px', textAlign: 'center', letterSpacing: '-0.02em' }}>
                    Everything unlocked with <span style={{ color: '#f97316' }}>Pro</span>
                </h3>

                <div className="grid grid-cols-1 md-cols-3 gap-8 mb-16 px-4">
                    {featureSections.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-2">
                                <section.icon className="text-[#f97316] text-lg" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-white/50">{section.title}</h4>
                            </div>
                            <div className="flex flex-col gap-4">
                                {section.features.map((f, i) => (
                                    <div key={i} className="glass-panel p-5 rounded-3xl group hover:border-orange-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors">{f.name}</h5>
                                            <FaCheckCircle className="text-orange-500/40 group-hover:text-orange-500" size={14} />
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-secondary font-medium">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-40 mb-10">Powering over 10,000+ personal and community hubs.</p>
                </div>
            </div>

            <style>{`
                .table-cell {
                    padding: 24px;
                    font-size: 0.875rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .table-head {
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 10px;
                    font-weight: bold;
                    color: var(--text-secondary);
                }
                .table-row:hover {
                    background: rgba(255, 255, 255, 0.01);
                }
                .table-row:last-child .table-cell {
                    border-bottom: none;
                }
            `}</style>

        </div>
    );
};

export default Premium;
