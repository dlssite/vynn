import React, { useState, useEffect } from 'react';
import { FaDiscord, FaSpotify, FaGamepad, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DiscordPresence - A premium, portable component to display Discord live status.
 * Supports 'card' (standard), 'mini' (compact), and 'profile' (integrated) modes.
 */
const StatusPulse = ({ color }) => (
    <motion.div
        animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: color,
            zIndex: -1
        }}
    />
);

const DiscordPresence = ({ username, mode = 'card', className = '' }) => {
    const [presence, setPresence] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;

        const fetchPresence = async () => {
            try {
                const res = await api.get(`/profiles/${username}/presence`);
                if (res.data) {
                    setPresence(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch Discord presence", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPresence();
        const interval = setInterval(fetchPresence, 15000);
        return () => clearInterval(interval);
    }, [username]);

    if (loading) return (
        <div className="vynn-loader-container">
            <img src="/logo.png" className="vynn-logo-loader" alt="Loading..." />
        </div>
    );

    if (!presence || !presence.discord_status) return null;


    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#23a55a';
            case 'idle': return '#f0b232';
            case 'dnd': return '#f23f43';
            case 'offline': return '#80848e';
            default: return '#80848e';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'online': return 'Active Now';
            case 'idle': return 'Away';
            case 'dnd': return 'Do Not Disturb';
            default: return 'Offline';
        }
    };

    const customStatus = presence.activities?.find(a => a.type === 4);
    const displayActivities = presence.activities?.filter(a => a.type !== 4) || [];

    // Helper to format large images from Discord/Spotify
    const getLargeImage = (act) => {
        if (!act.assets?.large_image) return null;
        if (act.assets.large_image.startsWith('mp:external')) {
            return act.assets.large_image.replace(/mp:external\/.*\/(https?)/, '$1');
        }
        if (act.assets.large_image.startsWith('spotify:')) {
            return `https://i.scdn.co/image/${act.assets.large_image.replace('spotify:', '')}`;
        }
        return `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`discord-presence-vynn ${mode} ${displayActivities.length > 0 ? 'active-presence' : ''} ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Subtle Gradient Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle at center, ${getStatusColor(presence.discord_status)}15 0%, transparent 50%)`,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="vynn-presence-header" style={{ position: 'relative', zIndex: 2, marginBottom: displayActivities.length > 0 ? '12px' : 0 }}>
                <div className="vynn-presence-avatar-wrap" style={{ position: 'relative' }}>
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={presence.discord_user.avatar ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        className="vynn-presence-avatar"
                        alt="Discord"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            objectFit: 'cover'
                        }}
                    />
                    <div
                        className="vynn-presence-status-dot"
                        style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(presence.discord_status),
                            border: '2px solid #050505',
                            boxShadow: `0 0 10px ${getStatusColor(presence.discord_status)}`,
                            zIndex: 3
                        }}
                    >
                        <StatusPulse color={getStatusColor(presence.discord_status)} />
                    </div>
                </div>

                <div className="vynn-presence-meta" style={{ marginLeft: '12px', flex: 1 }}>
                    <div className="vynn-presence-user" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="vynn-username" style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.02em' }}>{presence.discord_user.username}</span>
                        <FaDiscord className="vynn-discord-icon" style={{ opacity: 0.6, fontSize: '12px' }} />
                    </div>
                    <div className="vynn-presence-status-text" style={{ fontSize: '10px', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>
                        {customStatus?.state || getStatusLabel(presence.discord_status)}
                    </div>
                </div>
            </div>

            {displayActivities.length > 0 && (
                <div className="no-scrollbar" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '4px 0',
                    flex: 1,
                    position: 'relative',
                    zIndex: 2,
                    maskImage: displayActivities.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none',
                    WebkitMaskImage: displayActivities.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none'
                }}>
                    {displayActivities.map((activity, idx) => (
                        <div key={idx} className="vynn-presence-activity" style={{
                            flexShrink: 0,
                            width: displayActivities.length === 1 ? '100%' : 'calc(100% - 40px)',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            padding: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div className="vynn-activity-content" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {activity.assets?.large_image && (
                                    <div className="vynn-activity-image-wrap" style={{ position: 'relative', flexShrink: 0 }}>
                                        <img
                                            src={getLargeImage(activity)}
                                            alt="Activity"
                                            className="vynn-activity-image"
                                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                        />
                                        {activity.assets.small_image && (
                                            <img
                                                src={`https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png`}
                                                className="vynn-activity-small-image"
                                                alt="Small asset"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '-4px',
                                                    right: '-4px',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    border: '2px solid rgba(0,0,0,0.5)',
                                                    background: '#050505'
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                                <div className="vynn-activity-details" style={{ flex: 1, minWidth: 0 }}>
                                    <div className="vynn-activity-name" style={{
                                        fontWeight: 800,
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: activity.name === 'Spotify' ? '#1DB954' : '#fff'
                                    }}>
                                        {activity.name === 'Spotify' && <FaSpotify className="vynn-activity-type-icon spotify" />}
                                        {activity.type === 0 && <FaGamepad className="vynn-activity-type-icon game" />}
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.name}</span>
                                    </div>
                                    <div className="vynn-activity-state" style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activity.details || activity.state}
                                    </div>
                                    <div className="vynn-activity-sub" style={{ fontSize: '10px', opacity: 0.4, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activity.details ? (activity.state || '') : ''}
                                    </div>
                                </div>
                            </div>

                            {activity.name === 'Spotify' && activity.timestamps && (
                                <div style={{ marginTop: '10px' }}>
                                    <SpotifyProgress timestamps={activity.timestamps} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

const SpotifyProgress = ({ timestamps }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const total = timestamps.end - timestamps.start;
            const current = now - timestamps.start;
            const percent = Math.min(100, Math.max(0, (current / total) * 100));
            setProgress(percent);
        };

        const timer = setInterval(update, 1000);
        update();
        return () => clearInterval(timer);
    }, [timestamps]);

    return (
        <div className="vynn-spotify-progress-bar">
            <div className="vynn-spotify-progress-fill" style={{ width: `${progress}%` }} />
        </div>
    );
};

export default DiscordPresence;
