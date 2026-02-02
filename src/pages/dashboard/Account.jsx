import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    FaUser, FaHashtag, FaEye, FaPen, FaDiscord,
    FaShieldAlt, FaCog, FaCreditCard, FaArrowRight,
    FaAward, FaLink, FaGift, FaServer, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import IdentityHeader from '../../components/dashboard/IdentityHeader';
import ProgressWidget from '../../components/dashboard/ProgressWidget';
import ServerCard from '../../components/dashboard/ServerCard';

const Account = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userServers, setUserServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    // Real-time Data
    useEffect(() => {
        fetchProfile();
        const interval = setInterval(fetchProfile, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profiles/@me');
            setProfile(res.data.profile);
            setUserData(res.data.user);

            // Fetch real server data from the owner
            try {
                const serverRes = await api.get('/servers/owner/@me');
                setUserServers(serverRes.data || []);
            } catch (err) {
                console.log("Failed to load real servers", err);
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const displayUser = userData || authUser;

    const completionSteps = [
        { label: 'Upload Avatar', done: !!profile?.avatar, icon: FaUser, link: '/design' },
        { label: 'Write Bio', done: !!profile?.bio, icon: FaPen, link: '/account/settings' },
        { label: 'Discord Link', done: !!userData?.discord?.id, icon: FaDiscord, action: 'discord' },
        { label: 'Social Icons', done: profile?.socials?.length > 0, icon: FaHashtag, link: '/account/settings' },
    ];

    return (
        <div className="animate-fade-in w-full pb-20">
            {/* Identity Hero */}
            <IdentityHeader user={displayUser} profile={profile} />

            <div className="dash-grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Stats & Main Actions */}
                <div className="xl:col-span-2 flex flex-col gap-8">

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Views" value={profile?.views || 0} icon={FaEye} color="#22c55e" />
                        <StatCard label="Referrals" value={displayUser?.referralStats?.totalReferrals || 0} icon={FaGift} color="#f97316" />
                        <StatCard label="Servers" value={userServers.length} icon={FaServer} color="#6366f1" />
                        <StatCard label="Rating" value="5.0" icon={FaAward} color="#eab308" />
                    </div>

                    {/* My Servers Section */}
                    <div className="server-section">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FaServer className="text-indigo-400" /> My Servers
                            </h2>
                            <div className="flex items-center gap-4">
                                {userServers.length > 2 && (
                                    <div className="hidden md:flex items-center gap-2">
                                        <button
                                            onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                                            className="carousel-nav-btn"
                                        >
                                            <FaChevronLeft size={12} />
                                        </button>
                                        <button
                                            onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                                            className="carousel-nav-btn"
                                        >
                                            <FaChevronRight size={12} />
                                        </button>
                                    </div>
                                )}
                                <a href={`${import.meta.env.VITE_SERVERS_URL || 'http://localhost:3000'}/submit`} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                    + Add Server
                                </a>
                            </div>
                        </div>

                        {userServers.length > 0 ? (
                            <div className="server-carousel-container">
                                <div
                                    ref={scrollRef}
                                    className="server-scroll-view no-scrollbar"
                                >
                                    {userServers.map(server => (
                                        <div
                                            key={server._id}
                                            className="server-card-wrapper"
                                        >
                                            <ServerCard server={server} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-white/10 flex flex-col items-center">
                                <FaServer size={48} className="text-white/10 mb-4" />
                                <h3 className="font-bold text-lg">No Servers Yet</h3>
                                <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
                                    Add your Discord server to Vynn to gain visibility, members, and premium tool access.
                                </p>
                                <a
                                    href={`${import.meta.env.VITE_SERVERS_URL || 'http://localhost:3000'}/submit`}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
                                >
                                    Add Server
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/design" className="glass-panel p-6 rounded-2xl group hover:bg-white/5 transition-all">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                <FaPen size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-1">Customize Profile</h3>
                            <p className="text-sm text-secondary">Update your theme, layout, and colors.</p>
                        </Link>

                        <Link to="/links" className="glass-panel p-6 rounded-2xl group hover:bg-white/5 transition-all">
                            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                                <FaLink size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-1">Manage Links</h3>
                            <p className="text-sm text-secondary">Add buttons for your socials and sites.</p>
                        </Link>
                    </div>

                    {/* Discord Connect Banner (If not connected) */}
                    {!displayUser?.discord?.id && (
                        <div className="p-6 rounded-2xl bg-[#5865F2] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#5865F2]/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <FaDiscord size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Connect Discord</h3>
                                    <p className="text-blue-100 text-sm">Unlock special badges and faster login.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.href = `/api/auth/discord?token=${localStorage.getItem('vynn_token')}`}
                                className="px-6 py-2 bg-white text-[#5865F2] font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
                            >
                                Link Account
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Health & Settings */}
                <div className="flex flex-col gap-6">
                    {/* Profile Health Widget */}
                    <ProgressWidget steps={completionSteps} />

                    {/* Settings Menu */}
                    <div className="glass-panel p-2 rounded-2xl">
                        <MenuLink to="/account/settings" icon={FaCog} label="General Settings" />
                        <MenuLink to="/account/badges" icon={FaAward} label="My Badges" />
                        <MenuLink to="/premium" icon={FaCreditCard} label="Billing & Plan" />
                        <MenuLink to="/account/settings" icon={FaShieldAlt} label="Privacy & Safety" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/[0.04] transition-colors">
        <div className="mb-2 text-2xl" style={{ color }}>
            <Icon />
        </div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-xs text-secondary font-bold uppercase tracking-wider">{label}</div>
    </div>
);

const MenuLink = ({ to, icon: Icon, label }) => (
    <Link to={to} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-3">
            <span className="text-secondary group-hover:text-white transition-colors"><Icon /></span>
            <span className="text-sm font-medium text-white/80 group-hover:text-white">{label}</span>
        </div>
        <FaArrowRight className="text-xs text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
    </Link>
);

export default Account;
