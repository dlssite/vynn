import React, { useState, useEffect } from 'react';
import { FaDiscord, FaUsers, FaArrowUp, FaGlobe } from 'react-icons/fa';
import api from '../services/api';
import { motion } from 'framer-motion';

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

const DiscordServerWidget = ({ serverId, mode = 'profile', onJoinServer }) => {
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

    if (loading) return (
        <div className="vynn-loader-container">
            <img src="/logo.png" className="vynn-logo-loader" alt="Loading..." />
        </div>
    );

    if (!server) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`discord-server-widget vynn-presence-vynn active-presence ${mode}`}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Subtle Discord Blue Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle at center, #5865F208 0%, transparent 50%)`,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="vynn-presence-header" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                <div className="vynn-presence-avatar-wrap" style={{ position: 'relative' }}>
                    <img
                        src={server.icon || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        className="vynn-presence-avatar server-icon"
                        alt={server.name}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            objectFit: 'cover'
                        }}
                    />
                    <div className="vynn-presence-status-dot online" style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#23a55a',
                        border: '3px solid #050505',
                        boxShadow: '0 0 10px rgba(35, 165, 90, 0.5)',
                        zIndex: 2
                    }}>
                        <StatusPulse color="#23a55a" />
                    </div>
                </div>

                <div className="vynn-presence-meta" style={{ marginLeft: '12px', flex: 1, textAlign: 'left' }}>
                    <div className="vynn-presence-user" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="vynn-username truncate" style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.01em' }}>{server.name}</span>
                        <FaDiscord className="vynn-discord-icon" style={{ opacity: 0.6, fontSize: '12px' }} />
                    </div>
                    <div className="vynn-presence-status-text" style={{ fontSize: '10px', opacity: 0.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                        OFFICIAL COMMUNITY
                    </div>
                </div>
            </div>

            <div className="server-stats-grid mt-4 grid grid-cols-2 gap-3" style={{ position: 'relative', zIndex: 1 }}>
                <div className="server-stat-item" style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div className="stat-icon-wrap" style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.4)'
                    }}><FaUsers /></div>
                    <div className="stat-info" style={{ textAlign: 'left' }}>
                        <div className="stat-value" style={{ fontWeight: 800, fontSize: '12px' }}>{(server.memberCount || server.approximate_member_count)?.toLocaleString() || '---'}</div>
                        <div className="stat-label" style={{ fontSize: '8px', opacity: 0.3, fontWeight: 700, letterSpacing: '0.05em' }}>MEMBERS</div>
                    </div>
                </div>
                <div className="server-stat-item" style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div className="stat-icon-wrap online" style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(35, 165, 90, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#23a55a'
                    }}><FaGlobe /></div>
                    <div className="stat-info" style={{ textAlign: 'left' }}>
                        <div className="stat-value" style={{ fontWeight: 800, fontSize: '12px' }}>{(server.presence_count || server.approximate_presence_count)?.toLocaleString() || '---'}</div>
                        <div className="stat-label" style={{ fontSize: '8px', opacity: 0.3, fontWeight: 700, letterSpacing: '0.05em' }}>ONLINE</div>
                    </div>
                </div>
            </div>

            <div className="server-footer-vynn mt-6 flex items-center justify-between" style={{ position: 'relative', zIndex: 1, paddingTop: '4px' }}>
                <div className="boost-badge" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '9px',
                    fontWeight: 900,
                    color: '#ff73fa',
                    background: 'rgba(255, 115, 250, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 115, 250, 0.15)',
                    letterSpacing: '0.05em'
                }}>
                    <FaArrowUp style={{ fontSize: '7px' }} /> LVL {server.boostLevel || server.premium_tier || 0}
                </div>
                <motion.a
                    whileHover={{ scale: 1.02, background: 'rgba(88, 101, 242, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    href={server.instant_invite || `https://discord.gg/${serverId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="join-server-btn"
                    onClick={() => onJoinServer && onJoinServer(serverId, server.instant_invite || `https://discord.gg/${serverId}`, 'discord_server')}
                    style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#fff',
                        background: 'rgba(88, 101, 242, 0.25)',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(88, 101, 242, 0.4)',
                        letterSpacing: '0.08em',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    JOIN SERVER
                </motion.a>
            </div>
        </motion.div>
    );
};

export default DiscordServerWidget;
