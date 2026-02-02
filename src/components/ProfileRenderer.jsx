import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaDiscord, FaTwitter, FaInstagram, FaYoutube, FaTwitch,
    FaSpotify, FaGithub, FaTiktok, FaSteam, FaLink, FaEye,
    FaExclamationTriangle, FaCheckCircle, FaGem, FaRocket, FaHeart, FaShieldAlt, FaStar, FaAward, FaTrophy, FaMedal, FaBug, FaFire, FaGlobe, FaImage,
    FaVolumeUp, FaVolumeMute, FaExternalLinkAlt, FaChevronRight, FaArrowRight, FaLayerGroup, FaBolt, FaDoorOpen
} from 'react-icons/fa';
import api from '../services/api';
import DiscordPresence from './DiscordPresence';
import DiscordServerWidget from './DiscordServerWidget';
import ServerCard from './dashboard/ServerCard';
import './ProfileRenderer.css';

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

const ProfileRenderer = ({ data, trackClick, isEntered = false, previewMode = false, initialMuted = false, forceMobile = false }) => {
    if (!data || !data.profile) return null;
    const { user, profile } = data;
    const [audioMuted, setAudioMuted] = useState(initialMuted);
    const [activeLinkTab, setActiveLinkTab] = useState('links');
    const [activePresenceTab, setActivePresenceTab] = useState('presence');
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
                audio.muted = false;
                audio.volume = 0.5;
                audio.play().catch(e => {
                    console.warn("Autoplay attempt failed:", e);
                });
            };

            attemptPlay();

            const forcePlay = () => {
                if (audio.paused) attemptPlay();
                document.removeEventListener('click', forcePlay);
            };
            document.addEventListener('click', forcePlay);

            return () => document.removeEventListener('click', forcePlay);
        }
    }, [isEntered, theme.audio?.url]);

    if (!user || !profile) return null;

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

    const socialsList = profile.socials || [];
    const standardLinks = profile.links || [];
    const hasAnyLinks = socialsList.length > 0 || standardLinks.length > 0;

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

            <div className={`profile-grid-wrapper ${forceMobile ? 'force-mobile' : ''}`} style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '1280px',
                display: 'grid',
                gap: '10px',
                padding: '0 20px'
            }}>
                {/* Column 1: Identity Card */}
                <div className="profile-column-identity" style={{ minWidth: 0 }}>
                    <div
                        className={`profile-card prism-glass ${theme.glowSettings?.badges ? 'glow-badges' : ''} ${theme.glowSettings?.avatar ? 'glow-avatar-card' : ''}`}
                        style={{
                            position: 'relative',
                            background: 'var(--card-bg-final)',
                            backdropFilter: `blur(var(--profile-blur))`,
                            borderRadius: 'var(--border-radius)',
                            padding: '24px 20px',
                            textAlign: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                            height: 'fit-content'
                        }}
                    >
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

                        {profile.views !== undefined && profile.showViewCount !== false && (
                            <div className="profile-view-counter">
                                <FaEye />
                                <span className="count-value">{profile.views.toLocaleString()}</span>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px', position: 'relative', display: 'inline-block' }}>
                            {profile.frame && (
                                <div className="avatar-frame" style={{
                                    position: 'absolute', inset: '-12%', pointerEvents: 'none', zIndex: 4,
                                    backgroundImage: `url("${typeof profile.frame === 'string' ? profile.frame : profile.frame.imageUrl}")`,
                                    backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                                    border: 'none'
                                }} />
                            )}

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

                        <h1
                            className={`profile-name ${theme.glowSettings?.username ? 'glow-username' : ''} name-effect-${theme.effects?.username || 'none'}`}
                            style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2px', lineHeight: 1.2 }}
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

                        {profile.bio && (
                            <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                                {profile.bio}
                            </p>
                        )}

                        {/* Socials Row consolidated into Links Column */}
                    </div>
                </div>

                <div className="profile-column-links" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    minWidth: 0,
                    width: '100%'
                }}>
                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '4px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '4px'
                    }}>
                        <button
                            onClick={() => setActiveLinkTab('links')}
                            className={`content-tab-btn ${activeLinkTab === 'links' ? 'active' : ''}`}
                        >
                            Links
                        </button>
                        <button
                            onClick={() => setActiveLinkTab('socials')}
                            className={`content-tab-btn ${activeLinkTab === 'socials' ? 'active' : ''}`}
                        >
                            Socials
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="link-tabs-content" style={{ position: 'relative', width: '100%' }}>
                        {activeLinkTab === 'links' ? (
                            <div className="horizontal-scroll-links" style={{
                                display: 'flex',
                                gap: '16px',
                                overflowX: 'auto',
                                padding: '4px 0',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                justifyContent: 'flex-start',
                                maskImage: standardLinks.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none',
                                WebkitMaskImage: standardLinks.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none'
                            }}>
                                {standardLinks.length > 0 ? (
                                    standardLinks.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flexShrink: 0,
                                                width: standardLinks.length === 1 ? '100%' : 'calc(100% - 60px)',
                                                height: '72px',
                                                background: 'var(--card-bg-final)',
                                                backdropFilter: 'blur(12px)',
                                                border: 'var(--border-width) solid var(--border-color-1)',
                                                borderRadius: '16px',
                                                padding: '0 20px',
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                gap: '12px',
                                                transition: 'all 0.3s',
                                                textDecoration: 'none',
                                                color: 'var(--profile-text)',
                                                maxWidth: '420px'
                                            }}
                                            className="profile-link-card-hover"
                                            onClick={() => trackClick && trackClick(link._id, link.url, 'link')}
                                        >
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.1rem', opacity: 0.8, flexShrink: 0
                                            }}>
                                                <FaLink />
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {link.title}
                                            </span>
                                        </a>
                                    ))
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5, width: '100%' }}>
                                        No links added yet.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="horizontal-scroll-socials" style={{
                                display: 'flex',
                                gap: '16px',
                                overflowX: 'auto',
                                padding: '4px 0',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                justifyContent: 'flex-start',
                                maskImage: socialsList.length > 1 ? 'linear-gradient(to right, black 90%, transparent)' : 'none',
                                WebkitMaskImage: socialsList.length > 1 ? 'linear-gradient(to right, black 90%, transparent)' : 'none'
                            }}>
                                {socialsList.length > 0 ? (
                                    socialsList.map((social, i) => {
                                        const Icon = socialIcons[social.platform] || FaLink;
                                        return (
                                            <a
                                                key={i}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-icon-card"
                                                style={{
                                                    flexShrink: 0,
                                                    width: socialsList.length === 1 ? '100%' : 'calc(100% - 60px)',
                                                    height: '72px',
                                                    background: 'var(--card-bg-final)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: 'var(--border-width) solid var(--border-color-1)',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                    padding: '0 20px',
                                                    gap: '12px',
                                                    fontSize: '1.2rem',
                                                    color: 'var(--profile-text)',
                                                    transition: 'all 0.3s',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    maxWidth: '420px'
                                                }}
                                                onClick={() => trackClick && trackClick(social._id, social.url, 'social')}
                                            >
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Icon />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                                    {social.platform}
                                                </span>
                                            </a>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5, width: '100%' }}>
                                        No socials added yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-column-presence" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    {/* Presence Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '4px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '4px'
                    }}>
                        <button
                            onClick={() => setActivePresenceTab('presence')}
                            className={`content-tab-btn ${activePresenceTab === 'presence' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                        >
                            <FaBolt size={10} style={{ marginRight: '6px' }} />
                            Presence
                        </button>
                        <button
                            onClick={() => setActivePresenceTab('origin')}
                            className={`content-tab-btn ${activePresenceTab === 'origin' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                        >
                            <FaDoorOpen size={10} style={{ marginRight: '6px' }} />
                            Origin
                        </button>
                        <button
                            onClick={() => setActivePresenceTab('network')}
                            className={`content-tab-btn ${activePresenceTab === 'network' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                        >
                            <FaLayerGroup size={10} style={{ marginRight: '6px' }} />
                            Network
                        </button>
                    </div>

                    <div style={{ flex: 1, minHeight: 0 }}>
                        {activePresenceTab === 'presence' && (
                            <div className="discord-protocol-reveal" style={{ height: '100%' }}>
                                {user.discord ? (
                                    <div style={{
                                        background: 'var(--card-bg-final)',
                                        backdropFilter: `blur(var(--profile-blur))`,
                                        borderRadius: '12px',
                                        border: 'var(--border-width) solid var(--border-color)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        padding: '12px 12px'
                                    }}>
                                        <DiscordPresence username={user.username} id={user.discord.id} mode="profile" />
                                    </div>
                                ) : (
                                    <div style={{
                                        height: '100%',
                                        background: 'var(--card-bg-opacity)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '12px',
                                        border: 'var(--border-width) solid var(--border-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '32px'
                                    }}>
                                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                            <FaDiscord size={32} style={{ marginBottom: '12px' }} />
                                            <p>No Discord Linked</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activePresenceTab === 'origin' && (
                            <div className="server-tab-content no-scrollbar" style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '12px',
                                overflowX: 'auto',
                                padding: '4px 0',
                                height: '100%',
                                maskImage: profile.ownedServers?.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none',
                                WebkitMaskImage: profile.ownedServers?.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none'
                            }}>
                                {profile.ownedServers?.length > 0 ? (
                                    profile.ownedServers.map((server, i) => (
                                        <div key={i} style={{
                                            flexShrink: 0,
                                            width: profile.ownedServers.length === 1 ? '100%' : 'calc(100% - 60px)',
                                            maxWidth: '420px'
                                        }}>
                                            <ServerCard server={server} compact />
                                        </div>
                                    ))
                                ) : (
                                    <div style={{
                                        height: '100%',
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '40px', border: '1px dashed rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ textAlign: 'center', opacity: 0.4 }}>
                                            <FaDoorOpen size={24} style={{ marginBottom: '12px' }} />
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>NO ORIGIN NODES</p>
                                            <p style={{ fontSize: '0.7rem', marginTop: '4px' }}>No owned servers found.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activePresenceTab === 'network' && (
                            <div className="server-tab-content no-scrollbar" style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '12px',
                                overflowX: 'auto',
                                padding: '4px 0',
                                height: '100%',
                                maskImage: profile.networkServers?.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none',
                                WebkitMaskImage: profile.networkServers?.length > 1 ? 'linear-gradient(to right, black 85%, transparent)' : 'none'
                            }}>
                                {profile.networkServers?.length > 0 ? (
                                    profile.networkServers.map((server, i) => (
                                        <div key={i} style={{
                                            flexShrink: 0,
                                            width: profile.networkServers.length === 1 ? '100%' : 'calc(100% - 60px)',
                                            maxWidth: '420px'
                                        }}>
                                            <DiscordServerWidget
                                                serverId={server.guildId || server._id}
                                                onJoinServer={trackClick}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div style={{
                                        height: '100%',
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '40px', border: '1px dashed rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ textAlign: 'center', opacity: 0.4 }}>
                                            <FaLayerGroup size={24} style={{ marginBottom: '12px' }} />
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>NO NETWORK NODES</p>
                                            <p style={{ fontSize: '0.7rem', marginTop: '4px' }}>No linked servers found.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {
                !previewMode && (
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
                        >
                            <FaRocket style={{ color: 'var(--profile-primary)' }} />
                            <span>Claim your Vynn</span>
                        </Link>
                    </div>
                )
            }

            <style>{`
                .profile-link-card-hover:hover {
                    background: var(--profile-primary) !important;
                    border-color: var(--profile-primary) !important;
                    color: #fff !important;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
                }
                .profile-link-card-hover:hover div {
                    background: rgba(255,255,255,0.2) !important;
                    color: #fff !important;
                }
                .social-icon-card:hover {
                    background: var(--profile-primary) !important;
                    border-color: var(--profile-primary) !important;
                    color: #fff !important;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
                }
                .social-icon-card:hover span {
                    color: #fff !important;
                    opacity: 1 !important;
                }
                .horizontal-scroll-links::-webkit-scrollbar,
                .horizontal-scroll-socials::-webkit-scrollbar,
                .server-tab-content::-webkit-scrollbar {
                    display: none;
                }
                .content-tab-btn {
                    flex: 1;
                    padding: 10px 12px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                }
                .content-tab-btn.active {
                    background: var(--profile-primary);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .content-tab-btn:not(.active):hover {
                    background: rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.8);
                }
                .effect-scanlines {
                    position: absolute; inset: 0; pointer-events: none; z-index: 5;
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                    animation: scanlines 1s linear infinite;
                }
           `}</style>
        </div >
    );
};

export default ProfileRenderer;
