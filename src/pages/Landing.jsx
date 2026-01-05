import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import ParticleBackground from '../components/ParticleBackground';
import { FaDiscord, FaBolt, FaCrown, FaUsers, FaPalette, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

const Landing = () => {
    const { scrollYProgress } = useScroll();
    const { isAuthenticated } = useAuth();
    const { config } = useConfig();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    // Scroll reveal animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    return (
        <Layout contentStyle={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
            <ParticleBackground />

            {/* --- Hero Section --- */}
            <section className="relative flex flex-col items-center justify-center text-center" style={{ minHeight: '90vh', paddingTop: '60px' }}>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    style={{ position: 'relative', zIndex: 10 }}
                >
                    <motion.div variants={fadeInUp} style={{ marginBottom: '24px' }}>
                        <span style={{
                            background: 'rgba(255, 69, 0, 0.1)',
                            border: '1px solid rgba(255, 69, 0, 0.2)',
                            color: '#FF4500',
                            padding: '8px 20px',
                            borderRadius: '99px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            boxShadow: '0 0 20px rgba(255, 69, 0, 0.15)'
                        }}>
                            Vynn 1.0 is Here
                        </span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-3xl md:text-6xl font-bold" style={{ marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        <span style={{ color: 'white' }}>Your </span>
                        <span className="text-gradient" style={{ fontSize: '1.1em' }}>identity,</span>
                        <br />
                        <span style={{ color: 'white' }}>beautifully connected.</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg text-secondary" style={{ maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                        The ultimate profile platform for Discord communities.
                        Level up your presence with XP, badges, and next-gen customization.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex justify-center gap-4" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {isAuthenticated ? (
                            <Link to="/dashboard" style={{ width: '100%', maxWidth: '280px' }}>
                                <Button size="lg" fullWidth style={{ boxShadow: '0 0 30px rgba(255, 69, 0, 0.4)' }}>
                                    <FaBolt style={{ marginRight: '10px' }} />
                                    Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button size="lg" style={{ boxShadow: '0 0 30px rgba(255, 69, 0, 0.4)' }}>
                                        Claim Your Vynn
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="lg">
                                        Member Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                </motion.div>

                {/* Hero Dashboard Preview (Abstract Mockup) */}
                {/* Hero Dashboard Preview (Abstract Mockup) */}
                <motion.div
                    initial={{ opacity: 0, y: 100, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{
                        marginTop: '80px',
                        width: '100%',
                        maxWidth: '1000px',
                        height: '500px',
                        background: 'linear-gradient(180deg, rgba(20,20,20,0.8), rgba(10,10,10,1))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px 20px 0 0',
                        boxShadow: '0 -20px 60px rgba(255, 69, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        perspective: '1000px',
                        zIndex: 5
                    }}
                >
                    {/* Mock UI Elements */}
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: '100%' }}>
                        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
                            <div style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '30px' }} />
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ width: '100%', height: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '10px' }} />
                            ))}
                        </div>
                        <div style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: 'linear-gradient(45deg, #FF4500, #FF8C00)' }} />
                                <div>
                                    <div style={{ width: '200px', height: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', marginBottom: '10px' }} />
                                    <div style={{ width: '140px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Overlay Gradient at bottom to blend */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '150px', background: 'linear-gradient(to top, #050505, transparent)' }} />
                </motion.div>
            </section>

            {/* --- Visual Showcase Section (New) --- */}
            <section style={{ padding: '0 0 100px', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '60px', flexDirection: 'column' }}>
                    <div className="text-center" style={{ maxWidth: '800px' }}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Showcase Your Style</h2>
                        <p className="text-secondary text-lg">
                            From animated frames to exclusive badges. Your profile is your canvas.
                            Customize every detail to match your vibe.
                        </p>
                    </div>

                    <div style={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100px', height: '100%', zIndex: 2,
                            background: 'linear-gradient(to right, #050505, transparent)'
                        }} />
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: '100px', height: '100%', zIndex: 2,
                            background: 'linear-gradient(to left, #050505, transparent)'
                        }} />

                        <motion.div
                            className="flex gap-6"
                            animate={{ x: [0, -1000] }}
                            transition={{
                                x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" },
                            }}
                            style={{ width: 'max-content', padding: '20px 0' }}
                        >
                            {[...Array(2)].map((_, setIndex) => (
                                <React.Fragment key={setIndex}>
                                    {[
                                        { name: 'Kael', role: 'Artist', color: '#FF4500' },
                                        { name: 'Viper', role: 'Gamer', color: '#10B981' },
                                        { name: 'Luna', role: 'Dev', color: '#3B82F6' },
                                        { name: 'Nova', role: 'Creator', color: '#F59E0B' },
                                        { name: 'Rift', role: 'Streamer', color: '#8B5CF6' }
                                    ].map((profile, i) => (
                                        <div key={i} className="glass-panel" style={{
                                            width: '280px', height: '360px', borderRadius: '24px', flexShrink: 0,
                                            border: `1px solid ${profile.color}40`,
                                            background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 10px 40px ${profile.color}20`
                                        }}>
                                            <div style={{
                                                width: '100px', height: '100px', borderRadius: '50%',
                                                border: `3px solid ${profile.color}`,
                                                marginBottom: '20px',
                                                boxShadow: `0 0 20px ${profile.color}40`,
                                                background: `linear-gradient(45deg, ${profile.color}, #111)`
                                            }} />
                                            <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>
                                            <span style={{
                                                padding: '6px 16px', borderRadius: '20px',
                                                background: `${profile.color}20`, color: profile.color,
                                                fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                                            }}>
                                                {profile.role}
                                            </span>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Power Features --- */}
            <section style={{ padding: '80px 0', position: 'relative' }}>
                <div className="container" style={{ padding: '0 20px' }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center"
                        style={{ marginBottom: '60px' }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Forged for Creators</h2>
                        <p className="text-secondary max-w-xl mx-auto">Everything you need to showcase your digital legacy.</p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {[
                            { icon: FaPalette, title: 'Deep Customization', desc: 'Control every pixel. Gradients, glassmorphism, and custom CSS support.', color: '#FF4500' },
                            { icon: FaBolt, title: 'Instant Performance', desc: 'Blazing fast load times. Optimized for mobile and Discord embeds.', color: '#F59E0B' },
                            { icon: FaCrown, title: 'XP & Progression', desc: 'Earn XP for engagement. Level up to unlock exclusive frames and badges.', color: '#EF4444' }, // Using red-ish orange
                            { icon: FaDiscord, title: 'Discord First', desc: 'Seamless integration. Display your status, banner, and avatar automatically.', color: '#5865F2' },
                            { icon: FaUsers, title: 'Community Tools', desc: 'Guestbooks, reactions, and automated roles for your supporters.', color: '#3B82F6' },
                            { icon: FaShieldAlt, title: 'Secure & Safe', desc: 'Advanced moderation tools and NSFW gating to keep your community safe.', color: '#10B981' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="glass-panel group"
                                style={{
                                    transitionDelay: `${i * 0.1}s`,
                                    padding: '24px',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                                    background: `linear-gradient(90deg, ${feature.color}, transparent)`
                                }} />
                                <feature.icon size={28} style={{ color: feature.color, marginBottom: '20px' }} />
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-secondary text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Stats Banner --- */}
            <section style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px' }}>
                    {[
                        { val: '10k+', label: 'Active Users' },
                        { val: '500k+', label: 'Profile Views' },
                        { val: '2.5M+', label: 'Link Clicks' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center" style={{ minWidth: '140px' }}>
                            <h3 className="text-3xl lg:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'monospace' }}>{stat.val}</h3>
                            <p className="text-secondary uppercase tracking-widest text-xs font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Power CTA Section (Redesigned) --- */}
            <section style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
                {/* Dynamic Background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255, 69, 0, 0.08) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div className="container relative z-10" style={{ padding: '0 20px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel"
                        style={{
                            padding: '40px 24px',
                            borderRadius: '32px',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 69, 0, 0.3)',
                            background: 'linear-gradient(180deg, rgba(20,20,20,0.6), rgba(10,10,10,0.8))',
                            boxShadow: '0 0 60px rgba(255, 69, 0, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animated Border Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-50" />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-50" />

                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Start Your <span className="text-gradient">Legacy.</span>
                        </h2>
                        <p className="text-lg text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join the fastest growing profile platform for Discord.
                            Claim your unique URL and start building your identity today.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {isAuthenticated ? (
                                <Link to="/dashboard" style={{ width: '100%', maxWidth: '280px' }}>
                                    <Button size="lg" fullWidth style={{
                                        padding: '16px',
                                        fontSize: '1rem',
                                        background: 'linear-gradient(90deg, #FF4500, #FF8C00)',
                                        boxShadow: '0 0 30px rgba(255, 69, 0, 0.4)',
                                        border: 'none'
                                    }}>
                                        <FaBolt style={{ marginRight: '10px' }} />
                                        Enter Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/register" style={{ width: '100%', maxWidth: '280px' }}>
                                    <Button size="lg" fullWidth style={{
                                        padding: '16px',
                                        fontSize: '1rem',
                                        background: 'linear-gradient(90deg, #FF4500, #FF8C00)',
                                        boxShadow: '0 0 30px rgba(255, 69, 0, 0.4)',
                                        border: 'none'
                                    }}>
                                        <FaBolt style={{ marginRight: '10px' }} />
                                        Launch Vynn Profile
                                    </Button>
                                </Link>
                            )}
                            <a href={config.serverInviteLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%', maxWidth: '280px' }}>
                                <Button variant="outline" size="lg" fullWidth style={{ padding: '16px', fontSize: '1rem' }}>
                                    <FaDiscord style={{ marginRight: '10px' }} />
                                    Join Community
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FAQ Section --- */}
            <section style={{ padding: '0 0 80px' }}>
                <div className="container" style={{ maxWidth: '800px', padding: '0 20px' }}>
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-secondary text-sm">Everything you need to know about Vynn.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { q: 'Is Vynn free to use?', a: 'Yes! Vynn is completely free to start. We will introduce premium features for power users later, but the core experience will always remain free.' },
                            { q: 'Can I use my own domain?', a: 'Custom domain support is coming in Vynn 2.0. Stay tuned!' },
                            { q: 'How does the XP system work?', a: 'You earn XP passively when people view your profile or click your links. Active engagement in the community also boosts your rank.' },
                            { q: 'Is it safe for work?', a: 'Vynn supports all creators. We have a dedicated NSFW toggle and age-gate to ensure content is viewed by the appropriate audience.' }
                        ].map((faq, i) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Creative Footer --- */}
            <footer style={{ position: 'relative', paddingTop: '60px', paddingBottom: '0', background: '#000', marginTop: '0', overflow: 'hidden' }}>
                <div className="ambient-glow" style={{ bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '400px', background: 'radial-gradient(ellipse at bottom, rgba(255, 69, 0, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="container relative z-10" style={{ paddingBottom: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                        <div className="col-span-full md:col-span-1">
                            <h3 className="text-2xl font-bold text-white mb-4">VYNN.</h3>
                            <p className="text-secondary text-sm max-w-xs">Next-generation identity layer for the digital age.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
                            <ul className="text-secondary text-sm flex flex-col gap-2">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Showcase</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Community</h4>
                            <ul className="text-secondary text-sm flex flex-col gap-2">
                                <li><a href="#" className="hover:text-white transition-colors">Discord Server</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Twitter / X</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
                            <ul className="text-secondary text-sm flex flex-col gap-2">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                        <p className="text-xs text-muted text-center md:text-left">© 2024 Vynn Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <FaDiscord className="text-secondary hover:text-white cursor-pointer transition-colors text-xl" />
                            <FaUsers className="text-secondary hover:text-white cursor-pointer transition-colors text-xl" />
                        </div>
                    </div>
                </div>
            </footer>
        </Layout>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <motion.div
            className="glass-panel"
            initial={false}
            animate={{ backgroundColor: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)' }}
            style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-medium text-white text-sm md:text-base pr-4">{question}</h3>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-secondary flex-shrink-0">
                    ▼
                </motion.span>
            </div>
            <motion.div
                initial="collapsed"
                animate={isOpen ? "open" : "collapsed"}
                variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 }
                }}
                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
                <div style={{ padding: '0 20px 20px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                    {answer}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Landing;
