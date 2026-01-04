import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../services/api';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FaLayerGroup, FaBolt, FaTrash, FaCheckCircle, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Templates = () => {
    const { user } = useAuth();
    const { setLiveConfig } = useDashboard();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState([]);

    const vynnPresets = [
        {
            id: 'preset-void',
            name: 'Void Essence',
            type: 'vynn',
            config: {
                colors: { primary: '#6d28d9', background: '#020617', text: '#ffffff', cardBackground: 'rgba(255, 255, 255, 0.05)' },
                background: { type: 'color', opacity: 0.5, blur: 0 },
                effects: { background: 'none', username: 'glow' },
                appearance: { profileOpacity: 0.4, profileBlur: 10 }
            }
        },
        {
            id: 'preset-cyber',
            name: 'Cyber Neon',
            type: 'vynn',
            config: {
                colors: { primary: '#0ea5e9', background: '#0f172a', text: '#ffffff', cardBackground: 'rgba(14, 165, 233, 0.05)' },
                background: { type: 'color', opacity: 0.5, blur: 0 },
                effects: { background: 'scanlines', username: 'rainbow' },
                appearance: { profileOpacity: 0.6, profileBlur: 5 }
            }
        },
        {
            id: 'preset-sunset',
            name: 'Solar Flare',
            type: 'vynn',
            config: {
                colors: { primary: '#f97316', background: '#0c0a09', text: '#ffffff', cardBackground: 'rgba(249, 115, 22, 0.05)' },
                background: { type: 'color', opacity: 0.5, blur: 0 },
                effects: { background: 'none', username: 'sparkle' },
                appearance: { profileOpacity: 0.5, profileBlur: 0 }
            }
        },
        {
            id: 'preset-pastel',
            name: 'Soft Breeze',
            type: 'vynn',
            config: {
                colors: { primary: '#f472b6', background: '#1c1917', text: '#ffffff', cardBackground: 'rgba(244, 114, 182, 0.05)' },
                background: { type: 'color', opacity: 0.7, blur: 0 },
                effects: { background: 'snow', username: 'glow' },
                appearance: { profileOpacity: 0.8, profileBlur: 20 }
            }
        }
    ];

    useEffect(() => {
        fetchUserTemplates();
    }, []);

    const fetchUserTemplates = async () => {
        try {
            const res = await api.get('/profiles/@me/templates');
            setTemplates(res.data.templates || []);
        } catch (error) {
            console.error("Failed to fetch templates", error);
        }
    };

    const handleApply = async (template) => {
        setLoading(true);
        try {
            await api.put('/profiles/@me', {
                themeConfig: template.config,
                frame: template.config.frame || null
            });
            setLiveConfig({
                themeConfig: template.config,
                frame: template.config.frame || null
            });
            toast.success(`Template "${template.name}" applied!`);
        } catch (error) {
            toast.error('Failed to apply template');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/profiles/@me/templates/${id}`);
            setTemplates(templates.filter(t => t.id !== id));
            toast.success('Template deleted');
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            <div className="mb-12 px-4 md:px-0">
                <div className="forge-section-tag">Design Repository</div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter">TEMPLATES</h1>
                <p className="text-secondary text-sm mt-2">Browse presets or manage your custom-forged designs.</p>
            </div>

            <section className="mb-16">
                <h3 className="section-title-vynn flex items-center gap-3">
                    <FaStar className="text-orange-500" /> Vynn Presets
                </h3>
                <div className="template-grid">
                    {vynnPresets.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onApply={() => handleApply(template)}
                        />
                    ))}
                </div>
            </section>

            {templates.length > 0 && (
                <section>
                    <h3 className="section-title-vynn flex items-center gap-3">
                        <FaLayerGroup className="text-purple-500" /> My Designs
                    </h3>
                    <div className="template-grid">
                        {templates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onApply={() => handleApply(template)}
                                onDelete={() => handleDelete(template.id)}
                                isUserTemplate
                            />
                        ))}
                    </div>
                </section>
            )}

            {!loading && templates.length === 0 && (
                <div className="aesthetic-pod text-center py-20 bg-white/[0.02]">
                    <div className="prism-glow" />
                    <FaLayerGroup className="text-4xl text-muted mb-4 mx-auto" />
                    <p className="text-muted text-sm">You haven't saved any custom templates yet.</p>
                    <p className="text-[10px] text-muted/50 mt-1 uppercase tracking-widest">Save your designs in the Aesthetic Forge</p>
                </div>
            )}

            <style>{`
                .section-title-vynn {
                    font-size: 0.95rem;
                    font-weight: 700;
                    margin-bottom: 24px;
                    color: white;
                }
            `}</style>
        </div>
    );
};

const TemplateCard = ({ template, onApply, onDelete, isUserTemplate }) => (
    <div className="template-card">
        {isUserTemplate && <span className="template-type-badge">SAVED</span>}
        <div className="template-preview">
            <div className="template-preview-image" style={{ background: template.config.colors.background }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '60%', height: '140px', background: template.config.colors.cardBackground,
                    borderRadius: '20px', border: `1px solid ${template.config.colors.primary}33`,
                    backdropFilter: `blur(${template.config.appearance?.profileBlur || 0}px)`,
                    opacity: template.config.appearance?.profileOpacity || 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${template.config.colors.primary}` }} />
                    <div style={{ width: '60%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                    <div style={{ width: '40%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                </div>
            </div>
            <div className="template-actions">
                <button className="apply-btn" onClick={onApply}>Apply Design</button>
            </div>
        </div>
        <div className="template-info">
            <div>
                <div className="template-name">{template.name}</div>
                <div className="template-tag">Vynn Forge</div>
            </div>
            {isUserTemplate && (
                <button onClick={onDelete} className="p-2 text-muted hover:text-red-500 transition-colors">
                    <FaTrash size={12} />
                </button>
            )}
        </div>
    </div>
);

export default Templates;
