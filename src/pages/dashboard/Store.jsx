import { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FaShoppingCart, FaGem, FaCheck, FaSearch, FaMusic, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Store = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const url = activeTab === 'all' ? '/store' : `/store?type=${activeTab}`;
            const res = await api.get(url);
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch store', error);
            // toast.error('Failed to load store');
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        try {
            await api.post(`/store/${item._id}/buy`);
            toast.success(`Acquired ${item.name}!`);
            setItems(prev => prev.map(i => i._id === item._id ? { ...i, owned: true } : i));
        } catch (error) {
            const msg = error.response?.data?.error || 'Purchase failed';
            toast.error(msg);
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'mythic': return '#ef4444';
            case 'legendary': return '#fbbf24';
            case 'epic': return '#a78bfa';
            case 'rare': return '#3b82f6';
            case 'uncommon': return '#10b981';
            default: return '#9ca3af';
        }
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'frame', label: 'Frames' },
        { id: 'avatar', label: 'Avatars' },
        { id: 'background', label: 'Backgrounds' },
        { id: 'cursor', label: 'Cursors' },
        { id: 'badge', label: 'Badges' },
        { id: 'audio', label: 'Atmosphere' }
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header Area */}
            <header className="mb-10 px-4 md:px-0">
                <div className="forge-section-tag mb-2">The Marketplace</div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                    <div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>STORE</h1>
                        <p className="text-secondary text-sm md:text-base mt-2 max-w-[400px]">
                            Discover premium assets to elevate your digital presence.
                            From mythic frames to sonic atmospheres.
                        </p>
                    </div>
                </div>
            </header>

            {/* Sticky Filter Bar */}
            <nav style={{
                position: 'sticky', top: '0', zIndex: 100,
                padding: '1rem 0', background: 'rgba(5,5,5,0.8)',
                backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)',
                marginBottom: '2.5rem', display: 'flex', gap: '0.75rem', overflowX: 'auto',
                scrollbarWidth: 'none',
                margin: '0 -1rem 2.5rem -1rem', /* Negative margin to span full width on mobile */
                paddingLeft: '1rem', paddingRight: '1rem'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.875rem',
                            fontWeight: 700, transition: 'var(--transition-fast)',
                            border: activeTab === tab.id ? '1px solid white' : '1px solid transparent',
                            background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab.id ? 'black' : 'var(--text-secondary)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="glass-panel" style={{ height: '300px', borderRadius: '24px', animation: 'pulse 2s infinite ease-in-out' }}></div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '24px', borderStyle: 'dashed' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>🛒</div>
                    <div className="text-muted" style={{ fontWeight: 700 }}>No items found in this collection.</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {items.map(item => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel"
                            style={{
                                borderRadius: '24px', padding: '0.75rem',
                                position: 'relative', overflow: 'hidden',
                                transition: 'var(--transition-normal)'
                            }}
                        >
                            {/* Rarity & Price Tags */}
                            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 10 }}>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase',
                                    color: getRarityColor(item.rarity), letterSpacing: '0.05em',
                                    padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.6)',
                                    borderRadius: '6px', border: `1px solid ${getRarityColor(item.rarity)}40`
                                }}>
                                    {item.rarity}
                                </span>
                            </div>

                            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}>
                                {item.owned ? (
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: '#22c55e', color: 'black',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem'
                                    }}>
                                        <FaCheck />
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '6px',
                                        background: item.price > 0 ? 'rgba(255,140,0,0.1)' : 'rgba(34,197,94,0.1)',
                                        color: item.price > 0 ? '#ff8c00' : '#22c55e',
                                        fontSize: '0.65rem', fontWeight: 700,
                                        border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                    }}>
                                        {item.price > 0 ? <><FaGem /> {item.price}</> : 'FREE'}
                                    </div>
                                )}
                            </div>

                            {/* Main Preview Container */}
                            <div style={{
                                aspectRatio: '1', borderRadius: '18px 18px 0 0',
                                background: '#000', position: 'relative',
                                overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {/* Ambient Glow */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: getRarityColor(item.rarity),
                                    opacity: 0.1, filter: 'blur(40px)'
                                }} />

                                {item.itemType === 'frame' ? (
                                    <div style={{ position: 'relative', width: '60%', height: '60%', zIndex: 5 }}>
                                        <div style={{
                                            position: 'absolute', inset: 0, borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.1)', background: '#111'
                                        }} />
                                        <img
                                            src={item.imageUrl}
                                            style={{
                                                position: 'absolute', inset: '-20%', width: '140%', height: '140%',
                                                objectFit: 'contain', zIndex: 10
                                            }}
                                            alt={item.name}
                                        />
                                        <div style={{
                                            position: 'absolute', inset: '10%', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)'
                                        }}>V</div>
                                    </div>
                                ) : item.itemType === 'audio' ? (
                                    <div style={{ textAlign: 'center', zIndex: 5, width: '100%', padding: '0 1rem' }}>
                                        <FaMusic style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                                        <audio src={item.imageUrl} controls style={{ width: '100%', height: '24px' }} />
                                    </div>
                                ) : item.itemType === 'background' ? (
                                    item.imageUrl.match(/\.(mp4|webm)$/i) ? (
                                        <video
                                            src={item.imageUrl} autoPlay loop muted playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                                        />
                                    ) : (
                                        <img
                                            src={item.imageUrl}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                                            alt={item.name}
                                        />
                                    )
                                ) : (
                                    <img
                                        src={item.imageUrl}
                                        style={{ width: '70%', height: '70%', objectFit: 'contain', zIndex: 5 }}
                                        alt={item.name}
                                    />
                                )}
                            </div>

                            {/* Details & Action Footer */}
                            <div style={{
                                padding: '1rem 0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderTop: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <h3 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                                        <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.2rem' }}>{item.itemType}</div>
                                    </div>
                                </div>

                                {!item.owned ? (
                                    <Button
                                        onClick={() => item.type === 'exclusive' ? window.open('https://discord.gg/vynn', '_blank') : handleBuy(item)}
                                        style={{
                                            width: '100%', padding: '0.6rem', fontSize: '0.75rem',
                                            textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em',
                                            background: item.type === 'purchase' ? 'var(--primary)' :
                                                item.type === 'exclusive' ? 'rgba(88, 101, 242, 0.1)' : '#22c55e',
                                            color: item.type === 'exclusive' ? '#5865F2' : 'white',
                                            border: item.type === 'exclusive' ? '1px solid #5865F2' : 'none',
                                            borderRadius: '10px'
                                        }}
                                    >
                                        {['free', 'premium', 'event'].includes(item.type) ? 'Claim Item' :
                                            item.type === 'purchase' ? 'Purchase Now' :
                                                item.type === 'exclusive' ? 'Request Access' : 'Acquire'}
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        style={{
                                            width: '100%', padding: '0.6rem', fontSize: '0.75rem',
                                            textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '10px',
                                            cursor: 'default'
                                        }}
                                    >
                                        In Inventory
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
                nav::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default Store;
