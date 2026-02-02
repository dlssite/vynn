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
    FaBan, FaCloudRain, FaSnowflake, FaTv, FaFilm, FaShoppingCart, FaHistory,
    FaDoorOpen, FaFont, FaBorderAll, FaChevronLeft, FaChevronRight
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
    const [ownedServers, setOwnedServers] = useState([]);
    const [activeCategory, setActiveCategory] = useState('assets');
    const [protocolTab, setProtocolTab] = useState('activity');

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
            const [storeResults, uploadResults, serverResults] = await Promise.all([
                Promise.all(types.map(type => api.get(`/store/owned?type=${type}`))),
                api.get('/upload'), // Get Vault assets
                api.get('/servers/owner/@me') // Get owned servers for Origin Sync
            ]);

            const newInventory = { vault: uploadResults.data || [] };
            types.forEach((type, index) => {
                newInventory[type] = storeResults[index].data;
            });
            setInventory(newInventory);
            setOwnedServers(serverResults.data || []);
        } catch (error) {
            console.error('Failed to fetch inventory or servers', error);
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

    const getServerIconUrl = (server) => {
        if (!server.icon) return null;
        if (server.icon.startsWith('http')) return server.icon;
        const guildId = server.guildId || server.serverId; // Handle variations in data schema
        return `https://cdn.discordapp.com/icons/${guildId}/${server.icon}.png`;
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
        layout: {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderColor2: 'rgba(255,255,255,0.1)',
            borderRadius: 32
        },
        presence: {
            discord: false,
            type: 'user',
            serverId: '',
            networkServers: [] // Array of { id, name, icon, guildId }
        }
    });

    const handleVerifyServer = async (manualId = null) => {
        const targetId = manualId || config.presence.serverId;
        if (!targetId) return;

        let serverId = targetId.trim();

        // Robust Invite Parsing
        if (serverId.includes('discord.gg/') || serverId.includes('discord.com/invite/')) {
            serverId = serverId.replace(/\/$/, '').split('/').pop();
        }

        setIsServerInfoLoading(true);
        try {
            const res = await api.get(`/discord/server/${serverId}`);
            const serverInfo = res.data;

            // Tier-based limits check
            const isPremium = profileData?.user?.isPremium || profileData?.user?.isLifetimePremium;
            const linkLimit = isPremium ? 4 : 1;
            const currentServers = config.presence.networkServers || [];

            // Check if already linked
            const exists = currentServers.find(s => s.guildId === serverInfo.id || s.id === serverId);

            let newNetworkServers = [...currentServers];
            if (!exists) {
                if (currentServers.length >= linkLimit) {
                    toast.error(`Linking limit reached. ${isPremium ? 'Pro' : 'Free'} users are limited to ${linkLimit} servers.`);
                    setIsServerInfoLoading(false);
                    return;
                }
                newNetworkServers.push({
                    id: serverId,
                    name: serverInfo.name,
                    icon: serverInfo.icon,
                    guildId: serverInfo.id
                });
            }

            const updatedConfig = {
                ...config,
                presence: {
                    ...config.presence,
                    serverId: serverId, // Set as active
                    type: 'server',
                    discord: true,
                    networkServers: newNetworkServers
                }
            };

            setConfig(updatedConfig);
            await api.put('/profiles/@me', { themeConfig: updatedConfig, frame: config.frame });
            updateProfileData({ themeConfig: updatedConfig });

            toast.success(`Protocol Linked: ${serverInfo.name}`);
        } catch (error) {
            console.error("Verification failed:", error);
            const msg = error.response?.data?.error || 'Server not found or bot not in server';
            toast.error(msg);
        } finally {
            setIsServerInfoLoading(false);
        }
    };

    const handleUnlinkServer = async (specificId = null) => {
        setIsServerInfoLoading(true);
        try {
            let updatedConfig;

            if (specificId) {
                // Unlink an individual server from the network
                const newNetworkServers = (config.presence.networkServers || []).filter(s => s.id !== specificId && s.guildId !== specificId);
                const isActive = config.presence.serverId === specificId;

                updatedConfig = {
                    ...config,
                    presence: {
                        ...config.presence,
                        serverId: isActive ? '' : config.presence.serverId,
                        type: isActive && newNetworkServers.length === 0 ? 'user' : config.presence.type,
                        networkServers: newNetworkServers
                    }
                };
            } else {
                // Full clear or toggle back to user mode
                updatedConfig = {
                    ...config,
                    presence: {
                        ...config.presence,
                        serverId: '',
                        type: 'user',
                        discord: true
                    }
                };
            }

            setConfig(updatedConfig);
            await api.put('/profiles/@me', { themeConfig: updatedConfig, frame: config.frame });
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
                    layout: deepMerge(prev.layout, backendConfig.layout),

                    frame: profileData.profile.frame ? (typeof profileData.profile.frame === 'object' ? profileData.profile.frame._id : profileData.profile.frame) : null,
                    // Ensure cursor defaults if not present
                    cursorUrl: backendConfig.cursorUrl !== undefined ? backendConfig.cursorUrl : prev.cursorUrl,
                    entranceText: backendConfig.entranceText !== undefined ? backendConfig.entranceText : prev.entranceText,
                    entranceFont: backendConfig.entranceFont !== undefined ? backendConfig.entranceFont : prev.entranceFont
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
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8">
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
                                Assets
                            </Button>
                        </Link>
                        <div className="flex-1 md:flex-none">
                            <Button
                                onClick={() => setIsTemplateModalOpen(true)}
                                style={{ borderRadius: '999px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', justifyContent: 'center' }}
                                className="flex justify-center"
                            >
                                <FaLayerGroup style={{ marginRight: '8px' }} />
                                Templates
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
                                Save
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="forge-editor-nav no-scrollbar">
                    {[
                        { id: 'assets', label: 'Assets', icon: FaImage },
                        { id: 'visuals', label: 'Visuals', icon: FaMagic },
                        { id: 'identity', label: 'Identity', icon: FaUserCircle },
                        { id: 'protocol', label: 'Protocol', icon: FaDiscord },
                        { id: 'entrance', label: 'Entrance', icon: FaDoorOpen },
                        { id: 'inventory', label: 'Inventory', icon: FaLayerGroup }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`editor-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="forge-container">
                <AnimatePresence mode="wait">
                    {activeCategory === 'assets' && (
                        <motion.div
                            key="assets"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <section className="aesthetic-pod">
                                <div className="prism-glow" />
                                <div className="forge-section-tag">Core Assets</div>
                                <div className="asset-well-grid">
                                    <AssetWell icon={FaImage} label="Background" sub="Image/Video" onClick={() => openAssetModal('Background', 'background')} />
                                    <AssetWell icon={FaMusic} label="Audio" sub="Atmosphere" onClick={() => openAssetModal('Audio', 'audio')} />
                                    <AssetWell icon={FaUserCircle} label="Avatar" sub="Visual Identity" onClick={() => openAssetModal('Avatar', 'avatar')} />
                                    <AssetWell icon={FaMousePointer} label="Cursor" sub="Pointer" onClick={() => openAssetModal('Cursor', 'cursor')} />
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeCategory === 'visuals' && (
                        <motion.div
                            key="visuals"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="category-grid">
                                <section className="aesthetic-pod">
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
                                                        <div className="cell-icon"><eff.icon /></div>
                                                        <div className="cell-meta">
                                                            <div className="cell-label">{eff.label}</div>
                                                            <div className="cell-status">{eff.status}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="aesthetic-pod">
                                    <div className="prism-glow" />
                                    <div className="forge-section-tag">Colors & Transparency</div>
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="form-group">
                                                <label className="form-label mb-4">Card Background</label>
                                                <div className="flex gap-3">
                                                    <input type="color" className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0" value={config.colors.cardBackground?.startsWith('rgba') ? '#ffffff' : config.colors.cardBackground} onChange={(e) => updateNested('colors', 'cardBackground', e.target.value)} />
                                                    <input type="text" className="vynn-input flex-1 text-[10px] uppercase font-black" value={config.colors.cardBackground} onChange={(e) => updateNested('colors', 'cardBackground', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label mb-4">Second Color (Pro)</label>
                                                <div className="flex gap-3">
                                                    <input type="color" className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0" value={config.colors.cardBackground2?.startsWith('rgba') ? '#ffffff' : config.colors.cardBackground2 || '#ffffff'} onChange={(e) => updateNested('colors', 'cardBackground2', e.target.value)} />
                                                    <input type="text" className="vynn-input flex-1 text-[10px] uppercase font-black" value={config.colors.cardBackground2 || ''} placeholder="NONE" onChange={(e) => updateNested('colors', 'cardBackground2', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="form-group">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="form-label !mb-0">Opacity</label>
                                                    <span className="text-[10px] font-black text-orange-500">{(config.appearance.profileOpacity * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="energy-core-wrapper">
                                                    <input type="range" className="energy-core-slider" min="0" max="1" step="0.01" value={config.appearance.profileOpacity} onChange={(e) => updateNested('appearance', 'profileOpacity', parseFloat(e.target.value))} style={{ '--plasma': `${config.appearance.profileOpacity * 100}%` }} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="form-label !mb-0">Blur Power</label>
                                                    <span className="text-[10px] font-black text-orange-500">{config.appearance.profileBlur}PX</span>
                                                </div>
                                                <div className="energy-core-wrapper">
                                                    <input type="range" className="energy-core-slider" min="0" max="50" step="1" value={config.appearance.profileBlur} onChange={(e) => updateNested('appearance', 'profileBlur', parseInt(e.target.value))} style={{ '--plasma': `${(config.appearance.profileBlur / 50) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {activeCategory === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="category-grid">
                                <section className="aesthetic-pod">
                                    <div className="prism-glow" />
                                    <div className="forge-section-tag">Identity Glow</div>
                                    <div className="space-y-8">
                                        <div className="form-group">
                                            <label className="form-label mb-4">Username Aura Synthesis</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    </div>
                                </section>

                                <section className="aesthetic-pod">
                                    <div className="prism-glow" />
                                    <div className="forge-section-tag">Glow Matrix</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <GlowMatrixItem label="USERNAME" active={config.glowSettings.username} onToggle={() => updateNested('glowSettings', 'username', !config.glowSettings.username)} />
                                        <GlowMatrixItem label="SOCIALS" active={config.glowSettings.socials} onToggle={() => updateNested('glowSettings', 'socials', !config.glowSettings.socials)} />
                                        <GlowMatrixItem label="BADGES" active={config.glowSettings.badges} onToggle={() => updateNested('glowSettings', 'badges', !config.glowSettings.badges)} />
                                        <GlowMatrixItem label="AVATAR" active={config.glowSettings.avatar} onToggle={() => updateNested('glowSettings', 'avatar', !config.glowSettings.avatar)} />
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {activeCategory === 'protocol' && (
                        <motion.div
                            key="protocol"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <section className="aesthetic-pod">
                                <div className="prism-glow" />
                                <div className="forge-section-tag">Protocol Matrix</div>
                                <div className="space-y-8">
                                    <div className="protocol-sub-nav grid grid-cols-3 gap-2 p-1.5 bg-black/40 rounded-2xl mb-6 border border-white/5">
                                        <button onClick={() => setProtocolTab('activity')} className={`sub-nav-item ${protocolTab === 'activity' ? 'active' : ''}`}>
                                            <FaBolt size={10} className="hidden sm:block" />
                                            <span>ACTIVITY</span>
                                        </button>
                                        <button onClick={() => setProtocolTab('network')} className={`sub-nav-item ${protocolTab === 'network' ? 'active' : ''}`}>
                                            <FaLayerGroup size={10} className="hidden sm:block" />
                                            <span>NETWORK</span>
                                        </button>
                                        <button onClick={() => setProtocolTab('origin')} className={`sub-nav-item ${protocolTab === 'origin' ? 'active' : ''}`}>
                                            <FaDoorOpen size={10} className="hidden sm:block" />
                                            <span>ORIGIN</span>
                                        </button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {protocolTab === 'activity' && (
                                            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="protocol-status-card">
                                                <div className="status-flex">
                                                    <div className="status-info">
                                                        <div className="status-tag">STATUS: {config.presence.discord ? 'SYNCHRONIZED' : 'DORMANT'}</div>
                                                        <div className="status-desc">Show your live activities from Discord.</div>
                                                    </div>
                                                    <EnergyCoreToggle active={config.presence.discord} onClick={() => updateNested('presence', 'discord', !config.presence.discord)} />
                                                </div>
                                            </motion.div>
                                        )}

                                        {protocolTab === 'network' && (
                                            <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                                <div className="protocol-server-input">
                                                    <div className="protocol-status-card mb-6">
                                                        <div className="status-tag">NETWORK NODES</div>
                                                        <p className="text-[10px] text-muted leading-relaxed">
                                                            Manual link servers you represent. {profileData?.user?.isPremium ? 'PRO: 4 Slots' : 'FREE: 1 Slot'}
                                                        </p>
                                                    </div>
                                                    <div className="relative">
                                                        <input type="text" placeholder="Server ID or Invite Link" value={config.presence.serverId} onChange={(e) => updateNested('presence', 'serverId', e.target.value)} className="server-input-field" />
                                                        <button className="server-verify-btn" onClick={() => handleVerifyServer()} disabled={isServerInfoLoading}>
                                                            {isServerInfoLoading ? <div className="animate-spin"><FaBolt /></div> : 'LINK'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {(config.presence.networkServers || []).map(server => {
                                                        const isSynced = config.presence.serverId === server.id || config.presence.serverId === server.guildId;
                                                        return (
                                                            <div key={server.guildId} className={`protocol-status-card !p-4 flex items-center justify-between border ${isSynced ? 'border-primary/40 bg-primary/5' : 'border-white/5'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                                                        {server.icon ? (
                                                                            <img src={getServerIconUrl(server)} alt={server.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-xs font-black">{server.name[0]}</div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs font-black uppercase tracking-wider">{server.name}</div>
                                                                        <div className="text-[8px] text-muted uppercase font-bold">{isSynced ? 'ACTIVE NODE' : 'LINKED'}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {!isSynced && (
                                                                        <button className="px-3 py-1.5 rounded-lg text-[9px] font-black bg-white/5 hover:bg-white/10" onClick={() => handleVerifyServer(server.id)}>SYNC</button>
                                                                    )}
                                                                    <button className="px-3 py-1.5 rounded-lg text-[9px] font-black bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => handleUnlinkServer(server.id)}>REMOVE</button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}

                                        {protocolTab === 'origin' && (
                                            <motion.div key="origin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <div className="protocol-status-card mb-4">
                                                    <div className="status-tag">ORIGIN SYNC</div>
                                                    <p className="text-[10px] text-muted leading-relaxed">Choose a server you own from the listing to synchronize with your profile.</p>
                                                </div>
                                                <div className="space-y-3">
                                                    {ownedServers.length > 0 ? (
                                                        ownedServers.map(server => {
                                                            const isSynced = config.presence.serverId === server.slug || config.presence.serverId === server.guildId;
                                                            return (
                                                                <div key={server._id} className={`protocol-status-card !p-4 flex items-center justify-between border ${isSynced ? 'border-primary/40 bg-primary/5' : 'border-white/5'}`}>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                                                            {server.icon ? (
                                                                                <img src={getServerIconUrl(server)} alt={server.name} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-xs font-black">{server.name[0]}</div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs font-black uppercase tracking-wider">{server.name}</div>
                                                                            <div className="text-[8px] text-muted uppercase font-bold">{server.slug}</div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${isSynced ? 'bg-red-500/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-primary text-black hover:scale-105'}`}
                                                                        onClick={() => {
                                                                            if (isSynced) {
                                                                                handleUnlinkServer();
                                                                            } else {
                                                                                handleVerifyServer(server.slug);
                                                                            }
                                                                        }}
                                                                        disabled={isServerInfoLoading}
                                                                    >
                                                                        {isSynced ? 'UNSYNC' : 'SYNC'}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="opacity-40 py-8 text-center text-[10px] font-black tracking-widest uppercase border-2 border-dashed border-white/5 rounded-2xl">
                                                            No Owned Servers Listed
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeCategory === 'entrance' && (
                        <motion.div
                            key="entrance"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <section className="aesthetic-pod">
                                <div className="prism-glow" />
                                <div className="forge-section-tag">Entrance Screen</div>
                                <div className="space-y-8">
                                    <div className="form-group">
                                        <label className="form-label">Entrance Text</label>
                                        <input type="text" className="vynn-input" placeholder="e.g. click to enter..." value={config.entranceText} onChange={(e) => updateNested(null, 'entranceText', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Typography</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['Inter', 'Outfit', 'Courier', 'Roboto', 'Playfair', 'Unbounded'].map(f => (
                                                <button key={f} onClick={() => updateNested(null, 'entranceFont', `'${f}', sans-serif`)} className={`font-cell ${config.entranceFont.includes(f) ? 'active' : ''}`} style={{ fontFamily: f }}>{f}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeCategory === 'inventory' && (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <section className="emporium-banner group">
                                <div className="emporium-glow" />
                                <div className="prism-glow !opacity-20" />
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                        <div className="emporium-icon-box">
                                            <FaShoppingCart size={32} />
                                        </div>
                                        <div>
                                            <div className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Exclusive Marketplace</div>
                                            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-tight">Master your <br className="hidden md:block" /> Aesthetic</h3>
                                            <p className="text-muted text-xs font-bold uppercase tracking-widest opacity-40 mt-2">Acquire legendary artifacts & rare visuals.</p>
                                        </div>
                                    </div>
                                    <Link to="/store" className="w-full md:w-auto">
                                        <Button className="emporium-banner-btn" style={{ width: '100%' }}>
                                            Visit Emporium
                                        </Button>
                                    </Link>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mt-14 inventory-grid">
                                <AssetPortfolio title="Avatar Frames" type="frame" items={getMergedItems('frame')} current={config.frame} onSelect={(id) => setConfig(prev => ({ ...prev, frame: id }))} getRarityColor={getRarityColor} />
                                <AssetPortfolio title="Avatar Collection" type="avatar" items={getMergedItems('avatar')} current={profileData?.profile?.avatar} onSelect={(url) => applyAsset('avatar', url)} getRarityColor={getRarityColor} />
                                <AssetPortfolio title="Background Gallery" type="background" items={getMergedItems('background')} current={config.background.url} onSelect={(url, item) => applyAsset('background', url, item)} getRarityColor={getRarityColor} />
                                <AssetPortfolio title="Sonic Atmosphere" type="audio" items={getMergedItems('audio')} current={config.audio.url} onSelect={(url) => applyAsset('audio', url)} getRarityColor={getRarityColor} />
                                <AssetPortfolio title="Cursor Arsenal" type="cursor" items={getMergedItems('cursor')} current={config.cursorUrl} onSelect={(url) => applyAsset('cursor', url)} getRarityColor={getRarityColor} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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

            {/* Floating Save Button Portal - Simplified for visibility */}
            {
                createPortal(
                    <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-16 h-16 rounded-full bg-orange-500 text-white shadow-2xl shadow-orange-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border-4 border-black group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FaSave size={24} className="group-hover:rotate-12 transition-transform" />
                            )}
                        </button>
                    </div>,
                    document.body
                )
            }
        </div >


    );
};

// Helper component for Asset Portfolios with Pagination
const AssetPortfolio = ({ title, type, items, current, onSelect, getRarityColor }) => {
    const [page, setPage] = useState(0);
    const itemsPerPage = 4;

    // Calculate total count including the Default/Origin item (1)
    const totalCount = items.length + 1;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Page 0: Origin (1) + items.slice(0, 5) = 6 slots
    // Page 1+: items.slice(5 + (page-1)*6, 5 + page*6)
    let currentItems = [];
    if (page === 0) {
        currentItems = items.slice(0, itemsPerPage - 1);
    } else {
        const start = (page * itemsPerPage) - 1;
        currentItems = items.slice(start, start + itemsPerPage);
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aesthetic-pod !mb-0"
        >
            <div className="prism-glow" />
            <div className="forge-section-tag flex justify-between items-center">
                <span>{title}</span>
                <span className="text-[8px] opacity-40">{items.length} OWNED</span>
            </div>
            <div className="frame-portfolio">
                <div className="portfolio-grid">
                    {page === 0 && (
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
                    )}
                    {currentItems.map(item => {
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

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="pagination-btn disabled:opacity-5"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="text-[12px] font-black italic text-orange-500">{page + 1}</span>
                            <span className="text-[8px] font-bold text-muted uppercase">/ {totalPages}</span>
                        </div>
                        <button
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="pagination-btn disabled:opacity-5"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                )}
            </div>
        </motion.section>
    );
};

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
