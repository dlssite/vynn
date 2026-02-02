import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    if (isAuthPage) return null;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/#features' },
        { name: 'Pricing', path: '/#pricing' },
    ];

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-inner glass-panel">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        VYNN<span>.</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="navbar-nav desktop-only">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="nav-link"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="navbar-actions desktop-only">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard">
                                    <Button size="sm">Dashboard</Button>
                                </Link>
                                <span onClick={logout} className="nav-link-logout">
                                    Logout
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link-login">
                                    Login
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-toggle"
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
                        className="mobile-menu glass-panel"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="mobile-link"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="mobile-divider" />
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="mobile-link highlight">
                                    Dashboard
                                </Link>
                                <span
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="mobile-link logout"
                                >
                                    Logout
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="mobile-link">
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
