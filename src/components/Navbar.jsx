import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();

    // Only show navbar on main pages, or maybe show on all but auth?
    // User requested "superior design", often auth pages have no nav or minimal nav.
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    if (isAuthPage) return null;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/#features' },
        { name: 'Pricing', path: '/#pricing' },
    ];

    return (
        <nav className="fixed w-full px-6 py-6" style={{ top: 0, zIndex: 999 }}>
            <div className="container">
                <div className="glass-panel flex items-center justify-between" style={{ borderRadius: 'var(--radius-full)', padding: '16px 24px' }}>
                    {/* Logo */}
                    <Link to="/" className="text-xl font-bold" style={{ letterSpacing: '-0.05em' }}>
                        VYNN<span className="text-accent">.</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="nav-desktop flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-secondary hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="nav-desktop flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard">
                                    <Button size="sm">Dashboard</Button>
                                </Link>
                                <span
                                    onClick={logout}
                                    className="text-xs font-medium text-secondary hover:text-white transition-colors cursor-pointer opacity-70"
                                >
                                    Logout
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <span className="text-sm font-medium text-secondary hover:text-white transition-colors cursor-pointer">
                                        Login
                                    </span>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="nav-mobile-toggle text-primary"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute glass-panel flex flex-col gap-4"
                        style={{ top: '90px', left: '24px', right: '24px', padding: '24px', borderRadius: 'var(--radius-lg)' }}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-lg font-medium text-secondary"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                                    Dashboard
                                </Link>
                                <span
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="text-lg font-medium text-secondary"
                                >
                                    Logout
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium">
                                    Login
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)}>
                                    <Button fullWidth>Get Started</Button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
