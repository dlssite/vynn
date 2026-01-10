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

    if (loading || !presence || !presence.discord_status) return null;

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

    const game = presence.activities?.find(a => a.type === 0);
    const spotify = presence.activities?.find(a => a.type === 2);
    const customStatus = presence.activities?.find(a => a.type === 4);
    const activity = game || spotify;

    // Helper to format large images from Discord/Spotify
    const getLargeImage = (activity) => {
        if (!activity.assets?.large_image) return null;
        if (activity.assets.large_image.startsWith('mp:external')) {
            return activity.assets.large_image.replace(/mp:external\/.*\/(https?)/, '$1');
        }
        if (activity.assets.large_image.startsWith('spotify:')) {
            return `https://i.scdn.co/image/${activity.assets.large_image.replace('spotify:', '')}`;
        }
        return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`discord-presence-vynn ${mode} ${activity ? 'active-presence' : ''} ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden'
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

            <div className="vynn-presence-header" style={{ position: 'relative', zIndex: 1 }}>
                <div className="vynn-presence-avatar-wrap" style={{ position: 'relative' }}>
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={presence.discord_user.avatar ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        className="vynn-presence-avatar"
                        alt="Discord"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
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
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(presence.discord_status),
                            border: '3px solid #050505',
                            boxShadow: `0 0 10px ${getStatusColor(presence.discord_status)}`
                        }}
                    >
                        <StatusPulse color={getStatusColor(presence.discord_status)} />
                    </div>
                </div>

                <div className="vynn-presence-meta" style={{ marginLeft: '12px', flex: 1 }}>
                    <div className="vynn-presence-user" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="vynn-username" style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.02em' }}>{presence.discord_user.username}</span>
                        <FaDiscord className="vynn-discord-icon" style={{ opacity: 0.6, fontSize: '12px' }} />
                    </div>
                    <div className="vynn-presence-status-text" style={{ fontSize: '11px', opacity: 0.7, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                        {customStatus?.state || getStatusLabel(presence.discord_status)}
                    </div>
                </div>
            </div>

            {activity && (
                <div className="vynn-presence-activity" style={{ marginTop: '16px', position: 'relative', zIndex: 1 }}>
                    <div className="vynn-activity-content" style={{ display: 'flex', gap: '12px' }}>
                        {activity.assets?.large_image && (
                            <div className="vynn-activity-image-wrap" style={{ position: 'relative' }}>
                                <img
                                    src={getLargeImage(activity)}
                                    alt="Activity"
                                    className="vynn-activity-image"
                                    style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
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
                                            width: '24px',
                                            height: '24px',
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
                                fontWeight: 700,
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: activity.type === 2 ? '#1DB954' : '#fff'
                            }}>
                                {activity.type === 2 && <FaSpotify className="vynn-activity-type-icon spotify" />}
                                {activity.type === 0 && <FaGamepad className="vynn-activity-type-icon game" />}
                                <span style={{ truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{activity.name}</span>
                            </div>
                            <div className="vynn-activity-state" style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {activity.details || activity.state}
                            </div>
                            {activity.details && activity.state && (
                                <div className="vynn-activity-sub" style={{ fontSize: '11px', opacity: 0.5, marginTop: '1px' }}>{activity.state}</div>
                            )}
                        </div>
                    </div>

                    {spotify && spotify.timestamps && (
                        <SpotifyProgress timestamps={spotify.timestamps} />
                    )}
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
