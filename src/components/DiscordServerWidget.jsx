import React, { useState, useEffect } from 'react';
import { FaDiscord, FaUsers, FaArrowUp, FaGlobe } from 'react-icons/fa';
import api from '../services/api';
import { motion } from 'framer-motion';

const DiscordServerWidget = ({ serverId, mode = 'profile' }) => {
    const [server, setServer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!serverId) return;

        const fetchServer = async () => {
            try {
                const res = await api.get(`/discord/server/${serverId}`);
                if (res.data) {
                    setServer(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch Discord server info", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServer();
    }, [serverId]);

    if (loading || !server) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`discord-server-widget vynn-presence-vynn active-presence ${mode}`}
        >
            <div className="vynn-presence-header">
                <div className="vynn-presence-avatar-wrap">
                    <img
                        src={server.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        className="vynn-presence-avatar server-icon"
                        alt={server.name}
                    />
                    <div className="vynn-presence-status-dot online" />
                </div>

                <div className="vynn-presence-meta">
                    <div className="vynn-presence-user">
                        <span className="vynn-username truncate max-w-[150px]">{server.name}</span>
                        <FaDiscord className="vynn-discord-icon" />
                    </div>
                    <div className="vynn-presence-status-text">
                        OFFICIAL SERVER
                    </div>
                </div>
            </div>

            <div className="server-stats-grid mt-4 grid grid-cols-2 gap-2">
                <div className="server-stat-item">
                    <div className="stat-icon-wrap"><FaUsers /></div>
                    <div className="stat-info">
                        <div className="stat-value">{(server.memberCount || server.approximate_member_count)?.toLocaleString() || '---'}</div>
                        <div className="stat-label">MEMBERS</div>
                    </div>
                </div>
                <div className="server-stat-item">
                    <div className="stat-icon-wrap online"><FaGlobe /></div>
                    <div className="stat-info">
                        <div className="stat-value">{(server.presence_count || server.approximate_presence_count)?.toLocaleString() || '---'}</div>
                        <div className="stat-label">ONLINE</div>
                    </div>
                </div>
            </div>

            <div className="server-footer-vynn mt-4 flex items-center justify-between">
                <div className="boost-badge flex items-center gap-1.5 text-[9px] font-black text-pink-500 bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/20">
                    <FaArrowUp /> LVL {server.boostLevel || server.premium_tier || 0}
                </div>
                <a
                    href={server.instant_invite || `https://discord.gg/${serverId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="join-server-btn text-[9px] font-black uppercase tracking-widest text-[#5865F2] hover:text-white transition-colors"
                >
                    JOIN SERVER
                </a>
            </div>
        </motion.div>
    );
};

export default DiscordServerWidget;
