import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import {
    FaGem, FaDiscord, FaRocket, FaHeart, FaStar, FaShieldAlt,
    FaCheckCircle, FaAward, FaTrophy, FaMedal, FaBug, FaFire,
    FaGlobe, FaImage, FaQuestionCircle, FaChevronUp, FaChevronDown,
    FaEye, FaEyeSlash
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../../context/DashboardContext';
import './Badges.css';

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

const Badges = () => {
    const { user: authUser } = useAuth();
    const { updateProfileData } = useDashboard();
    const [allBadges, setAllBadges] = useState([]);
    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [displayedBadgeIds, setDisplayedBadgeIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAllBadges();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profiles/@me');
            setProfile(response.data.profile);
            setUserData(response.data.user);
            setDisplayedBadgeIds(response.data.profile.displayedBadges?.map(b => (b._id || b).toString()) || []);

            // Sync LiveConfig initially
            updateProfileData({
                displayedBadges: response.data.profile.displayedBadges || [],
                entranceText: response.data.profile.entranceText,
                entranceFont: response.data.profile.entranceFont
            });
        } catch (error) {
            console.error('Failed to load profile', error);
        }
    };

    const fetchAllBadges = async () => {
        try {
            const res = await api.get('/badges');
            setAllBadges(res.data);
        } catch (error) {
            console.error('Failed to fetch badges', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDisplayedBadges = async (newBadgeIds) => {
        setSaving(true);
        try {
            setDisplayedBadgeIds(newBadgeIds);

            // OPTIMISTIC SYNC: Update global dashboard context for live preview
            const fullBadges = allBadges.filter(b => newBadgeIds.includes(b._id.toString()));
            // Sort fullBadges to match newBadgeIds order
            const orderedBadges = newBadgeIds.map(id => fullBadges.find(b => b._id.toString() === id.toString())).filter(Boolean);

            updateProfileData({ displayedBadges: orderedBadges });

            await api.put('/profiles/@me/badges', { badgeIds: newBadgeIds });
            toast.success('Display setup updated');
        } catch (error) {
            toast.error('Failed to update display');
        } finally {
            setSaving(false);
        }
    };

    const toggleBadge = (badgeId) => {
        const isDisplayed = displayedBadgeIds.includes(badgeId);
        let newIds;
        if (isDisplayed) {
            newIds = displayedBadgeIds.filter(id => id !== badgeId);
        } else {
            if (displayedBadgeIds.length >= 6) {
                toast.error('Showcase is limited to 6 badges');
                return;
            }
            newIds = [...displayedBadgeIds, badgeId];
        }
        handleUpdateDisplayedBadges(newIds);
    };

    const moveBadge = (badgeId, direction) => {
        const index = displayedBadgeIds.indexOf(badgeId);
        if (index === -1) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= displayedBadgeIds.length) return;

        const newIds = [...displayedBadgeIds];
        [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
        handleUpdateDisplayedBadges(newIds);
    };


    const isEarned = (badgeId) => {
        const currentUser = userData || authUser;
        return currentUser?.badges?.some(b => {
            const bId = (b._id || b).toString();
            return bId === badgeId.toString();
        });
    };

    const getIcon = (iconName) => {
        const Icon = iconMap[iconName] || FaAward;
        return <Icon />;
    };

    const categories = Array.from(new Set(allBadges.map(b => b.category)));

    if (loading) return (
        <div className="badges-loading">
            <FaAward className="loading-icon" />
            <span className="loading-text">Scanning Archive...</span>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 className="page-title">Citizen Dossier</h1>
                    <p className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Ecosystem Recognition & <span style={{ color: 'white', fontWeight: 'bold' }}>Achievements</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/premium" className="action-button-premium">
                        <FaRocket /> GO PRO
                    </Link>
                </div>
            </div>

            <div className="showcase-management glass-panel">
                <div className="showcase-header">
                    <div className="showcase-title-group">
                        <h3 className="showcase-title">Active Showcase</h3>
                        <span className="showcase-count">{displayedBadgeIds.length} / 6</span>
                    </div>
                    <p className="showcase-subtitle">These badges appear prominently on your public profile in this specific order.</p>
                </div>

                {displayedBadgeIds.length > 0 ? (
                    <div className="showcase-grid">
                        <AnimatePresence>
                            {displayedBadgeIds.map((id, index) => {
                                const badge = allBadges.find(b => (b._id === id || b.id === id));
                                if (!badge) return null;
                                return (
                                    <motion.div
                                        key={id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="showcase-item"
                                        style={{ borderColor: `${badge.color}40`, background: `${badge.color}10` }}
                                    >
                                        <div className="showcase-icon" style={{ color: badge.color }}>
                                            {badge.icon.startsWith('http') ? (
                                                <img src={badge.icon} alt="" />
                                            ) : getIcon(badge.icon)}
                                        </div>
                                        <div className="showcase-controls">
                                            <button disabled={index === 0} onClick={() => moveBadge(id, -1)} className="control-btn"><FaChevronUp size={10} /></button>
                                            <button disabled={index === displayedBadgeIds.length - 1} onClick={() => moveBadge(id, 1)} className="control-btn"><FaChevronDown size={10} /></button>
                                            <button onClick={() => toggleBadge(id)} className="control-btn remove"><FaEyeSlash size={10} /></button>
                                        </div>
                                        <div className="showcase-name">{badge.name}</div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="showcase-empty-state">
                        <div className="empty-state-icon">
                            <FaAward />
                        </div>
                        <div className="empty-state-text">
                            <h4>No custom showcase yet</h4>
                            <p>Your profile currently displays your first few badges by default. Start customizing below or feature your current set.</p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        const earnedIds = allBadges
                                            .filter(b => isEarned(b._id))
                                            .slice(0, 6)
                                            .map(b => b._id);
                                        if (earnedIds.length > 0) {
                                            handleUpdateDisplayedBadges(earnedIds);
                                        } else {
                                            toast.error('No earned badges to feature yet!');
                                        }
                                    }}
                                    className="action-button-outline"
                                    style={{ padding: '8px 16px', fontSize: '0.7rem' }}
                                >
                                    <FaEye /> FEATURE MY TOP BADGES
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {categories.map(cat => (
                <div key={cat} className="category-section">
                    <h3 className="category-title">
                        {cat}
                        <div className="category-line" />
                    </h3>

                    <div className="badges-grid">
                        {allBadges.filter(b => b.category === cat).map(badge => {
                            const earned = isEarned(badge._id);
                            return (
                                <motion.div
                                    key={badge._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    className={`badge-card ${earned ? 'earned' : 'locked'}`}
                                >
                                    {badge.isSystem && earned && (
                                        <div className="system-tag">Auto</div>
                                    )}

                                    <div className="badge-content">
                                        <div
                                            className="badge-icon-container"
                                            style={{
                                                background: earned ? `${badge.color}15` : 'rgba(255,255,255,0.05)',
                                                color: earned ? badge.color : 'rgba(255,255,255,0.2)',
                                                border: `1px solid ${earned ? `${badge.color}30` : 'rgba(255,255,255,0.05)'}`
                                            }}
                                        >
                                            {badge.icon.startsWith('http') ? (
                                                <img src={badge.icon} className="badge-image" alt={badge.name} style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain' }} />
                                            ) : (
                                                getIcon(badge.icon)
                                            )}
                                            {earned && (
                                                <div
                                                    className="badge-glow"
                                                    style={{ background: badge.color }}
                                                />
                                            )}
                                        </div>

                                        <div className="badge-info">
                                            <h4 className="badge-name">{badge.name}</h4>
                                            <p className="badge-description">{badge.description}</p>
                                        </div>
                                    </div>

                                    {earned && (
                                        <div className="badge-actions">
                                            <button
                                                onClick={() => toggleBadge(badge._id)}
                                                className={`display-toggle ${displayedBadgeIds.includes(badge._id) ? 'active' : ''}`}
                                            >
                                                {displayedBadgeIds.includes(badge._id) ? (
                                                    <><FaEyeSlash /> Remove from Profile</>
                                                ) : (
                                                    <><FaEye /> Show on Profile</>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {!earned && badge.isSystem && (
                                        <div className="earn-hint">
                                            <span className="earn-label">How to earn</span>
                                            <span className="earn-action">
                                                {badge.systemKey === 'premium' ? 'Go PRO' :
                                                    badge.systemKey === 'booster' ? 'Boost Discord' :
                                                        badge.systemKey === 'supporter' ? 'Support Store' :
                                                            badge.systemKey === 'early_adopter' ? 'Be in first 1000' : 'Connect Discord'}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {allBadges.length === 0 && (
                <div className="badges-empty">
                    <FaQuestionCircle className="empty-icon" />
                    <p className="empty-text">No badges available in the ecosystem yet.</p>
                </div>
            )}
        </div>
    );
};

export default Badges;
