import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import {
    FaGem, FaDiscord, FaRocket, FaHeart, FaStar, FaShieldAlt,
    FaCheckCircle, FaAward, FaTrophy, FaMedal, FaBug, FaFire,
    FaGlobe, FaImage, FaQuestionCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
    const { user } = useAuth();
    const [allBadges, setAllBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllBadges();
    }, []);

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


    const isEarned = (badgeId) => {
        return user?.badges?.some(b => b === badgeId || b._id === badgeId);
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
