import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../services/api';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
    FaPalette, FaImage, FaMagic, FaVolumeUp, FaSave,
    FaMusic, FaUserCircle, FaMousePointer,
    FaCrown, FaDiscord, FaAdjust, FaSun, FaBolt, FaLayerGroup,
    FaBan, FaCloudRain, FaSnowflake, FaTv, FaFilm, FaShoppingCart, FaHistory
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeModal from '../../components/ForgeModal/ForgeModal';
import DiscordServerWidget from '../../components/DiscordServerWidget';

const Design = () => {
    const {
        profileData,
        setLiveConfig,
        updateProfileData,
        uploadStats,
        fetchUploadStats: refreshStats,
        setPreviewMuted,
        fetchProfile
    } = useDashboard();
    const { config: systemConfig } = useConfig();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeAssetSection, setActiveAssetSection] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [modalData, setModalData] = useState({ label: '', section: '', link: '' });
    const [inventory, setInventory] = useState({
        frame: [],
        cursor: [],
        background: [],
        audio: [],
        avatar: [],
        vault: [] // Store raw uploaded assets separately
    });

    const [discordAssets, setDiscordAssets] = useState([]);
    const [isServerInfoLoading, setIsServerInfoLoading] = useState(false);

    useEffect(() => {
        fetchInventory();
        fetchDiscordAssets();
    }, []);

    const fetchDiscordAssets = async () => {
        try {
            const res = await api.get('/discord/assets');
            setDiscordAssets(res.data.assets || []);
        } catch (error) {
            console.error('Failed to fetch Discord assets', error);
        }
    };

    const fetchInventory = async () => {
        try {
            const types = ['frame', 'cursor', 'background', 'audio', 'avatar'];
            const [storeResults, uploadResults] = await Promise.all([
                Promise.all(types.map(type => api.get(`/store/owned?type=${type}`))),
                api.get('/upload') // Get Vault assets
            ]);

            const newInventory = { vault: uploadResults.data || [] };
            types.forEach((type, index) => {
                newInventory[type] = storeResults[index].data;
            });
            setInventory(newInventory);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        }
    };

    const getMergedItems = (type) => {
        const owned = inventory[type] || [];

        // Filter vault assets for this type
        const vault = (inventory.vault || []).filter(asset => {
            // Strict match
            if (asset.type === type) return true;
            // Allow generic 'image' to show in background/avatar sections
            if ((type === 'background' || type === 'avatar') && asset.type === 'image') return true;
            return false;
        }).map(asset => ({
            ...asset,
            imageUrl: asset.url, // Standardize for preview
            rarity: 'common' // Default rarity for uploads
        }));

        const discord = discordAssets.filter(asset => {
            if (type === 'background') return asset.type === 'banner';
            if (type === 'avatar') return asset.type === 'avatar';
            if (type === 'frame') return asset.type === 'decoration';
            return false;
        }).map(asset => ({
            ...asset,
            _id: `discord_${asset.type}_${asset.url.split('/').pop()}`,
            name: asset.name,
            imageUrl: asset.url,
            rarity: 'epic',
            isDiscord: true,
            metadata: { type: asset.type === 'banner' ? 'image' : 'decoration' }
        }));

        return [...discord, ...vault, ...owned];
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary': return '#fbbf24'; // gold
            case 'epic': return '#a78bfa'; // purple
            case 'rare': return '#3b82f6'; // blue
            case 'uncommon': return '#10b981'; // green
            default: return '#9ca3af'; // gray
        }
    };

    const [config, setConfig] = useState({
        colors: {
            primary: '#FF4500',
            background: '#050505',
            text: '#ffffff',
            cardBackground: 'rgba(255, 255, 255, 0.05)',
            accent: '#1b1b1b'
        },
        background: {
            type: 'color',
            url: '',
            opacity: 0.5,
            blur: 0,
            isMuted: true
        },
        effects: {
            background: 'none',
            username: 'none',
        },
        glowSettings: {
            username: true,
            socials: true,
            badges: true
        },
        audio: {
            url: '',
            autoPlay: false
        },
        appearance: {
            profileOpacity: 0.5,
            profileBlur: 0
        },
        cursorUrl: '',
        frame: null,
        presence: {
            discord: false,
            type: 'user',
            serverId: ''
        }
    });

    const handleVerifyServer = async () => {
        if (!config.presence.serverId) return;

        let serverId = config.presence.serverId;
        // Parse invite link if provided
        if (serverId.includes('discord.gg/') || serverId.includes('discord.com/invite/')) {
            serverId = serverId.split('/').pop();
        }

        setIsServerInfoLoading(true);
        try {
            const res = await api.get(`/discord/server/${serverId}`);
            // Save the resolved ID back to state
            const finalId = res.data.id;

            // Create the new config object for persistence
            const updatedConfig = {
                ...config,
                presence: {
                    ...config.presence,
                    serverId: finalId,
                    type: 'server',
                    discord: true
                }
            };

            setConfig(updatedConfig);

            // AUTO-PERSISTENCE: Save immediately to profile
            console.log("Saving Discord config:", updatedConfig);
            await api.put('/profiles/@me', {
                themeConfig: updatedConfig,
                frame: updatedConfig.frame
            });

            // CRITICAL: Sync Global Context Immediately
            updateProfileData({ themeConfig: updatedConfig });

            toast.success(`Protocol Linked & Saved: ${res.data.name}`);
        } catch (error) {
            toast.error('Server not found or bot not in server');
        } finally {
            setIsServerInfoLoading(false);
        }
    };

    const handleUnlinkServer = async () => {
        setIsServerInfoLoading(true);
        try {
            const updatedConfig = {
                ...config,
                presence: {
                    ...config.presence,
                    serverId: '',
                    type: 'user',
                    discord: true
                }
            };

            setConfig(updatedConfig);

            // Save changes
            await api.put('/profiles/@me', { themeConfig: updatedConfig, frame: config.frame });

            // Sync Context
            updateProfileData({ themeConfig: updatedConfig });

            toast.success('Server Unlinked');
        } catch (error) {
            toast.error('Failed to unlink');
        } finally {
            setIsServerInfoLoading(false);
        }
    };

    // Initialize config from profileData when loaded
    useEffect(() => {
        if (profileData?.profile) {
            const backendConfig = profileData.profile.themeConfig || {};

            setConfig(prev => {
                // Deep merge helper to preserve defaults for missing keys
                const deepMerge = (defaultObj, remoteObj) => {
                    return { ...defaultObj, ...(remoteObj || {}) };
                };

                return {
                    ...prev,
                    ...backendConfig,
                    // Explicitly deep merge nested objects to prevents data loss
                    colors: deepMerge(prev.colors, backendConfig.colors),
                    background: deepMerge(prev.background, backendConfig.background),
                    effects: deepMerge(prev.effects, backendConfig.effects),
                    glowSettings: deepMerge(prev.glowSettings, backendConfig.glowSettings),
                    audio: deepMerge(prev.audio, backendConfig.audio),
                    appearance: deepMerge(prev.appearance, backendConfig.appearance),
                    presence: deepMerge(prev.presence, backendConfig.presence),

                    frame: profileData.profile.frame ? (typeof profileData.profile.frame === 'object' ? profileData.profile.frame._id : profileData.profile.frame) : null,
                    // Ensure cursor defaults if not present
                    cursorUrl: backendConfig.cursorUrl !== undefined ? backendConfig.cursorUrl : prev.cursorUrl
                };
            });
        }
    }, [profileData]);

    useEffect(() => {
        // Find full frame object for live preview
        const selectedFrame = inventory.frame.find(f => f._id === config.frame);

        setLiveConfig({
            themeConfig: config,
            frame: selectedFrame || config.frame // Fallback to ID if object not found
        });
    }, [config, setLiveConfig, inventory.frame]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/profiles/@me', {
                themeConfig: config,
                frame: config.frame
            });
            await fetchProfile(); // Refresh global context after save
            toast.success('Forge configuration saved!');
        } catch (error) {
            toast.error('Failed to update Forge');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName) return;
        setLoading(true);
        try {
            await api.post('/profiles/@me/templates', {
                name: templateName,
                config
            });
            toast.success(`Template "${templateName}" saved!`);
            setIsTemplateModalOpen(false);
            setTemplateName('');
        } catch (error) {
            toast.error('Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file, name) => {
        if (!file || !activeAssetSection) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (name) formData.append('name', name);

        // Pass the active section as the type (e.g., 'background', 'avatar', 'cursor')
        if (activeAssetSection) {
            formData.append('type', activeAssetSection);
        }

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const asset = res.data.asset; // Full asset object
            const url = asset.url;
            refreshStats(); // Sync stats globally

            // Update local inventory immediately
            setInventory(prev => ({
                ...prev,
                vault: [asset, ...prev.vault]
            }));

            let type = asset.type; // Use the type from response

            applyAsset(activeAssetSection, url, asset); // Pass full asset
            setIsModalOpen(false);
        } catch (error) {
            const msg = error.response?.data?.error || 'Upload failed';
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleLinkSubmit = () => {
        if (!modalData.link) return;
        const link = modalData.link.toLowerCase();
        let type = 'image';

        if (link.includes('.mp4') || link.includes('.webm')) {
            type = 'video';
        } else if (link.includes('.mp3') || link.includes('.wav') || link.includes('.ogg') || link.includes('.m4a') || link.includes('mpeg')) {
            type = 'audio';
        }

        applyAsset(activeAssetSection, modalData.link, type);
        setIsModalOpen(false);
    };

    const applyAsset = async (section, url, asset) => {
        try {
            if (section === 'avatar') {
                await api.put('/profiles/@me', { avatar: url });
                if (updateProfileData) updateProfileData({ avatar: url });
                toast.success('Avatar forged!');
            } else if (section === 'background') {
                const type = (asset && typeof asset === 'object') ? (asset.metadata?.type || 'image') : 'image';
                setConfig(prev => ({
                    ...prev,
                    background: {
                        ...prev.background,
                        url: url,
                        type: type
                    }
                }));
                toast.success('Background forged!');
            } else if (section === 'audio') {
                setPreviewMuted(false); // Force unmute to preview the audio
                setConfig(prev => ({
                    ...prev,
                    audio: {
                        ...prev.audio,
                        url: url,
                        autoPlay: true
                    }
                }));
                toast.success('Atmosphere transformed!');
            } else if (section === 'cursor') {
                setConfig(prev => ({
                    ...prev,
                    cursorUrl: url
                }));
                toast.success('Pointer recalibrated!');
            }
        } catch (err) {
            console.error("Apply error:", err);
            toast.error("Failed to apply asset to profile");
        }
    };

    const openAssetModal = (label, section) => {
        setActiveAssetSection(section);
        setModalData({ label, section, link: '' });
        setIsModalOpen(true);
    };

    const updateNested = (section, key, value) => {
        setConfig(prev => {
            if (!section) return { ...prev, [key]: value };
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
        });
    };

    return (
        <div className="animate-fade-in pb-20">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
                <div>
                    <div className="forge-section-tag">Aesthetic Forge</div>
                    <h1 className="text-4xl font-black tracking-tighter">THE FORGE</h1>
                    <p className="text-secondary text-sm mt-2">Sculpt your profile's digital essence.</p>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
                    <Link to="/forge" className="flex-1 md:flex-none">
                        <Button
                            style={{ borderRadius: '999px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', justifyContent: 'center' }}
                            className="flex justify-center"
                        >
                            <FaHistory style={{ marginRight: '8px' }} />
                            Manage Assets
                        </Button>
                    </Link>
                    <div className="flex-1 md:flex-none">
                        <Button
                            onClick={() => setIsTemplateModalOpen(true)}
                            style={{ borderRadius: '999px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', justifyContent: 'center' }}
                            className="flex justify-center"
                        >
                            <FaLayerGroup style={{ marginRight: '8px' }} />
                            Save Template
                        </Button>
                    </div>
                    <div className="flex-1 md:flex-none">
                        <Button
                            onClick={handleSave}
                            loading={loading}
                            style={{ borderRadius: '999px', padding: '12px 32px', width: '100%', justifyContent: 'center' }}
                            className="flex justify-center"
                        >
                            <FaBolt style={{ marginRight: '8px' }} />
                            Update Forge
                        </Button>
                    </div>
                </div>
            </div>

            <div className="forge-container">

                {/* Pod 1: Asset Wells */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="aesthetic-pod"
                >
                    <div className="prism-glow" />
                    <div className="forge-section-tag">Core Assets</div>
                    <div className="asset-well-grid">
                        <AssetWell icon={FaImage} label="Background" sub="Image/Video" onClick={() => openAssetModal('Background', 'background')} />
                        <AssetWell icon={FaMusic} label="Audio" sub="Atmosphere" onClick={() => openAssetModal('Audio', 'audio')} />
                        <AssetWell icon={FaUserCircle} label="Avatar" sub="Visual Identity" onClick={() => openAssetModal('Avatar', 'avatar')} />
                        <AssetWell icon={FaMousePointer} label="Cursor" sub="Pointer" onClick={() => openAssetModal('Cursor', 'cursor')} />
                    </div>
                </motion.section>

                <ForgeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={modalData}
                    setData={setModalData}
                    onUpload={handleFileUpload}
                    onSubmit={handleLinkSubmit}
                    uploading={uploading}
                    stats={uploadStats}
                    discordAssets={discordAssets}
                />

                <SaveTemplateModal
                    isOpen={isTemplateModalOpen}
                    onClose={() => setIsTemplateModalOpen(false)}
                    name={templateName}
                    setName={setTemplateName}
                    onSave={handleSaveTemplate}
                    loading={loading}
                />

                <div className="dash-grid grid-cols-1 lg:grid-cols-2">
                    {/* Pod 2: Atmospheric Controls */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="aesthetic-pod"
                    >
                        <div className="prism-glow" />
                        <div className="forge-section-tag">Atmosphere</div>

                        <div className="space-y-10">
                            <div className="form-group">
                                <label className="form-label mb-6">Atmospheric Synthesis</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'none', icon: FaBan, label: 'VOID', status: 'DEFAULT' },
                                        { id: 'rain', icon: FaCloudRain, label: 'OVERCAST', status: 'PRECIPITATION' },
                                        { id: 'snow', icon: FaSnowflake, label: 'FROST', status: 'GLACIAL' },
                                        { id: 'scanlines', icon: FaTv, label: 'CRT', status: 'INTERLACED' },
                                        { id: 'vhs', icon: FaFilm, label: 'REWIND', status: 'ANALOG' }
                                    ].map(eff => (
                                        <button
                                            key={eff.id}
                                            onClick={() => updateNested('effects', 'background', eff.id)}
                                            className={`atmospheric-cell ${config.effects.background === eff.id ? 'active' : ''}`}
                                        >
                                            <div className="cell-indicator" />
                                            <div className="cell-icon">
                                                <eff.icon />
                                            </div>
                                            <div className="cell-meta">
                                                <div className="cell-label">{eff.label}</div>
                                                <div className="cell-status">{eff.status}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="dash-grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-group">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="form-label !mb-0 flex items-center gap-2">
                                            <FaAdjust className="text-orange-500" /> OPACITY
                                        </label>
                                        <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                                            {(config.appearance.profileOpacity * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="energy-core-wrapper">
                                        <input
                                            type="range" className="energy-core-slider"
                                            min="0" max="1" step="0.01"
                                            value={config.appearance.profileOpacity}
                                            onChange={(e) => updateNested('appearance', 'profileOpacity', parseFloat(e.target.value))}
                                            style={{ '--plasma': `${config.appearance.profileOpacity * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="form-label !mb-0 flex items-center gap-2">
                                            <FaMagic className="text-orange-500" /> BLUR
                                        </label>
                                        <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                                            {config.appearance.profileBlur}PX
                                        </span>
                                    </div>
                                    <div className="energy-core-wrapper">
                                        <input
                                            type="range" className="energy-core-slider"
                                            min="0" max="50" step="1"
                                            value={config.appearance.profileBlur}
                                            onChange={(e) => updateNested('appearance', 'profileBlur', parseInt(e.target.value))}
                                            style={{ '--plasma': `${(config.appearance.profileBlur / 50) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Pod 3: Identity Glow */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="aesthetic-pod"
                    >
                        <div className="prism-glow" />
                        <div className="forge-section-tag">Identity Glow</div>

                        <div className="space-y-8">
                            <div className="form-group">
                                <label className="form-label mb-4">Username Aura Synthesis</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'none', label: 'VOID', sub: 'NEUTRAL STATE' },
                                        { id: 'glow', label: 'ECHO', sub: 'LUMINAL CORE' },
                                        { id: 'rainbow', label: 'CHROMA', sub: 'SPECTRUM BLAZE' },
                                        { id: 'sparkle', label: 'STELLAR', sub: 'PARTICLE DRIFT' }
                                    ].map(eff => (
                                        <button
                                            key={eff.id}
                                            onClick={() => updateNested('effects', 'username', eff.id)}
                                            className={`aura-cell ${config.effects.username === eff.id ? 'active' : ''}`}
                                        >
                                            <div className="aura-indicator" />
                                            <div className="aura-label">{eff.label}</div>
                                            <div className="aura-sub">{eff.sub}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="identity-matrix-area">
                                <div className="matrix-title-glow flex items-center gap-2 mb-4">
                                    <FaBolt className="text-yellow-400" />
                                    <span>IDENTITY GLOW MATRIX</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <GlowMatrixItem
                                        label="USERNAME"
                                        active={config.glowSettings.username}
                                        onToggle={() => updateNested('glowSettings', 'username', !config.glowSettings.username)}
                                    />
                                    <GlowMatrixItem
                                        label="SOCIALS"
                                        active={config.glowSettings.socials}
                                        onToggle={() => updateNested('glowSettings', 'socials', !config.glowSettings.socials)}
                                    />
                                    <GlowMatrixItem
                                        label="BADGES"
                                        active={config.glowSettings.badges}
                                        onToggle={() => updateNested('glowSettings', 'badges', !config.glowSettings.badges)}
                                    />
                                    <GlowMatrixItem
                                        label="AVATAR"
                                        active={config.glowSettings.avatar}
                                        onToggle={() => updateNested('glowSettings', 'avatar', !config.glowSettings.avatar)}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Pod 4: Discord Protocol */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="aesthetic-pod overflow-visible"
                    >
                        <div className="prism-glow" />
                        <div className="forge-section-tag">Discord Protocol</div>

                        <div className="space-y-8">
                            <div className="discord-protocol-area">
                                <div className="matrix-title-glow flex items-center gap-2 mb-4">
                                    <FaDiscord className="text-[#5865F2]" />
                                    <span>PROTOCOL SYNC CHOICE</span>
                                </div>

                                <div className="discord-mode-selector grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl mb-4 border border-white/5">
                                    <button
                                        onClick={() => updateNested('presence', 'type', 'user')}
                                        className={`mode-btn ${config.presence.type === 'user' ? 'active' : ''}`}
                                    >
                                        LIVE ACTIVITY
                                    </button>
                                    <button
                                        onClick={() => updateNested('presence', 'type', 'server')}
                                        className={`mode-btn ${config.presence.type === 'server' ? 'active' : ''}`}
                                    >
                                        SERVER SYNC
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {config.presence.type === 'user' ? (
                                        <motion.div
                                            key="user"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="protocol-status-card"
                                        >
                                            <div className="status-flex">
                                                <div className="status-info">
                                                    <div className="status-tag">STATUS: {config.presence.discord ? 'SYNCHRONIZED' : 'DORMANT'}</div>
                                                    <div className="status-desc">Show your live activities from Discord.</div>
                                                </div>
                                                <EnergyCoreToggle
                                                    active={config.presence.discord}
                                                    onClick={() => updateNested('presence', 'discord', !config.presence.discord)}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="server"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="protocol-server-input"
                                        >
                                            <div className="relative">
                                                {config.presence.discord && config.presence.serverId && config.presence.type === 'server' ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={config.presence.serverId}
                                                            disabled
                                                            className="server-input-field opacity-60 cursor-not-allowed"
                                                        />
                                                        <button
                                                            className="server-verify-btn bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30"
                                                            onClick={handleUnlinkServer}
                                                            disabled={isServerInfoLoading}
                                                        >
                                                            {isServerInfoLoading ? <div className="animate-spin"><FaBolt /></div> : 'UNLINK'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <input
                                                            type="text"
                                                            placeholder="Server ID or Invite Link"
                                                            value={config.presence.serverId}
                                                            onChange={(e) => updateNested('presence', 'serverId', e.target.value)}
                                                            className="server-input-field"
                                                        />
                                                        <button
                                                            className="server-verify-btn"
                                                            onClick={handleVerifyServer}
                                                            disabled={isServerInfoLoading}
                                                        >
                                                            {isServerInfoLoading ? <div className="animate-spin"><FaBolt /></div> : 'LINK'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 mt-3 px-1">
                                                <p className="text-[9px] text-muted leading-tight">Display server stats: Icons, Member Count, and Online state.</p>
                                                <p className="text-[8px] text-orange-500/60 font-medium italic flex items-center gap-2">
                                                    Linking requires the Vynn Bot.
                                                    <a href={systemConfig.botInviteLink} target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">Invite Bot</a>
                                                </p>
                                            </div>

                                            {/* PREMIUM PROTOCOL PREVIEW */}
                                            {config.presence.serverId && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="mt-8 pt-6 border-t border-white/5 relative"
                                                >
                                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                                                    <div className="text-[8px] font-black text-white/40 mb-5 tracking-[0.3em] uppercase text-center flex items-center justify-center gap-3">
                                                        <div className="h-px w-8 bg-white/5" />
                                                        Active Connection
                                                        <div className="h-px w-8 bg-white/5" />
                                                    </div>
                                                    <div className="p-1 rounded-[24px] bg-white/[0.01] border border-white/5 shadow-2xl">
                                                        <DiscordServerWidget serverId={config.presence.serverId} mode="dashboard" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="presence-activation-prompt">
                                <div className="prompt-content">
                                    <div className="prompt-icon-wrap">
                                        <FaDiscord className="prompt-icon" />
                                    </div>
                                    <div className="prompt-text">
                                        Be part of the community to enjoy exclusive profile features.
                                    </div>
                                    <a
                                        href={systemConfig.serverInviteLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="prompt-action-btn"
                                    >
                                        JOIN SERVER
                                    </a>
                                </div>
                                <div className="prompt-progress-glow" />
                            </div>
                        </div>
                    </motion.section>
                </div>

                <div className="dash-grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Frames Inventory */}
                    <AssetPortfolio
                        title="Avatar Frames"
                        type="frame"
                        items={getMergedItems('frame')}
                        current={config.frame}
                        onSelect={(id) => setConfig(prev => ({ ...prev, frame: id }))}
                        getRarityColor={getRarityColor}
                    />

                    {/* Cursor Inventory */}
                    <AssetPortfolio
                        title="Cursor Arsenal"
                        type="cursor"
                        items={getMergedItems('cursor')}
                        current={config.cursorUrl}
                        onSelect={(url) => applyAsset('cursor', url)}
                        getRarityColor={getRarityColor}
                    />

                    {/* Background Inventory */}
                    <AssetPortfolio
                        title="Background Gallery"
                        type="background"
                        items={getMergedItems('background')}
                        current={config.background.url}
                        onSelect={(url, item) => applyAsset('background', url, item)}
                        getRarityColor={getRarityColor}
                    />

                    {/* Audio Inventory */}
                    <AssetPortfolio
                        title="Sonic Atmosphere"
                        type="audio"
                        items={getMergedItems('audio')}
                        current={config.audio.url}
                        onSelect={(url) => applyAsset('audio', url)}
                        getRarityColor={getRarityColor}
                    />

                </div>
            </div>

            {/* Floating Save Button Portal - Simplified for visibility */}
            {createPortal(
                <div
                    style={{
                        position: 'fixed',
                        bottom: '32px',
                        right: '32px',
                        zIndex: 99999,
                        pointerEvents: 'auto'
                    }}
                >
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.6)] flex items-center justify-center transition-all border-4 border-black/20 hover:scale-110 active:scale-95"
                        title="Save Changes"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FaSave size={24} />
                        )}
                    </button>
                </div>,
                document.body
            )}

            {/* Avatar Inventory */}
            <AssetPortfolio
                title="Avatar Collection"
                type="avatar"
                items={getMergedItems('avatar')}
                current={profileData?.profile?.avatar}
                onSelect={(url) => applyAsset('avatar', url)}
                getRarityColor={getRarityColor}
            />
        </div>


    );
};

// Helper component for Asset Portfolios
const AssetPortfolio = ({ title, type, items, current, onSelect, getRarityColor }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="aesthetic-pod"
    >
        <div className="prism-glow" />
        <div className="forge-section-tag flex justify-between items-center">
            <span>{title}</span>
            <Link to="/store" className="text-secondary text-[10px] flex items-center gap-1 hover:text-white transition-colors">
                <FaShoppingCart /> Store
            </Link>
        </div>
        <div className="frame-portfolio">
            <div className="portfolio-grid">
                <div
                    className={`portfolio-cell ${!current ? 'active' : ''}`}
                    onClick={() => onSelect(null)}
                >
                    <div className="cell-content flex items-center justify-center">
                        <div className="cell-preview null" />
                        <div className="cell-footer">
                            <div className="cell-name uppercase">ORIGIN</div>
                            <div className="cell-type">DEFAULT</div>
                        </div>
                    </div>
                </div>
                {items.map(item => {
                    const id = (type === 'frame' && !item.isDiscord) ? item._id : item.imageUrl;
                    const isActive = current === id || (current && current._id === id);

                    return (
                        <div
                            key={item._id}
                            className={`portfolio-cell ${isActive ? 'active' : ''}`}
                            onClick={() => onSelect(id, item)}
                        >
                            <div className="cell-content">
                                <div className="cell-preview" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.isDiscord && (
                                        <div style={{ position: 'absolute', top: 5, right: 5, zIndex: 20, color: '#5865F2', fontSize: '10px' }}>
                                            <FaDiscord />
                                        </div>
                                    )}
                                    {type === 'audio' ? (
                                        <div style={{ color: 'var(--primary)', fontSize: '24px', opacity: 0.8 }}>
                                            <FaMusic />
                                        </div>
                                    ) : (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            style={{
                                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                                objectFit: 'contain', zIndex: 10, padding: type === 'cursor' ? '12px' : '0'
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="cell-footer">
                                    <div className="cell-name truncate px-2">{item.name}</div>
                                    <div className="cell-type" style={{ color: item.isDiscord ? '#5865F2' : getRarityColor(item.rarity) }}>
                                        {item.isDiscord ? 'DISCORD' : item.rarity.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </motion.section>
);

// Unique Forge Sub-components
const GlowMatrixItem = ({ label, active, onToggle }) => (
    <button
        onClick={onToggle}
        className={`matrix-cell ${active ? 'active' : ''}`}
    >
        <div className="matrix-status-dot" />
        <div className="matrix-label">{label}</div>
    </button>
);

const AssetWell = ({ icon: Icon, label, sub, onClick }) => (
    <div className="asset-well" onClick={onClick}>
        <div className="asset-well-core">
            <Icon />
        </div>
        <div className="text-[9px] font-black uppercase tracking-tighter text-white">{label}</div>
        <div className="text-[7px] text-muted uppercase tracking-widest mt-1">{sub}</div>
    </div>
);

const EnergyCoreToggle = ({ active, onClick }) => (
    <div className={`energy-core-toggle ${active ? 'active' : ''}`} onClick={onClick}>
        <div className="energy-core" />
    </div>
);

const GlowItem = ({ label, active, onToggle }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-2xl border border-white/5">
        <span className="text-[10px] font-bold text-muted uppercase">{label}</span>
        <EnergyCoreToggle active={active} onClick={onToggle} />
    </div>
);

const SaveTemplateModal = ({ isOpen, onClose, name, setName, onSave, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
            >
                <div className="prism-glow opacity-30" />
                <div className="relative z-10">
                    <div className="forge-section-tag mb-6">Template Forge</div>
                    <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase italic text-white">Snapshot Design</h2>
                    <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-10 opacity-50">Capture this aesthetic into your repository.</p>

                    <div className="space-y-8">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Design Name (e.g. Midnight Cyber)"
                                className="vynn-input w-full text-xs py-5 pl-6 pr-14 !border-white/5 hover:!border-orange-500/30 focus:!border-orange-500 transition-all bg-white/[0.02]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-orange-500 transition-colors">
                                <FaLayerGroup className="text-[10px]" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={onClose} variant="ghost" className="!bg-transparent !border-white/5 hover:!bg-white/5" style={{ flex: 1, borderRadius: '20px' }}>
                                Decline
                            </Button>
                            <Button
                                onClick={onSave}
                                loading={loading}
                                disabled={!name}
                                className="!shadow-xl !shadow-orange-500/10"
                                style={{ flex: 2, borderRadius: '20px' }}
                            >
                                Forge Template
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Design;
