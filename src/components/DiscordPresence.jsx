import React, { useState, useEffect } from 'react';
import { FaDiscord, FaSpotify, FaGamepad, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DiscordPresence - A premium, portable component to display Discord live status.
 * Supports 'card' (standard), 'mini' (compact), and 'profile' (integrated) modes.
 */
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
        >
            <div className="vynn-presence-header">
                <div className="vynn-presence-avatar-wrap">
                    <img
                        src={presence.discord_user.avatar ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        className="vynn-presence-avatar"
                        alt="Discord"
                    />
                    <div
                        className="vynn-presence-status-dot"
                        style={{ backgroundColor: getStatusColor(presence.discord_status) }}
                    />
                </div>

                <div className="vynn-presence-meta">
                    <div className="vynn-presence-user">
                        <span className="vynn-username">{presence.discord_user.username}</span>
                        <FaDiscord className="vynn-discord-icon" />
                    </div>
                    <div className="vynn-presence-status-text">
                        {customStatus?.state || getStatusLabel(presence.discord_status)}
                    </div>
                </div>
            </div>

            {activity && (
                <div className="vynn-presence-activity">
                    <div className="vynn-activity-content">
                        {activity.assets?.large_image && (
                            <div className="vynn-activity-image-wrap">
                                <img src={getLargeImage(activity)} alt="Activity" className="vynn-activity-image" />
                                {activity.assets.small_image && (
                                    <img
                                        src={`https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png`}
                                        className="vynn-activity-small-image"
                                        alt="Small asset"
                                    />
                                )}
                            </div>
                        )}
                        <div className="vynn-activity-details">
                            <div className="vynn-activity-name">
                                {activity.type === 2 && <FaSpotify className="vynn-activity-type-icon spotify" />}
                                {activity.type === 0 && <FaGamepad className="vynn-activity-type-icon game" />}
                                {activity.name}
                            </div>
                            <div className="vynn-activity-state">{activity.details || activity.state}</div>
                            {activity.details && activity.state && (
                                <div className="vynn-activity-sub">{activity.state}</div>
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
