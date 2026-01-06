import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaBolt, FaExternalLinkAlt, FaDiscord } from 'react-icons/fa';
import './ForgeModal.css';

/**
 * ForgeModal - Specialized asset selector for the Aesthetic Forge.
 * Handles both local file uploads and remote link integration.
 */
const ForgeModal = ({
    isOpen,
    onClose,
    data,
    setData,
    onUpload,
    onSubmit,
    uploading,
    stats,
    discordAssets = []
}) => {
    const [assetName, setAssetName] = useState('');
    const internalFileRef = useRef(null);
    const modalRef = useRef(null);

    // Handle background click to close
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    // Filter discord assets relevant to current section
    const relevantDiscordAssets = discordAssets.filter(asset => {
        if (data.section === 'background') return asset.type === 'banner' || asset.type === 'avatar';
        if (data.section === 'avatar') return asset.type === 'avatar' || asset.type === 'decoration';
        return false;
    });

    const handleSelectDiscordAsset = (url) => {
        setData({ ...data, link: url });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="forge-modal-overlay" onClick={handleBackdropClick}>
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.98, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: -20 }}
                        className="forge-modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Hidden Internal Input */}
                        <input
                            type="file"
                            ref={internalFileRef}
                            onChange={(e) => {
                                onUpload(e.target.files[0], assetName);
                                setAssetName(''); // Reset after upload
                            }}
                            className="hidden-file-input"
                            style={{ display: 'none' }}
                            accept="image/*,video/*,audio/*"
                        />

                        <div className="forge-modal-glow" />

                        <div className="forge-modal-content">
                            {/* Header Section */}
                            <div className="forge-modal-header">
                                <div className="forge-status-badge">
                                    <div className="status-dot" />
                                    <span className="status-text">Asset Integration</span>
                                </div>

                                <div className="forge-vault-stats">
                                    <div className="vault-label">Vault Space</div>
                                    <div className="vault-meter-pill">
                                        <div className="vault-meter-bar">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(stats?.uploadCount / stats?.limit) * 100}%` }}
                                                className="vault-meter-fill"
                                            />
                                        </div>
                                        <span className="vault-count">{stats?.uploadCount}/{stats?.limit}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className="forge-modal-title-area">
                                <h2 className="forge-modal-title">
                                    Forge {data.label} <FaBolt style={{ color: '#FF4500' }} />
                                </h2>
                                <p className="forge-modal-subtitle">
                                    Choose your entry vector to sync this asset into your identity shell.
                                </p>
                            </div>

                            {/* Action Container */}
                            <div className="forge-action-grid">
                                {relevantDiscordAssets.length > 0 && (
                                    <div className="discord-assets-section">
                                        <div className="discord-section-label">
                                            <FaDiscord className="discord-icon" /> DISCORD PROTOCOL SYNC
                                        </div>
                                        <div className="discord-assets-grid">
                                            {relevantDiscordAssets.map((asset, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSelectDiscordAsset(asset.url)}
                                                    className={`discord-asset-tile ${data.link === asset.url ? 'active' : ''}`}
                                                >
                                                    <div className="asset-preview">
                                                        <img src={asset.url} alt={asset.name} />
                                                    </div>
                                                    <div className="asset-label">{asset.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Name Input Area */}
                                <div className="forge-interaction-area" style={{ marginBottom: '20px' }}>
                                    <div className="forge-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Asset Name (e.g. My Favorite Beat)"
                                            className="forge-input"
                                            value={assetName}
                                            onChange={(e) => setAssetName(e.target.value)}
                                        />
                                        <div className="input-icon" style={{ fontSize: '10px', opacity: 0.5 }}>NAME</div>
                                    </div>
                                </div>

                                {/* Device Upload Tile */}
                                <button
                                    disabled={uploading || (stats?.uploadCount >= stats?.limit)}
                                    onClick={() => internalFileRef.current?.click()}
                                    className="forge-upload-tile"
                                >
                                    <div className="tile-accent-blur" />
                                    <div className="tile-content">
                                        <div className="tile-info">
                                            <div className="tile-icon-wrapper">
                                                <FaUpload />
                                            </div>
                                            <div>
                                                <div className="tile-label">Forge Binary</div>
                                                <div className="tile-desc">Upload from local device storage</div>
                                            </div>
                                        </div>
                                        {stats?.uploadCount >= stats?.limit && (
                                            <div className="limit-badge">Limit Hit</div>
                                        )}
                                    </div>
                                </button>

                                {/* Separator */}
                                <div className="forge-separator">
                                    <div className="separator-line">••••••••••••••••••••••••••••••••••••••••••••</div>
                                    <div className="separator-text">OR PROTOCOL LINK</div>
                                </div>

                                {/* Link Interaction Area */}
                                <div className="forge-interaction-area">
                                    <div className="forge-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Enter source blueprint URL..."
                                            className="forge-input"
                                            value={data.link}
                                            onChange={(e) => setData({ ...data, link: e.target.value })}
                                        />
                                        <FaExternalLinkAlt className="input-icon" />
                                    </div>

                                    <div className="forge-button-group">
                                        <button
                                            onClick={onClose}
                                            className="forge-btn forge-btn-cancel"
                                        >
                                            Cancel Sync
                                        </button>
                                        <button
                                            onClick={onSubmit}
                                            disabled={!data.link || uploading}
                                            className="forge-btn forge-btn-submit"
                                        >
                                            Engage Link Bridge
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Syncing State Overlay */}
                        {uploading && (
                            <div className="forge-sync-overlay">
                                <div className="sync-loader-wrapper">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="sync-circle"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="sync-icon"
                                    >
                                        <FaBolt />
                                    </motion.div>
                                </div>
                                <div className="sync-text">Syncing Binary...</div>
                                <div className="sync-progress-line">
                                    <motion.div
                                        animate={{ x: [-200, 200] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="sync-progress-glow"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ForgeModal;
