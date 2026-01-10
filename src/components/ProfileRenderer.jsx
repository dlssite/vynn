import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaDiscord, FaTwitter, FaInstagram, FaYoutube, FaTwitch,
    FaSpotify, FaGithub, FaTiktok, FaSteam, FaLink, FaEye,
    FaExclamationTriangle, FaCheckCircle, FaGem, FaRocket, FaHeart, FaShieldAlt, FaStar, FaAward, FaTrophy, FaMedal, FaBug, FaFire, FaGlobe, FaImage,
    FaVolumeUp, FaVolumeMute
} from 'react-icons/fa';
import api from '../services/api';
import DiscordPresence from './DiscordPresence';
import DiscordServerWidget from './DiscordServerWidget';
import '../pages/Profile.css';

const iconMap = {
    'FaGem': FaGem,
    'FaDiscord': FaDiscord,
    'FaRocket': FaRocket,
    'FaHeart': FaHeart,
    'FaStar': FaStar,
    'FaShieldAlt': FaShieldAlt,
    'FaCheckCircle': FaCheckCircle,
    'FaAward': FaAward,
    'FaTrophy': FaTrophy,
    'FaMedal': FaMedal,
    'FaBug': FaBug,
    'FaFire': FaFire,
    'FaGlobe': FaGlobe,
    'FaImage': FaImage
};

const socialIcons = {
    discord: FaDiscord,
    twitter: FaTwitter,
    instagram: FaInstagram,
    youtube: FaYoutube,
    twitch: FaTwitch,
    spotify: FaSpotify,
    github: FaGithub,
    tiktok: FaTiktok,
    steam: FaSteam,
    other: FaLink
};

const hexToRgb = (hex) => {
    if (!hex) return '0, 0, 0';
    if (hex.startsWith('rgba')) {
        const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return match ? `${match[1]}, ${match[2]}, ${match[3]}` : '0, 0, 0';
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '0, 0, 0';
};

const ProfileRenderer = ({ data, trackClick, isEntered = false, previewMode = false, initialMuted = false }) => {
    const { user, profile } = data || {};
    const [audioMuted, setAudioMuted] = useState(initialMuted);
    const audioRef = React.useRef(null);
    const theme = profile?.themeConfig || {};
    const colors = theme?.colors || {};
    const background = theme?.background || {};
    const effects = theme?.effects || {};
    const layout = theme?.layout || {};

    useEffect(() => {
        setAudioMuted(initialMuted);
    }, [initialMuted]);

    useEffect(() => {
        if (isEntered && audioRef.current && theme.audio?.url) {
            const audio = audioRef.current;

            const attemptPlay = () => {
                setAudioMuted(false);
                audio.muted = false; // Immediate DOM update
                audio.volume = 0.5;
                audio.play().catch(e => {
                    console.warn("Autoplay attempt failed:", e);
                });
            };

            // Force interaction context
            attemptPlay();

            // Backup click listener
            const forcePlay = () => {
                if (audio.paused) attemptPlay();
                document.removeEventListener('click', forcePlay);
            };
            document.addEventListener('click', forcePlay);

            return () => document.removeEventListener('click', forcePlay);
        }
    }, [isEntered, theme.audio?.url]);

    if (!user || !profile) return null;

    // Construct dynamic styles
    const containerStyle = {
        '--profile-primary': colors.primary || '#FF4500',
        '--profile-secondary': colors.secondary || '#ffffff',
        '--profile-accent': colors.accent || '#FF8C00',
        '--profile-bg': colors.background || '#050505',
        '--profile-text': colors.text || '#ffffff',
        '--card-bg-raw': hexToRgb(colors.cardBackground || 'rgba(0, 0, 0, 0.5)'),
        '--card-bg-raw-2': hexToRgb(colors.cardBackground2 || colors.cardBackground || 'rgba(0, 0, 0, 0.5)'),
        '--card-bg-opacity': `rgba(var(--card-bg-raw), ${theme.appearance?.profileOpacity ?? 0.5})`,
        '--card-bg-opacity-2': `rgba(var(--card-bg-raw-2), ${theme.appearance?.profileOpacity ?? 0.5})`,
        '--card-bg-final': (colors.cardBackground2 && colors.cardBackground2 !== colors.cardBackground)
            ? `linear-gradient(to bottom right, var(--card-bg-opacity), var(--card-bg-opacity-2))`
            : `var(--card-bg-opacity)`,
        '--profile-blur': `${theme.appearance?.profileBlur ?? 0}px`,
        '--border-radius': `${layout.borderRadius ?? 32}px`,
        '--border-width': `${layout.borderWidth ?? 1}px`,
        '--border-color-1': layout.borderColor || 'rgba(255,255,255,0.05)',
        '--border-color-2': layout.borderColor2 || layout.borderColor || 'rgba(255,255,255,0.05)',
        minHeight: previewMode ? '100%' : '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
        color: 'var(--profile-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        cursor: theme.cursorUrl ? `url("${theme.cursorUrl}"), auto` : 'default'
    };

    // Background Media
    const renderBackground = () => {
        const bgStyle = {
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundColor: colors.background || '#050505'
        };

        if (background.type === 'image' && background.url) {
            return (
                <div style={bgStyle}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url("${background.url}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: `blur(${background.blur || 0}px)`,
                        opacity: background.opacity ?? 1,
                        zIndex: -1
                    }} />
                </div>
            );
        }

        if (background.type === 'video' && background.url) {
            return (
                <div style={bgStyle}>
                    <video
                        src={background.url}
                        autoPlay
                        loop
                        muted={background.isMuted ?? true}
                        playsInline
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            filter: `blur(${background.blur || 0}px)`,
                            opacity: background.opacity ?? 1,
                            zIndex: -1
                        }}
                    />
                </div>
            );
        }

        return <div style={bgStyle} />;
    };

    // Audio Player
    const renderAudio = () => {
        if (!theme.audio?.url) return null;
        return (
            <>
                <audio
                    ref={audioRef}
                    src={theme.audio.url}
                    loop
                    preload="auto"
                    autoPlay={isEntered}
                    muted={audioMuted}
                    onCanPlay={() => {
                        if (isEntered && audioRef.current) {
                            audioRef.current.play().catch(() => { });
                        }
                    }}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />

                {/* Audio Control Pin */}
                <button
                    onClick={() => setAudioMuted(!audioMuted)}
                    className="audio-toggle-pin"
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        left: '24px',
                        zIndex: 100,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: audioMuted ? '#666' : 'var(--profile-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    {audioMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
            </>
        );
    };

    // Effects Overlays
    const renderEffects = () => {
        const bgEffect = theme.effects?.background || 'none';
        return (
            <>
                {bgEffect === 'scanlines' && <div className="effect-scanlines" />}
                {bgEffect === 'vhs' && <div className="effect-vhs" />}
                {bgEffect === 'rain' && <div className="effect-rain" />}
                {bgEffect === 'snow' && <div className="effect-snow" />}
            </>
        );
    };

    return (
        <div style={containerStyle} className="profile-renderer">
            {theme.cursorUrl && (
                <style>{`
                    .profile-renderer, .profile-renderer * {
                        cursor: url("${theme.cursorUrl.includes('cloudinary')
                        ? theme.cursorUrl.replace('/upload/', '/upload/w_32,h_32,c_fill,f_png/')
                        : theme.cursorUrl}"), auto !important;
                    }
                `}</style>
            )}
            {renderBackground()}
            {renderEffects()}
            {renderAudio()}

            <div className="profile-content" style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                {/* Profile Card */}
                <div
                    className={`profile-card prism-glass ${theme.glowSettings?.badges ? 'glow-badges' : ''} ${theme.glowSettings?.avatar ? 'glow-avatar-card' : ''}`}
                    style={{
                        position: 'relative',
                        background: 'var(--card-bg-final)',
                        backdropFilter: `blur(var(--profile-blur))`,
                        borderRadius: 'var(--border-radius)',
                        padding: '32px 24px',
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Gradient Border Overlay */}
                    {layout.borderWidth > 0 && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            padding: 'var(--border-width)',
                            borderRadius: 'inherit',
                            background: 'linear-gradient(to bottom right, var(--border-color-1), var(--border-color-2))',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            pointerEvents: 'none',
                            zIndex: 10
                        }} />
                    )}

                    {/* Views Redesign */}
                    {profile.views !== undefined && profile.showViewCount !== false && (
                        <div className="profile-view-counter">
                            <FaEye />
                            <span className="count-value">{profile.views.toLocaleString()}</span>
                        </div>
                    )}
                    {/* Avatar */}
                    <div style={{ marginBottom: '20px', position: 'relative', display: 'inline-block' }}>
                        {/* Custom Frame Rendering */}
                        {profile.frame && (
                            <div className="avatar-frame" style={{
                                position: 'absolute', inset: '-25%', pointerEvents: 'none', zIndex: 4,
                                backgroundImage: `url("${typeof profile.frame === 'string' ? profile.frame : profile.frame.imageUrl}")`,
                                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                                border: 'none'
                            }} />
                        )}

                        {/* Discord Avatar Decoration (Frame) */}
                        {user.discord?.decoration && (
                            <div className="avatar-decoration" style={{
                                position: 'absolute', inset: '-17%', pointerEvents: 'none', zIndex: 3,
                                backgroundImage: `url("https://cdn.discordapp.com/avatar-decoration-presets/${user.discord.decoration}.png")`,
                                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'
                            }} />
                        )}

                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            border: (profile.frame || user.discord?.decoration) ? 'none' : '3px solid var(--profile-primary)', overflow: 'hidden',
                            margin: '0 auto', background: '#000', position: 'relative', zIndex: 1,
                            boxShadow: theme.glowSettings?.avatar ? `0 0 30px var(--profile-primary)` : 'none'
                        }}>
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        {user.isVerified && (
                            <FaCheckCircle style={{
                                position: 'absolute', bottom: '5px', right: '5px',
                                color: 'var(--profile-primary)', fontSize: '24px',
                                background: '#000', borderRadius: '50%', border: '2px solid #000',
                                zIndex: 3
                            }} />
                        )}
                    </div>

                    {/* Identity */}
                    <h1
                        className={`profile-name ${theme.glowSettings?.username ? 'glow-username' : ''} name-effect-${theme.effects?.username || 'none'}`}
                        style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px', lineHeight: 1.2 }}
                    >
                        {user.displayName || user.username}
                    </h1>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>@{user.username}</span>
                            {user.level > 1 && (
                                <span style={{
                                    padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)',
                                    fontSize: '0.7rem', fontWeight: 'bold'
                                }}>
                                    LVL {user.level}
                                </span>
                            )}
                        </div>

                        {/* Badges Container */}
                        {((profile.displayedBadges && profile.displayedBadges.length > 0) || (user.badges && user.badges.length > 0)) && (
                            <div style={{
                                display: 'flex', flexWrap: 'wrap',
                                justifyContent: 'center', gap: '6px',
                                marginTop: '4px', maxWidth: '300px'
                            }}>
                                {(profile.displayedBadges && profile.displayedBadges.length > 0
                                    ? profile.displayedBadges
                                    : user.badges.slice(0, 6)
                                ).map((badge, i) => {
                                    const IconComponent = socialIcons[badge.icon.toLowerCase()] || iconMap[badge.icon] || FaGem;
                                    return (
                                        <div
                                            key={i}
                                            className={`profile-badge ${theme.glowSettings?.badges ? 'glow-badge' : ''}`}
                                            title={badge.name}
                                            style={{
                                                width: '22px', height: '22px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                filter: theme.glowSettings?.badges ? `drop-shadow(0 0 5px ${badge.color})` : 'none'
                                            }}
                                        >
                                            {badge.icon && badge.icon.startsWith('http') ? (
                                                <img src={badge.icon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={badge.name} />
                                            ) : (
                                                <IconComponent style={{ fontSize: '16px', color: badge.color }} />
                                            )}
                                        </div>
                                    );
                                })}
                                {(!profile.displayedBadges || profile.displayedBadges.length === 0) && user.badges.length > 6 && (
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 900, opacity: 0.5,
                                        padding: '0 4px', background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                                        height: '22px'
                                    }}>
                                        +{user.badges.length - 6}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                            {profile.bio}
                        </p>
                    )}


                    {/* Socials Row */}
                    <div
                        className={`socials-row ${theme.glowSettings?.socials ? 'glow-socials' : ''}`}
                        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}
                    >
                        {profile.socials.map((social, i) => {
                            const Icon = socialIcons[social.platform] || FaLink;
                            return (
                                <a
                                    key={i} href={social.url} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        fontSize: '1.5rem', color: 'var(--profile-text)',
                                        transition: 'transform 0.2s, color 0.2s'
                                    }}
                                    className="hover:text-[var(--profile-primary)] hover:scale-110"
                                    onClick={() => trackClick && trackClick(social._id, social.url, 'social')}
                                >
                                    <Icon />
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* Links Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {profile.links && profile.links.map((link, i) => (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                background: 'var(--card-bg)',
                                backdropFilter: 'blur(12px)',
                                border: 'var(--border-width) solid var(--border-color)',
                                borderRadius: 'var(--border-radius)',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s',
                                textDecoration: 'none',
                                color: 'var(--profile-text)'
                            }}
                            className="profile-link-hover"
                            onClick={() => trackClick && trackClick(link._id, link.url, 'link')}
                        >
                            <span style={{ fontWeight: 600 }}>{link.title}</span>
                            <FaLink style={{ opacity: 0.5 }} />
                        </a>
                    ))}
                </div>

                {/* Discord Protocol: Absolute Restoration Logic */}
                {theme.presence?.discord && (
                    <div className="discord-protocol-reveal">
                        {theme.presence?.type === 'server' && theme.presence?.serverId ? (
                            <DiscordServerWidget
                                serverId={theme.presence.serverId}
                                onJoinServer={trackClick}
                            />
                        ) : user.discord ? (
                            <DiscordPresence username={user.username} id={user.discord.id} mode="profile" />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Footer - Fixed Bottom (Public Only) */}
            {!previewMode && (
                <div style={{ position: 'fixed', bottom: '24px', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                    <Link
                        to="/login"
                        style={{
                            pointerEvents: 'auto',
                            textDecoration: 'none',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '10px 24px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: 'white',
                            fontSize: '0.9rem', fontWeight: 600,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                            e.currentTarget.style.borderColor = 'var(--profile-primary)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        <FaRocket style={{ color: 'var(--profile-primary)' }} />
                        <span>Claim your Vynn</span>
                    </Link>
                </div>
            )}

            {/* CSS for hover effects that are hard to do inline */}
            <style>{`
                .profile-link-hover:hover {
                    background: var(--profile-primary) !important;
                    border-color: var(--profile-primary) !important;
                    transform: translateY(-2px);
                    color: #fff !important;
                }
                .effect-scanlines {
                    position: absolute; inset: 0; pointer-events: none; z-index: 5;
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                    animation: scanlines 1s linear infinite;
                }
                .effect-noise {
                    position: absolute; inset: 0; pointer-events: none; z-index: 4;
                    opacity: 0.05;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    );
};

export default ProfileRenderer;
