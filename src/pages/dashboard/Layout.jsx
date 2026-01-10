import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLink, FaPalette, FaSignOutAlt, FaChevronDown, FaStar, FaLayerGroup, FaShoppingCart, FaHistory, FaUserPlus, FaAward } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LivePreview from './LivePreview';
import './Dashboard.css';

import { DashboardProvider } from '../../context/DashboardContext';

const DashboardLayoutContent = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState('Account'); // Default expanded
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const navItems = [
        {
            label: 'Account', icon: FaUser,
            path: '/account', // Parent path
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
        if (expandedMenu === label) {
            setExpandedMenu(null);
        } else {
            setExpandedMenu(label);
        }
    };

    const isPathActive = (path) => {
        if (path === '/account' && location.pathname === '/account') return true;
        if (path !== '/account' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="dashboard-container">
            {/* Mobile Header - Visible only below 1024px */}
            <header className="mobile-header lg:hidden">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="mobile-menu-btn"
                >
                    <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                <span className="text-xl font-bold">V<span className="text-orange-500">ynn.</span></span>

                <button
                    onClick={() => setShowMobilePreview(!showMobilePreview)}
                    className={`mobile-preview-btn ${showMobilePreview ? 'active' : ''}`}
                >
                    {showMobilePreview ? <FaPalette /> : <FaHistory />}
                </button>
            </header>

            {/* Sidebar Overlay */}
            <div
                className={`sidebar-overlay lg:hidden ${mobileMenuOpen ? 'visible' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <Link to="/" className="sidebar-header hidden lg:flex">
                    <span className="text-2xl font-bold" style={{ letterSpacing: '-0.05em' }}>V<span className="text-orange-500 hidden lg:inline">ynn.</span></span>
                </Link>

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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <item.icon className="text-xl" />
                                            <span className="nav-label">{item.label}</span>
                                        </div>
                                        <FaChevronDown
                                            style={{
                                                fontSize: '0.8rem',
                                                transform: expandedMenu === item.label ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s'
                                            }}
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
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '20px', paddingBottom: '8px' }}>
                                                    {item.subItems.map(sub => (
                                                        <Link
                                                            key={sub.path}
                                                            to={sub.path}
                                                            className={`nav-subitem ${location.pathname === sub.path ? 'active' : ''}`}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            style={{
                                                                padding: '8px 12px', borderRadius: '8px',
                                                                fontSize: '0.9rem', color: 'var(--text-secondary)',
                                                                textDecoration: 'none', display: 'flex', alignItems: 'center',
                                                                transition: 'all 0.2s',
                                                                background: location.pathname === sub.path ? 'rgba(255,255,255,0.05)' : 'transparent'
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <item.icon className="text-xl" />
                                        <span className="nav-label">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span style={{
                                            fontSize: '0.65rem', fontWeight: 'bold',
                                            background: 'var(--primary)', padding: '2px 6px',
                                            borderRadius: '6px', color: '#fff'
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={logout}
                        className="nav-item"
                        style={{ color: '#ef4444', justifyContent: 'flex-start', width: '100%' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user.username[0].toUpperCase()
                                )}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {user.displayName || user.username}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.7 }}>
                                    @{user.username}<span style={{ opacity: 0.5 }}>#{user.tag || '0000'}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area (Split Screen) */}
            <main className="dashboard-main">
                {/* Editor Scroll Area */}
                <div className={`editor-area ${showMobilePreview ? 'hidden-mobile' : ''}`}>
                    {/* Ambient Glows specific to dashboard */}
                    <div className="ambient-glow" style={{ top: 0, left: 0, width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 69, 0, 0.05) 0%, transparent 70%)' }} />

                    <div className="editor-content">
                        {children}
                    </div>
                </div>

                {/* Live Preview */}
                <div className={`preview-area ${showMobilePreview ? 'active-mobile' : ''}`}>
                    <LivePreview />
                </div>
            </main>
        </div>
    );
};

const DashboardLayout = ({ children }) => (
    <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
);

export default DashboardLayout;
