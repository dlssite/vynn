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
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="forge-modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Internal File Input */}
                        <input
                            type="file"
                            ref={internalFileRef}
                            onChange={(e) => {
                                onUpload(e.target.files[0], assetName);
                                setAssetName('');
                            }}
                            className="hidden"
                            style={{ display: 'none' }}
                            accept="image/*,video/*,audio/*"
                        />

                        <div className="prism-glow" />
                        <div className="forge-modal-drag-handle" />

                        <div className="forge-modal-content">
                            {/* Header: Identity & Stats */}
                            <div className="forge-modal-header">
                                <div className="header-left">
                                    <div className="forge-status-badge">
                                        <div className="status-dot" />
                                        <span>INTEGRATION ACTIVE</span>
                                    </div>
                                    <h2 className="forge-modal-title">
                                        Forge {data.label} <FaBolt className="text-orange-500 ml-2" />
                                    </h2>
                                </div>

                                <div className="forge-vault-stats">
                                    <div className="vault-label">Vault Capacity</div>
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

                            <p className="forge-modal-subtitle">
                                Sculpt your identity by syncing new binaries or linking remote source blueprints.
                            </p>

                            <div className="forge-action-grid">
                                {/* Discord Section */}
                                {relevantDiscordAssets.length > 0 && (
                                    <section className="forge-section">
                                        <div className="section-header">
                                            <FaDiscord className="text-[#5865F2]" />
                                            <span>Discord Protocol Sync</span>
                                        </div>
                                        <div className="discord-assets-grid no-scrollbar">
                                            {relevantDiscordAssets.map((asset, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSelectDiscordAsset(asset.url)}
                                                    className={`discord-asset-card ${data.link === asset.url ? 'active' : ''}`}
                                                >
                                                    <div className="asset-preview">
                                                        <img src={asset.url} alt={asset.name} />
                                                    </div>
                                                    <span className="asset-name">{asset.name}</span>
                                                    {data.link === asset.url && <div className="active-glow" />}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Main Interaction Area */}
                                <div className="space-y-6">
                                    <div className="forge-input-group">
                                        <label className="input-label">Identity Tag (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="e.g. Midnight Cyber Synth"
                                                className="vynn-input w-full"
                                                value={assetName}
                                                onChange={(e) => setAssetName(e.target.value)}
                                            />
                                            <div className="input-indicator">NAME</div>
                                        </div>
                                    </div>

                                    {/* Upload Trigger */}
                                    <button
                                        disabled={uploading || (stats?.uploadCount >= stats?.limit)}
                                        onClick={() => internalFileRef.current?.click()}
                                        className="forge-upload-pod group"
                                    >
                                        <div className="pod-glow" />
                                        <div className="pod-content">
                                            <div className="pod-icon">
                                                <FaUpload />
                                            </div>
                                            <div className="text-left">
                                                <div className="pod-title italic">Forge Binary</div>
                                                <div className="pod-desc">Inject local file into the vault</div>
                                            </div>
                                        </div>
                                        {stats?.uploadCount >= stats?.limit && (
                                            <div className="pod-limit-tag">MAXED</div>
                                        )}
                                    </button>

                                    <div className="forge-divider">
                                        <span className="divider-text">OR SOURCE LINK</span>
                                    </div>

                                    <div className="forge-input-group">
                                        <label className="input-label">Protocol Blueprint URL</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter source URL (Images, Gifs, Mp4/Mp3)..."
                                                className="vynn-input w-full pr-12"
                                                value={data.link}
                                                onChange={(e) => setData({ ...data, link: e.target.value })}
                                            />
                                            <FaExternalLinkAlt className="absolute right-5 top-1/2 -translate-y-1/2 text-muted text-xs opacity-50" />
                                        </div>
                                    </div>

                                    <div className="forge-button-container flex gap-4">
                                        <button onClick={onClose} className="forge-btn-secondary flex-1">
                                            DECLINE
                                        </button>
                                        <button
                                            onClick={onSubmit}
                                            disabled={!data.link || uploading}
                                            className="forge-btn-primary flex-[2]"
                                        >
                                            ENGAGE LINK BRIDGE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading Overlay */}
                        <AnimatePresence>
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="forge-sync-overlay"
                                >
                                    <div className="sync-core">
                                        <div className="sync-spinner">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="spinner-outer"
                                            />
                                            <FaBolt className="spinner-icon text-orange-500" />
                                        </div>
                                        <div className="sync-text">SYNCHRONIZING BINARY</div>
                                        <div className="sync-line">
                                            <motion.div
                                                animate={{ x: [-100, 100] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="sync-glow"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ForgeModal;
