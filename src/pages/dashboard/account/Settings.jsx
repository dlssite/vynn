import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { FaAt, FaFingerprint, FaInfoCircle, FaEnvelope, FaTrash, FaUserSecret, FaDiscord } from 'react-icons/fa';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        bio: user?.bio || '',
        username: user?.username || ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'discord_connected') {
            toast.success('Discord account linked!');
            window.history.replaceState({}, document.title, "/account/settings");
        }
        if (params.get('error') === 'discord_already_linked') {
            toast.error('Discord already linked to another account');
            window.history.replaceState({}, document.title, "/account/settings");
        }
    }, []);

    const handleUnlinkDiscord = async () => {
        if (!window.confirm('Are you sure you want to disconnect Discord?')) return;
        try {
            await api.post('/auth/discord/unlink');
            toast.success('Discord unlinked');
            window.location.reload();
        } catch (error) {
            toast.error('Failed to unlink Discord');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profiles/@me', {
                displayName: formData.displayName,
                bio: formData.bio
            });
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
            <div className="page-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="text-secondary">Manage your identity, security, and preferences.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Identity & Profile */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem' }}>
                            <FaFingerprint style={{ margin: 'auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Identity & Profile</h2>
                    </div>

                    <div className="dash-grid grid-cols-1 md-cols-2">
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaAt style={{ color: '#f97316' }} /> Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="form-input"
                                    style={{ background: 'rgba(0,0,0,0.4)', cursor: 'not-allowed', opacity: 0.6 }}
                                />
                                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Fixed</div>
                            </div>
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaInfoCircle /> Username changes require Vynn Pro.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaFingerprint style={{ color: '#f97316' }} /> Display Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter display name"
                                className="form-input"
                                value={formData.displayName}
                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                            />
                        </div>

                        <div className="form-group lg-span-2">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaInfoCircle style={{ color: '#f97316' }} /> Biography
                            </label>
                            <textarea
                                placeholder="Brief description about yourself..."
                                className="form-textarea"
                                style={{ minHeight: '120px', resize: 'none' }}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                maxLength={200}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Supports markdown for text styling.</p>
                                <p style={{ fontSize: '10px', fontWeight: 'bold', color: formData.bio.length > 180 ? '#f97316' : 'var(--text-muted)' }}>
                                    {formData.bio.length} / 200
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <Button type="submit" loading={loading} style={{ padding: '12px 32px' }}>Save Changes</Button>
                    </div>
                </section>

                {/* Security Section (Placeholder) */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(3b, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem' }}>
                            <FaUserSecret style={{ margin: 'auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Security & Login</h2>
                    </div>

                    <div className="dash-grid grid-cols-1 md-cols-2">
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaEnvelope style={{ color: '#3b82f6' }} /> Email Address
                            </label>
                            <input type="email" value={user?.email} disabled className="form-input" style={{ opacity: 0.6 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <Button variant="secondary" fullWidth style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>Change Password</Button>
                        </div>
                    </div>
                </section>

                {/* Social Connections */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: '32px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(88, 101, 242, 0.1)', color: '#5865F2', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem' }}>
                            <FaDiscord style={{ margin: 'auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Social Connections</h2>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: user?.discord?.id ? '#5865F2' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <FaDiscord size={24} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', color: 'white' }}>Discord</p>
                                    <p style={{ fontSize: '12px', color: user?.discord?.id ? '#10B981' : 'var(--text-secondary)' }}>
                                        {user?.discord?.id ? `Connected as ${user.discord.username}` : 'Not connected'}
                                    </p>
                                </div>
                            </div>

                            {user?.discord?.id ? (
                                <button
                                    type="button"
                                    onClick={handleUnlinkDiscord}
                                    style={{
                                        padding: '8px 20px', borderRadius: '10px',
                                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444', fontSize: '0.8125rem', fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => window.location.href = `/api/auth/discord?token=${localStorage.getItem('vynn_token')}`}
                                    style={{
                                        padding: '10px 24px', borderRadius: '12px',
                                        background: '#5865F2', border: 'none',
                                        color: 'white', fontSize: '0.875rem', fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Link Discord
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section style={{
                    padding: '32px', borderRadius: '32px',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    background: 'rgba(239, 68, 68, 0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                            <FaTrash style={{ margin: 'auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>Danger Zone</h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Delete Account</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>Once you delete your account, there is no going back. All your pages, links, and analytics will be permanently erased.</p>
                        </div>
                        <button style={{
                            padding: '10px 24px', borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444', fontSize: '0.875rem', fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }} onMouseOver={e => { e.target.style.background = '#ef4444'; e.target.style.color = 'white' }} onMouseOut={e => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = '#ef4444' }}>
                            Close Account
                        </button>
                    </div>
                </section>
            </form>
        </div>
    );
};

export default Settings;
