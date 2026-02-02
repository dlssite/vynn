import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaExternalLinkAlt, FaImage, FaVideo, FaMusic, FaFile, FaPlus, FaCloudUploadAlt, FaHistory, FaSync, FaCheckSquare, FaSquare, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import './Dashboard.css';
import './ForgeGallery.css';

const ForgeGallery = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ uploadCount: 0, limit: 5 });
    const [error, setError] = useState(null);

    // UI States
    const [filter, setFilter] = useState('all');
    const [manageMode, setManageMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal States
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, batch: false });

    const fetchAssets = async () => {
        try {
            const [assetsRes, statsRes] = await Promise.all([
                api.get('/upload'),
                api.get('/upload/stats')
            ]);
            setAssets(assetsRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Fetch assets error:', err);
            toast.error('Failed to load assets from vault');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleMigrate = async () => {
        const t = toast.loading('Recovering legacy assets...');
        try {
            await api.post('/upload/migrate');
            await fetchAssets();
            toast.success('Assets recovered', { id: t });
        } catch (err) {
            console.error(err);
            toast.error('Recovery failed', { id: t });
        }
    };

    const handleDelete = async () => {
        const { id, batch } = confirmDelete;
        const t = toast.loading(batch ? `Deleting ${selectedIds.length} assets...` : 'Deleting asset...');

        try {
            if (batch) {
                await api.post('/upload/delete-batch', { ids: selectedIds });
                setAssets(prev => prev.filter(a => !selectedIds.includes(a._id)));
                setSelectedIds([]);
                setManageMode(false);
            } else {
                await api.delete(`/upload/${id}`);
                setAssets(prev => prev.filter(a => a._id !== id));
            }
            fetchAssets(); // Refresh stats
            toast.success(batch ? 'Batch deletion complete' : 'Asset deleted', { id: t });
        } catch (err) {
            toast.error('Purge failed', { id: t });
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getIcon = (type) => {
        switch (type) {
            case 'image': return <FaImage />;
            case 'video': return <FaVideo />;
            case 'audio': return <FaMusic />;
            default: return <FaFile />;
        }
    };

    const filteredAssets = filter === 'all' ? assets : assets.filter(a => a.type === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const usagePercent = stats.isAdmin ? 0 : Math.min((stats.uploadCount / stats.limit) * 100, 100);

    return (
        <div className="forge-gallery-container">
            <header className="vault-header">
                <div className="vault-title-group">
                    <div className="vault-title-wrapper">
                        <FaHistory className="vault-title-icon" />
                        <h1 className="vault-title">
                            AESTHETIC <span className="highlight">VAULT</span>
                        </h1>
                    </div>
                    <div className="vault-subtitle">
                        <span>Stored Assets Central</span>
                        <button onClick={handleMigrate} className="sync-btn">
                            <FaSync /> Recover Legacy
                        </button>
                    </div>
                </div>

                <div className="vault-controls">
                    <div className="storage-widget">
                        <div className="storage-info">
                            <span className="storage-label">CAPACITY</span>
                            <span className="storage-value">
                                {stats.isAdmin ? 'UNLIMITED' : `${stats.uploadCount} / ${stats.limit} FILES`}
                            </span>
                        </div>
                        {!stats.isAdmin && (
                            <div className="storage-progress-bg">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usagePercent}%` }}
                                    className="storage-progress-fill"
                                />
                            </div>
                        )}
                    </div>

                    {!manageMode ? (
                        <button
                            onClick={() => setManageMode(true)}
                            className="manage-btn"
                        >
                            <FaCheckSquare /> Manage Files
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setConfirmDelete({ open: true, id: null, batch: true })}
                                disabled={selectedIds.length === 0}
                                className="batch-delete-btn"
                            >
                                <FaTrash /> Delete ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => {
                                    setManageMode(false);
                                    setSelectedIds([]);
                                }}
                                className="action-btn"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="vault-tabs">
                {['all', 'image', 'video', 'audio'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`tab-btn ${filter === type ? 'active' : ''}`}
                    >
                        {type === 'all' ? 'All Assets' : `${type}s`}
                    </button>
                ))}
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="asset-grid">
                <AnimatePresence mode='popLayout'>
                    {filteredAssets.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="vault-empty"
                        >
                            <div className="empty-icon-wrapper">
                                <FaCloudUploadAlt />
                            </div>
                            <span className="empty-text">Your vault is empty</span>
                        </motion.div>
                    ) : (
                        filteredAssets.map((asset) => (
                            <motion.div
                                key={asset._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => manageMode && toggleSelect(asset._id)}
                                className={`asset-card ${manageMode ? 'manage-mode' : ''} ${selectedIds.includes(asset._id) ? 'selected' : ''}`}
                            >
                                {/* Media Preview */}
                                <div className="asset-preview">
                                    {asset.type === 'image' ? (
                                        <img src={asset.url} alt={asset.name || 'Vault Item'} />
                                    ) : (
                                        <div className="asset-preview-placeholder">
                                            <div className="placeholder-icon">
                                                {getIcon(asset.type)}
                                            </div>
                                            <span className="placeholder-label">{asset.name || asset.type + ' source'}</span>
                                        </div>
                                    )}

                                    {/* Selection UI */}
                                    {manageMode && (
                                        <div className="selection-indicator">
                                            <div className="select-box">
                                                {selectedIds.includes(asset._id) ? <FaCheckSquare /> : <FaSquare />}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hover Overlay */}
                                {!manageMode && (
                                    <div className="asset-overlay">
                                        <div className="asset-info">
                                            <div className="asset-main-info">
                                                <span className="asset-name-tag">{asset.name || 'Untitled Asset'}</span>
                                                <div style={{ display: 'flex', gap: '8px', opacity: 0.6 }}>
                                                    <span className="asset-format">{asset.metadata?.format || asset.type}</span>
                                                    <span className="asset-date">{new Date(asset.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="asset-actions">
                                                <a
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="action-btn"
                                                >
                                                    <FaExternalLinkAlt />
                                                </a>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: asset._id, batch: false }); }}
                                                    className="action-btn delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
                onConfirm={handleDelete}
                title={confirmDelete.batch ? "Purge Collection" : "Delete Asset"}
                message={confirmDelete.batch
                    ? `Are you absolutely sure you want to delete ${selectedIds.length} assets? This action is irreversible and will purge them from the vault.`
                    : "Are you sure you want to delete this asset? This action cannot be undone."
                }
                confirmText={confirmDelete.batch ? "PURGE ALL" : "DELETE"}
                variant="danger"
            />
        </div>
    );
};

export default ForgeGallery;
