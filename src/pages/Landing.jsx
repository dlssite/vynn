import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import ParticleBackground from '../components/ParticleBackground';
import {
    FaDiscord, FaBolt, FaCrown, FaUsers, FaPalette, FaShieldAlt,
    FaGlobe, FaGem, FaRocket, FaCode, FaPaintBrush, FaLock, FaChartLine,
    FaFingerprint, FaLink, FaUserAstronaut, FaExchangeAlt, FaSearch, FaEye, FaShareAlt, FaMobileAlt, FaVideo, FaTwitter, FaGithub,
    FaCheckCircle, FaHashtag
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import '../styles/Landing.css';

const Landing = () => {
    const { isAuthenticated } = useAuth();
    const { config } = useConfig();

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        visible: { transition: { staggerChildren: 0.15 } }
    };

    return (
        <Layout contentStyle={{ padding: 0 }}>
            <SEO
                title="Your identity, beautifully connected."
                description="Your identity, beautifully connected. The comprehensive platform to consolidate your links, showcase your gaming stats, and grow your community in the Vynn ecosystem."
                keywords={['Gaming Profile', 'Discord Server List', 'Bio Link', 'Social Hub', 'Streamer Tools']}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Vynn",
                    "url": "https://vynn.me",
                    "applicationCategory": "SocialNetworkingApplication",
                    "operatingSystem": "Web, iOS, Android",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "seller": {
                            "@type": "Organization",
                            "name": "Vynn Inc"
                        }
                    },
                    "description": "Your identity, beautifully connected. Vynn is the ultimate digital identity platform for creators and communities.",
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "ratingCount": "3420"
                    }
                }}
            />
            <ParticleBackground />

            <div className="landing-container">
                {/* --- 1. Unified Split Hero --- */}
                <section className="landing-hero">
                    <motion.div
                        className="hero-content"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="hero-badge">
                            Vynn 2.1
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="hero-title">
                            Your identity, <br />
                            <span className="text-gradient">beautifully connected.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="hero-subtitle">
                            Forge your legacy with next-gen profiles. <br />
                            Expand your reach with the ultimate server discovery network.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="hero-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn-wrapper">
                                    <button className="btn-primary btn-lg glow-effect">
                                        <FaBolt /> Enter Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <div className="split-cta">
                                    <Link to="/register" className="btn-wrapper">
                                        <button className="btn-primary btn-lg glow-effect">
                                            <FaBolt /> Claim Identity
                                        </button>
                                    </Link>
                                    <Link to="/servers" className="btn-wrapper">
                                        <button className="btn-secondary btn-lg">
                                            <FaGlobe /> Explore Servers
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </section>

                {/* --- 2. The Dual Pillars (High-Fidelity Bento) --- */}
                <section className="dual-pillars-section">
                    <div className="container">
                        <div className="pillars-grid">

                            {/* Identity Pillar: Holographic ID */}
                            <motion.div
                                className="pillar-card identity-pillar"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="pillar-text-content">
                                    <div className="pillar-badge">
                                        <FaFingerprint /> Identity
                                    </div>
                                    <h3>Construct Your Legacy</h3>
                                    <p>A unified digital passport. Sync your entire digital life into one cohesive, evolving profile.</p>
                                </div>

                                <div className="pillar-visual-bento profile-bento">
                                    {/* The Floating Card */}
                                    <div className="bento-id-card">
                                        <div className="id-card-header">
                                            <div className="id-avatar"></div>
                                            <div className="id-info">
                                                <div className="id-name">Kael_07 <FaCheckCircle className="verified-badge" /></div>
                                                <div className="id-role">Pro Creator</div>
                                            </div>
                                            <div className="id-logo">VYNN</div>
                                        </div>
                                        <div className="id-stats">
                                            <div className="id-stat">
                                                <span>Level</span>
                                                <strong>42</strong>
                                            </div>
                                            <div className="id-stat">
                                                <span>Views</span>
                                                <strong>12.5k</strong>
                                            </div>
                                            <div className="id-stat">
                                                <span>Rep</span>
                                                <strong>Elite</strong>
                                            </div>
                                        </div>
                                        <div className="id-xp-container">
                                            <div className="id-xp-info">
                                                <span>XP Progress</span>
                                                <span>8,400 / 10,000</span>
                                            </div>
                                            <div className="id-xp-track">
                                                <div className="id-xp-fill" style={{ width: '84%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Background Decor */}
                                    <div className="bento-decor-circle"></div>
                                    <div className="bento-decor-dots"></div>
                                </div>
                            </motion.div>

                            {/* Surface Nexus Pillar: Live Feed */}
                            <motion.div
                                className="pillar-card surface-pillar"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <div className="pillar-text-content">
                                    <div className="pillar-badge nexus-badge">
                                        <FaGlobe /> Nexus
                                    </div>
                                    <h3>Discover Communities</h3>
                                    <p>The heartbeat of the network. Find your next home with live, intelligent server matching.</p>
                                </div>

                                <div className="pillar-visual-bento nexus-bento">
                                    <div className="bento-search-mock">
                                        <FaSearch /> <span>Find active servers...</span>
                                    </div>

                                    <div className="bento-server-list">
                                        {[
                                            { name: "Apex Legends LFG", count: "14,204 Online", tag: "#Gaming", hot: true },
                                            { name: "Design Hub", count: "892 Online", tag: "#Creative", hot: false },
                                            { name: "Vynn Official", count: "3,599 Online", tag: "#Community", hot: true }
                                        ].map((server, i) => (
                                            <div key={i} className={`bento-server-item ${server.hot ? 'hot-item' : ''}`}>
                                                <div className="server-item-icon"></div>
                                                <div className="server-item-info">
                                                    <div className="server-name">{server.name}</div>
                                                    <div className="server-count">
                                                        <span className={`status-dot ${server.hot ? 'pulsing' : ''}`}></span>
                                                        {server.count}
                                                    </div>
                                                </div>
                                                <div className="server-tag">{server.tag}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* --- 3. Personal Identity Deep Dive --- */}
                <section className="identity-deep-dive">
                    <div className="container">
                        <SectionHeader
                            title="Master Your Persona"
                            subtitle="More than just a link-in-bio. A complete social operating system."
                        />
                        <div className="feature-showcase-grid">
                            <FeatureCard
                                icon={FaShareAlt}
                                title="The Social Engine"
                                desc="Connect Discord, Twitch, X, and more. Sync your status and avatar automatically."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={FaGem}
                                title="XP & Badges"
                                desc="Gamify your growth. Earn XP for every view and click. Unlock exclusive badges."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={FaMobileAlt}
                                title="Ultra Responsive"
                                desc="Looks stunning on every device. Swipe-optimized interaction for mobile users."
                                delay={0.3}
                            />
                        </div>
                    </div>
                </section>

                {/* --- 4. Community Discovery Suite --- */}
                <section className="discovery-suite">
                    <div className="bg-glow-orb"></div>
                    <div className="container">
                        <SectionHeader
                            title="The Server Nexus"
                            subtitle="Give your community the spotlight it deserves."
                        />

                        <div className="nexus-preview">
                            <motion.div
                                className="glowing-server-card"
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <div className="server-banner"></div>
                                <div className="server-info">
                                    <div className="server-icon"></div>
                                    <h3>Apex Legends LFG</h3>
                                    <div className="server-stats">
                                        <span><span className="dot online"></span> 1,240 Online</span>
                                        <span><FaUsers /> 14,500 Members</span>
                                    </div>
                                    <button className="btn-sm btn-join">Join Server</button>
                                </div>
                            </motion.div>
                            <div className="nexus-text">
                                <h3>Glowing Vanity Cards</h3>
                                <p>Stand out in the listing with animated borders and live member counts. First impressions matter.</p>
                                <ul className="check-list">
                                    <li>Priority Search Ranking</li>
                                    <li>Custom Vanity URLs</li>
                                    <li>Verified Reviews</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 5. Power Features Grid --- */}
                <section className="power-features">
                    <div className="container">
                        <SectionHeader title="Everything You Need" />
                        <div className="grid-responsive-3">
                            <SmallFeature icon={FaPalette} title="Full Customization" desc="Total control over your aesthetic." />
                            <SmallFeature icon={FaVideo} title="Video Backgrounds" desc=" immersive identity." />
                            <SmallFeature icon={FaRocket} title="Instant Load" desc="Optimized for performance." />
                            <SmallFeature icon={FaLock} title="Privacy Control" desc="NSFW gates & moderation." />
                            <SmallFeature icon={FaChartLine} title="Analytics" desc="Track your audience growth." />
                            <SmallFeature icon={FaCode} title="API Access" desc="For developers & bots." />
                        </div>
                    </div>
                </section>

                {/* --- 6. The Pro Suite --- */}
                <section className="pro-suite">
                    <div className="container">
                        <div className="pro-card">
                            <div className="pro-header">
                                <FaCrown className="pro-icon" />
                                <h2>Vynn PRO</h2>
                                <p>Unlock the full potential of your identity.</p>
                            </div>
                            <div className="pro-grid">
                                <div className="pro-item"><span>✦</span> Verified Creator Badge</div>
                                <div className="pro-item"><span>✦</span> 100 Asset Upload Limit</div>
                                <div className="pro-item"><span>✦</span> 4 Connected Server Nodes</div>
                                <div className="pro-item"><span>✦</span> 3 Custom Link Slots</div>
                                <div className="pro-item"><span>✦</span> Video Backgrounds & CRT</div>
                                <div className="pro-item"><span>✦</span> Glowing Server Cards</div>
                                <div className="pro-item"><span>✦</span> Zero Vynn Branding</div>
                                <div className="pro-item"><span>✦</span> Priority Search Ranking</div>
                            </div>
                            <div className="pro-cta">
                                <Link to="/premium">
                                    <button className="btn-primary btn-wide">View Plans</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 7. Detailed Footer --- */}
                <footer className="main-footer">
                    <div className="container">
                        <div className="footer-grid">
                            <div className="footer-brand">
                                <h3>VYNN.</h3>
                                <p>The comprehensive merged hub for creators and communities.</p>
                                <div className="social-links">
                                    <a href="#"><FaDiscord /></a>
                                    <a href="#"><FaTwitter /></a>
                                    <a href="#"><FaGithub /></a>
                                </div>
                            </div>
                            <div className="footer-col">
                                <h4>Platform</h4>
                                <Link to="/features">Features</Link>
                                <Link to="/servers">Browe Servers</Link>
                                <Link to="/premium">Premium</Link>
                            </div>
                            <div className="footer-col">
                                <h4>Resources</h4>
                                <Link to="/blog">Blog</Link>
                                <Link to="/help">Help Center</Link>
                                <Link to="/guidelines">Community Guidelines</Link>
                            </div>
                            <div className="footer-col">
                                <h4>Legal</h4>
                                <Link to="/privacy">Privacy Policy</Link>
                                <Link to="/terms">Terms of Service</Link>
                                <Link to="/cookies">Cookie Policy</Link>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; {new Date().getFullYear()} Vynn Inc. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </Layout>
    );
};

// --- Sub-components ---

const SectionHeader = ({ title, subtitle }) => (
    <div className="section-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        className="glass-feature-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.6 }}
    >
        <div className="icon-box"><Icon /></div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </motion.div>
);

const SmallFeature = ({ icon: Icon, title, desc }) => (
    <div className="small-feature">
        <Icon className="sf-icon" />
        <div>
            <h4>{title}</h4>
            <p>{desc}</p>
        </div>
    </div>
);

export default Landing;
