import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjusted path
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser, FaLink, FaPalette, FaSignOutAlt, FaChevronDown,
    FaStar, FaLayerGroup, FaShoppingCart, FaHistory, FaUserPlus, FaAward
} from 'react-icons/fa';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState('Account');

    const navItems = [
        {
            label: 'Account', icon: FaUser,
            path: '/account',
            subItems: [
                { path: '/account', label: 'Overview' },
                { path: '/account/analytics', label: 'Analytics' },
                { path: '/account/settings', label: 'Settings' }
            ]
        },
        { path: '/account/badges', label: 'Badges', icon: FaAward },
        { path: '/design', label: 'Customize', icon: FaPalette },
        { path: '/store', label: 'Store', icon: FaShoppingCart },
        { path: '/dashboard/referrals', label: 'Referrals', icon: FaUserPlus },
        { path: '/templates', label: 'Templates', icon: FaLayerGroup },
        { path: '/forge', label: 'Vault', icon: FaHistory },
        { path: '/links', label: 'Links', icon: FaLink },
        { path: '/premium', label: 'Premium', icon: FaStar, badge: 'PRO' },
    ];

    const toggleMenu = (label) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const isPathActive = (path) => {
        if (path === '/account' && location.pathname === '/account') return true;
        if (path !== '/account' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            {/* Sidebar Logo */}
            <Link to="/" className="sidebar-header hidden lg:flex">
                <span className="text-2xl font-bold tracking-tight">
                    V<span className="text-orange-500 hidden lg:inline">ynn.</span>
                </span>
            </Link>

            {/* Navigation Items */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <div key={item.label} className="nav-group">
                        {item.subItems ? (
                            <>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`nav-item ${expandedMenu === item.label ? 'active' : ''}`}
                                    style={{ justifyContent: 'space-between', width: '100%' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="text-xl" />
                                        <span className="nav-label">{item.label}</span>
                                    </div>
                                    <FaChevronDown
                                        className={`text-xs transition-transform duration-200 ${expandedMenu === item.label ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {expandedMenu === item.label && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="flex flex-col gap-1 pl-5 pb-2">
                                                {item.subItems.map(sub => (
                                                    <Link
                                                        key={sub.path}
                                                        to={sub.path}
                                                        className={`nav-subitem ${location.pathname === sub.path ? 'active' : ''} block px-3 py-2 rounded-lg text-sm text-secondary transition-colors hover:bg-white/5`}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        style={{
                                                            background: location.pathname === sub.path ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                            color: location.pathname === sub.path ? '#fff' : 'var(--text-secondary)'
                                                        }}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <Link
                                to={item.path}
                                className={`nav-item ${isPathActive(item.path) ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="text-xl" />
                                    <span className="nav-label">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[10px] font-bold bg-primary px-1.5 py-0.5 rounded text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Sidebar Footer (User Profile) */}
            <div className="sidebar-footer">
                <button
                    onClick={logout}
                    className="nav-item text-red-500 hover:text-red-400 w-full justify-start"
                >
                    <div className="flex items-center gap-3">
                        <FaSignOutAlt className="text-xl" />
                        <span className="logout-label">Logout</span>
                    </div>
                </button>

                {user && (
                    <div className="user-snippet">
                        <div className="user-avatar-small">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-slate-800 text-white font-bold">
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">
                                {user.displayName || user.username}
                            </p>
                            <p className="text-xs text-secondary truncate opacity-70">
                                @{user.username}<span className="opacity-50">#{user.tag || '0000'}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
