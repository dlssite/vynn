import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import {
    FaPlus, FaTrash, FaGripLines, FaPencilAlt, FaGlobe,
    FaDiscord, FaTwitter, FaInstagram, FaYoutube, FaTwitch,
    FaSpotify, FaGithub, FaTiktok, FaSteam, FaEnvelope, FaTelegram, FaReddit, FaPaypal
} from 'react-icons/fa';
import { SiRoblox, SiCashapp } from "react-icons/si";
import { motion, AnimatePresence } from 'framer-motion';

const SOCIAL_PLATFORMS = [
    { id: 'discord', label: 'Discord', icon: FaDiscord, color: '#5865F2', placeholder: 'Discord Invite URL' },
    { id: 'twitter', label: 'Twitter', icon: FaTwitter, color: '#1DA1F2', placeholder: 'Twitter Profile URL' },
    { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E1306C', placeholder: 'Instagram Profile URL' },
    { id: 'youtube', label: 'YouTube', icon: FaYoutube, color: '#FF0000', placeholder: 'YouTube Channel URL' },
    { id: 'twitch', label: 'Twitch', icon: FaTwitch, color: '#9146FF', placeholder: 'Twitch Channel URL' },
    { id: 'spotify', label: 'Spotify', icon: FaSpotify, color: '#1DB954', placeholder: 'Spotify Profile/Track URL' },
    { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000', placeholder: 'TikTok Profile URL' },
    { id: 'github', label: 'GitHub', icon: FaGithub, color: '#181717', placeholder: 'GitHub Profile URL' },
    { id: 'steam', label: 'Steam', icon: FaSteam, color: '#00adee', placeholder: 'Steam Profile URL' },
    { id: 'telegram', label: 'Telegram', icon: FaTelegram, color: '#0088cc', placeholder: 't.me/username' },
    { id: 'reddit', label: 'Reddit', icon: FaReddit, color: '#FF4500', placeholder: 'Reddit Profile URL' },
    { id: 'email', label: 'Email', icon: FaEnvelope, color: '#D44638', placeholder: 'mailto:your@email.com' },
    { id: 'paypal', label: 'PayPal', icon: FaPaypal, color: '#00457C', placeholder: 'paypal.me/username' },
    // Fallbacks for others if not available in this icon set
    // { id: 'roblox', label: 'Roblox', icon: FaGlobe, color: '#000', placeholder: 'Roblox Profile URL' }, 
];

const Links = () => {
    const { user } = useAuth();
    const [links, setLinks] = useState([]);
    const [socials, setSocials] = useState([]);
    const [loading, setLoading] = useState(true);

    const isPremium = user?.isPremium;
    const linkLimit = isPremium ? 3 : 1;
    const isAtLimit = links.length >= linkLimit;

    // Custom Link State
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [isAddingLink, setIsAddingLink] = useState(false);

    // Social Edit State
    const [activeSocial, setActiveSocial] = useState(null); // { platform, url }
    const [socialUrl, setSocialUrl] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/profiles/@me');
            setLinks(res.data.profile.links || []);
            setSocials(res.data.profile.socials || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Custom Links Logic ---
    const handleAddLink = async (e) => {
        e.preventDefault();
        if (!newLink.title || !newLink.url) return;

        try {
            const res = await api.post('/profiles/@me/links', newLink);
            setLinks(res.data.links);
            setNewLink({ title: '', url: '' });
            setIsAddingLink(false);
            toast.success('Link added');
        } catch (error) {
            toast.error('Failed to add link');
        }
    };

    const handleDeleteLink = async (id) => {
        if (!window.confirm('Delete this link?')) return;
        try {
            const res = await api.delete(`/profiles/@me/links/${id}`);
            setLinks(res.data.links);
            toast.success('Link deleted');
        } catch (error) {
            toast.error('Failed to delete link');
        }
    };

    // --- Socials Logic ---
    const openSocialEditor = (platformId) => {
        const existing = socials.find(s => s.platform === platformId);
        setActiveSocial(SOCIAL_PLATFORMS.find(p => p.id === platformId));
        setSocialUrl(existing ? existing.url : '');
    };

    const handleSaveSocial = async (e) => {
        e.preventDefault();
        if (!activeSocial) return;

        let updatedSocials = [...socials];

        if (!socialUrl) {
            // Remove if empty
            updatedSocials = updatedSocials.filter(s => s.platform !== activeSocial.id);
        } else {
            // Add or Update
            const index = updatedSocials.findIndex(s => s.platform === activeSocial.id);
            if (index > -1) {
                updatedSocials[index].url = socialUrl;
            } else {
                updatedSocials.push({ platform: activeSocial.id, url: socialUrl });
            }
        }

        try {
            // Update profile with new socials array
            await api.put('/profiles/@me', { socials: updatedSocials });
            setSocials(updatedSocials);
            setActiveSocial(null);
            setSocialUrl('');
            toast.success(socialUrl ? `${activeSocial.label} updated` : `${activeSocial.label} removed`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update social');
        }
    };

    // Check if a platform is configured
    const isConfigured = (id) => socials.some(s => s.platform === id);

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Links & Connections</h1>
                    <p className="text-secondary">Direct your traffic where it matters.</p>
                </div>
            </div>

            {/* Social Media Grid */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', marginBottom: '40px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 className="text-xl font-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaGlobe /> Link your social media profiles.
                    </h2>
                    <p className="text-secondary text-sm mt-1">Pick a social media to add to your profile.</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {SOCIAL_PLATFORMS.map(platform => {
                        const isConfiguredPlatform = isConfigured(platform.id);
                        const isSelected = activeSocial?.id === platform.id;
                        const showColor = isConfiguredPlatform || isSelected;

                        return (
                            <button
                                key={platform.id}
                                onClick={() => openSocialEditor(platform.id)}
                                className="social-btn"
                                style={{
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: showColor ? platform.color : 'rgba(255,255,255,0.05)',
                                    color: showColor ? '#fff' : 'var(--text-muted)',
                                    border: isSelected ? '2px solid #fff' : '2px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    fontSize: '1.5rem',
                                    boxShadow: showColor ? `0 4px 12px ${platform.color}40` : 'none',
                                    position: 'relative',
                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                                }}
                                title={platform.label}
                            >
                                <platform.icon />
                                {isConfiguredPlatform && (
                                    <div style={{
                                        position: 'absolute', bottom: -2, right: -2,
                                        width: '18px', height: '18px', background: '#000',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Social Editor Inline Modal */}
                <AnimatePresence>
                    {activeSocial && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <form onSubmit={handleSaveSocial} style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: `1px solid ${activeSocial.color}40` }}>
                                <label className="form-label" style={{ color: activeSocial.color }}>Editing {activeSocial.label}</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={activeSocial.placeholder}
                                        value={socialUrl}
                                        onChange={e => setSocialUrl(e.target.value)}
                                        autoFocus
                                    />
                                    <Button type="submit">Save</Button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSocial(null)}
                                        style={{ padding: '0 16px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                                    >Cancel</button>
                                </div>
                                <p className="text-xs text-muted mt-2">Leave empty to remove.</p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Links Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 className="text-xl font-bold">Custom Links</h2>
                    <p className="text-xs text-secondary mt-1">
                        Using <span className={isAtLimit ? 'text-orange-500 font-bold' : 'text-white'}>{links.length} / {linkLimit}</span> slots.
                        {!isPremium && isAtLimit && (
                            <Link to="/premium" className="ml-2 text-primary hover:underline italic">Upgrade for 3 slots →</Link>
                        )}
                    </p>
                </div>
                {!isAtLimit ? (
                    <Button onClick={() => setIsAddingLink(!isAddingLink)} variant={isAddingLink ? 'secondary' : 'primary'}>
                        <FaPlus style={{ marginRight: '8px' }} /> Add URL
                    </Button>
                ) : (
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-muted text-xs font-bold uppercase tracking-wider">
                        Limit Reached
                    </div>
                )}
            </div>

            {/* Add Link Form */}
            <AnimatePresence>
                {isAddingLink && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-panel"
                        style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255, 69, 0, 0.3)', overflow: 'hidden' }}
                    >
                        <form onSubmit={handleAddLink} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', gap: '16px', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    placeholder="My Portfolio"
                                    value={newLink.title}
                                    onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                    className="form-input"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newLink.url}
                                    onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <Button type="submit" size="lg">Add</Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Links List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {links.length === 0 && !isAddingLink && (
                    <div style={{ padding: '40px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px', textAlign: 'center' }}>
                        <p className="text-secondary">No custom links added yet.</p>
                    </div>
                )}

                {links.map((link, i) => (
                    <motion.div
                        key={link._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-panel"
                        style={{ padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}
                    >
                        <div style={{ cursor: 'grab', opacity: 0.5, padding: '8px' }}>
                            <FaGripLines />
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{link.title}</h3>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{link.url}</p>
                        </div>

                        <div style={{ padding: '0 16px', borderLeft: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <span style={{ display: 'block', fontWeight: 700, fontSize: '1.2rem' }}>{link.clicks || 0}</span>
                            <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clicks</span>
                        </div>

                        <button
                            onClick={() => handleDeleteLink(link._id)}
                            className="btn-icon"
                            style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
                            title="Delete"
                        >
                            <FaTrash />
                        </button>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .social-btn:hover {
                    transform: scale(1.1);
                    background: rgba(255,255,255,0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default Links;
