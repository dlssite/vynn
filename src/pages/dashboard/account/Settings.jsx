import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api, { referralAPI, API_BASE_URL } from '../../../services/api';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { FaAt, FaFingerprint, FaInfoCircle, FaEnvelope, FaTrash, FaUserSecret, FaDiscord, FaUserPlus, FaBolt, FaCoins, FaExclamationTriangle } from 'react-icons/fa';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        bio: user?.bio || '',
        username: user?.username || '',
        isNSFW: user?.isNSFW || false
    });
    const [referrer, setReferrer] = useState(null);

    useEffect(() => {
        const loadReferrer = async () => {
            try {
                const res = await referralAPI.getReferrer();
                if (res.data && res.data.referredBy) setReferrer(res.data);
            } catch (e) { }
        };
        loadReferrer();
    }, []);

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
                bio: formData.bio,
                isNSFW: formData.isNSFW
            });
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleNSFW = async () => {
        const newValue = !formData.isNSFW;
        setFormData({ ...formData, isNSFW: newValue });

        try {
            await api.put('/profiles/@me', { isNSFW: newValue });
            toast.success(`NSFW filter turned ${newValue ? 'ON' : 'OFF'}`);
            // Force refresh user context to propagate change to other components
            window.location.reload();
        } catch (error) {
            setFormData({ ...formData, isNSFW: !newValue }); // Revert on error
            toast.error('Failed to update setting');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('CRITICAL: This will permanently delete your Vynn account, profile, and all associated data. This action cannot be undone. Are you absolutely sure?')) return;

        const confirmation = window.prompt('Please type "DELETE" to confirm:');
        if (confirmation !== 'DELETE') return;

        setLoading(true);
        try {
            await api.delete('/auth/account');
            toast.success('Your account has been deleted.');
            // logout and redirect
            localStorage.removeItem('vynn_token');
            window.location.href = '/';
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete account');
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
                {/* Account Stats */}
                <div className="dash-grid grid-cols-1 md-cols-3" style={{ gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(88, 28, 135, 0.4)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            <FaInfoCircle />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Level</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{user?.level || 1}</p>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            <FaBolt />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Experience</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{user?.xp?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.2)', color: '#fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            <FaCoins />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Credits</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{user?.credits?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

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

                {/* Content Settings */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem' }}>
                            <FaExclamationTriangle style={{ margin: 'auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Content Settings</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>NSFW Profile</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mark your profile as Not Safe For Work. Visitors will see a warning content gate.</p>
                        </div>
                        <div
                            onClick={handleToggleNSFW}
                            style={{
                                width: '48px', height: '26px',
                                background: formData.isNSFW ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            <div style={{
                                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                position: 'absolute', top: '3px', left: formData.isNSFW ? '25px' : '3px', transition: '0.3s'
                            }} />
                        </div>
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

                {/* Referrals */}
                {referrer && (
                    <section className="glass-panel" style={{ padding: '32px', borderRadius: '32px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                <FaUserPlus style={{ margin: 'auto' }} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Referral Status</h2>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>You were referred by</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>@{referrer.referredBy.username}</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                        Code: {referrer.codeUsed}
                                    </span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Referral Active</p>
                            </div>
                        </div>
                    </section>
                )}

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
                                    onClick={() => window.location.href = `${API_BASE_URL}/auth/discord?token=${localStorage.getItem('vynn_token')}`}
                                    style={{
                                        padding: '10px 24px', borderRadius: '12px',
                                        background: '#5865F2', border: 'none',
                                        color: 'white', fontSize: '0.8125rem', fontWeight: 'bold',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        transition: '0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#4752C4'}
                                    onMouseOut={e => e.currentTarget.style.background = '#5865F2'}
                                >
                                    <FaDiscord /> Link Discord
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="glass-panel" style={{ padding: '32px', borderRadius: '32px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            <FaTrash style={{ margin: 'auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>Danger Zone</h2>
                    </div>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '24px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Delete Account</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Permanently remove your account and all data. This cannot be undone.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            style={{
                                padding: '12px 24px', borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444', fontSize: '0.875rem', fontWeight: 'bold',
                                cursor: 'pointer', transition: '0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                            Delete Account
                        </button>
                    </div>
                </section>
            </form>
        </div>
    );
};

export default Settings;
