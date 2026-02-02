import { FaPen, FaCog, FaCrown, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const IdentityHeader = ({ user, profile }) => {
    const displayName = user?.displayName || user?.username || 'Vynn User';
    const vynnTag = user?.tag || '0000';

    // Resolve Avatar URL (Handle Discord hashes correctly)
    const getAvatarUrl = () => {
        if (profile?.avatar) return profile.avatar;
        if (user?.discord?.id && user?.discord?.avatar) {
            return `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`;
        }
        return 'https://vynn.me/logo.png';
    };

    const avatar = getAvatarUrl();
    const banner = profile?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

    return (
        <div className="identity-header">
            {/* Banner Section */}
            <div className="identity-banner">
                <img src={banner} alt="Banner" />
                <div className="identity-overlay" />

                <button className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10">
                    <FaPen size={14} />
                </button>
            </div>

            {/* Profile Info Bar */}
            <div className="identity-info-bar">
                <div className="identity-user-info">
                    {/* Avatar */}
                    <div className="identity-avatar-wrapper group">
                        <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <FaPen className="text-white" />
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="identity-meta">
                        <div className="identity-name-row">
                            <h1 className="identity-name">{displayName}</h1>
                            {user?.isVerified && <FaCheckCircle className="text-blue-400 text-xl" />}
                            {(user?.isPremium || user?.isLifetimePremium) && <FaCrown className="text-yellow-500 text-xl" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="identity-tag-badge">
                                <span>#</span>{vynnTag}
                            </div>
                            {user?.isPremium && (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full">
                                    Pro
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="identity-actions">
                    <Link to="/premium" className="btn-upgrade-premium">
                        Upgrade
                    </Link>
                    <Link to="/account/settings" className="btn-icon-square">
                        <FaCog size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default IdentityHeader;
