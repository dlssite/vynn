import { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FaShoppingCart, FaGem, FaCheck, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FrameShop = () => {
    const [frames, setFrames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFrames();
    }, []);

    const fetchFrames = async () => {
        try {
            const res = await api.get('/frames');
            setFrames(res.data);
        } catch (error) {
            console.error('Failed to fetch shop frames', error);
            toast.error('Failed to load shop');
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (frame) => {
        try {
            await api.post(`/frames/${frame._id}/buy`);
            toast.success(`Acquired ${frame.name}!`);

            // Update local state to show owned
            setFrames(prev => prev.map(f =>
                f._id === frame._id ? { ...f, owned: true } : f
            ));
        } catch (error) {
            const msg = error.response?.data?.error || 'Purchase failed';
            toast.error(msg);
        }
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

    return (
        <div className="animate-fade-in pb-20">
            <div className="mb-12">
                <div className="forge-section-tag">Marketplace</div>
                <h1 className="text-4xl font-black tracking-tighter">FRAME SHOP</h1>
                <p className="text-secondary text-sm mt-2">Acquire signals to augment your avatar.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-muted">Loading arsenal...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {frames.map(frame => (
                        <motion.div
                            key={frame._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black/20 border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-white/10 transition-all"
                        >
                            {/* Rarity Tag */}
                            <div
                                className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-black/50 backdrop-blur"
                                style={{ color: getRarityColor(frame.rarity), border: `1px solid ${getRarityColor(frame.rarity)}aa` }}
                            >
                                {frame.rarity}
                            </div>

                            {/* Preview */}
                            <div className="aspect-square relative mb-6 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-32 h-32 rounded-full bg-black relative">
                                    {/* Mock Avatar */}
                                    <div className="w-full h-full rounded-full bg-white/5 absolute inset-0 m-auto overflow-hidden flex items-center justify-center text-white/10 text-4xl font-black">
                                        V
                                    </div>
                                    {/* Frame Image */}
                                    <div
                                        className="absolute inset-[-25%] pointer-events-none z-10"
                                        style={{
                                            backgroundImage: `url("${frame.imageUrl}")`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg leading-tight mb-1">{frame.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                                    {frame.type === 'free' ? (
                                        <span className="text-green-400">Standard Issue</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-orange-400">
                                            <FaGem /> {frame.price > 0 ? frame.price : 'Premium'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action */}
                            {frame.owned ? (
                                <Button disabled className="w-full !bg-white/5 !text-white/30 !border-transparent cursor-not-allowed">
                                    <FaCheck className="mr-2" /> Owned
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleBuy(frame)}
                                    className="w-full"
                                    style={{
                                        background: frame.type === 'premium' ? 'linear-gradient(135deg, #FF4500, #FF8C00)' : 'white',
                                        color: frame.type === 'premium' ? 'white' : 'black',
                                        border: 'none'
                                    }}
                                >
                                    {frame.type === 'free' ? 'Claim' : (
                                        <>
                                            {frame.type === 'premium' ? <FaGem className="mr-2" /> : <FaShoppingCart className="mr-2" />}
                                            {frame.type === 'premium' ? 'Unlock' : 'Purchase'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FrameShop;
