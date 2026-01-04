import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaUser, FaLink, FaPalette, FaTrophy, FaCog,
    FaSignOutAlt, FaExternalLinkAlt, FaPlus, FaTrash, FaDiscord
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Button from '../components/Button'

const Dashboard = () => {
    const { user, logout } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('profile')
    const [saving, setSaving] = useState(false)

    // Form states
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [newLink, setNewLink] = useState({ title: '', url: '' })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profiles/@me')
            setProfile(response.data.profile)
            setBio(response.data.profile.bio || '')
        } catch (error) {
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || user.username)
        }
    }, [user])

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            await api.put('/profiles/@me', { bio, displayName })
            toast.success('Profile saved!')
        } catch (error) {
            toast.error('Failed to save profile')
        } finally {
            setSaving(false)
        }
    }

    const handleAddLink = async (e) => {
        e.preventDefault()
        if (!newLink.title || !newLink.url) return

        try {
            const response = await api.post('/profiles/@me/links', newLink)
            setProfile({ ...profile, links: response.data.links })
            setNewLink({ title: '', url: '' })
            toast.success('Link added!')
        } catch (error) {
            toast.error('Failed to add link')
        }
    }

    const handleDeleteLink = async (linkId) => {
        try {
            const response = await api.delete(`/profiles/@me/links/${linkId}`)
            setProfile({ ...profile, links: response.data.links })
            toast.success('Link deleted')
        } catch (error) {
            toast.error('Failed to delete link')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-primary" style={{ background: 'var(--bg-primary)' }}>
                <div style={{ opacity: 0.5 }}>Loading Interface...</div>
            </div>
        )
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: FaUser },
        { id: 'links', label: 'Links', icon: FaLink },
        { id: 'theme', label: 'Theme', icon: FaPalette },
        { id: 'badges', label: 'Badges', icon: FaTrophy },
        { id: 'settings', label: 'Settings', icon: FaCog },
    ]

    const inputStyle = {
        width: '100%',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Background Glows */}
            <div className="ambient-glow" style={{ top: 0, left: 0, width: '500px', height: '500px', background: 'rgba(255, 69, 0, 0.05)' }} />
            <div className="ambient-glow" style={{ bottom: 0, right: 0, width: '500px', height: '500px', background: 'rgba(255, 140, 0, 0.05)' }} />

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100%',
                zIndex: 20
            }}>
                <Link to="/" style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl font-bold" style={{ letterSpacing: '-0.05em' }}>Vynn<span className="text-accent">.</span></span>
                </Link>

                <nav style={{ flex: 1, padding: '32px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                width: '100%',
                                transition: 'all 0.2s',
                                background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <tab.icon style={{ fontSize: '1.2rem' }} />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a
                        href={`/${user?.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', itemsCenter: 'center', gap: '12px', padding: '12px',
                            borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem',
                            alignItems: 'center'
                        }}
                    >
                        <FaExternalLinkAlt /> <span>View Page</span>
                    </a>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                            borderRadius: '12px', color: '#ef4444', fontSize: '0.9rem', width: '100%',
                            background: 'rgba(239, 68, 68, 0.05)'
                        }}
                    >
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: '260px', padding: '40px', position: 'relative', zIndex: 10 }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ marginBottom: '4px' }}>Dashboard</h1>
                        <p className="text-secondary text-sm">Welcome back, <span style={{ color: 'white', fontWeight: 500 }}>{user?.username}</span></p>
                    </div>
                </header>

                <div style={{ maxWidth: '900px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
                                    <h2 className="text-xl font-medium" style={{ marginBottom: '24px' }}>Profile Details</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <label className="text-xs font-bold text-muted" style={{ display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                style={inputStyle}
                                                maxLength={50}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted" style={{ display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                style={{ ...inputStyle, minHeight: '120px', resize: 'none' }}
                                                maxLength={500}
                                                placeholder="Tell the world about yourself..."
                                            />
                                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{bio.length}/500</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button onClick={handleSaveProfile} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'links' && (
                            <motion.div
                                key="links"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', marginBottom: '24px' }}>
                                    <h2 className="text-xl font-medium" style={{ marginBottom: '24px' }}>Add New Link</h2>
                                    <form onSubmit={handleAddLink} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', gap: '16px' }}>
                                        <input
                                            type="text"
                                            style={inputStyle}
                                            placeholder="Title"
                                            value={newLink.title}
                                            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                        />
                                        <input
                                            type="url"
                                            style={inputStyle}
                                            placeholder="https://example.com"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                        />
                                        <Button type="submit">
                                            <FaPlus />
                                        </Button>
                                    </form>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {profile?.links?.length === 0 && (
                                        <div className="text-center text-muted" style={{ padding: '48px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                                            No links yet. Start building your page!
                                        </div>
                                    )}
                                    {profile?.links?.map((link) => (
                                        <div key={link._id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, color: 'white' }}>{link.title}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{link.url}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '99px' }}>
                                                    {link.clicks} clicks
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteLink(link._id)}
                                                    style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: 'var(--text-muted)' }}
                                                    className="hover-text-red" // CSS class would act or inline active state, keeping simple
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {['theme', 'badges', 'settings'].includes(activeTab) && (
                            <motion.div
                                key="coming-soon"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-panel"
                                style={{ padding: '64px', borderRadius: '24px', textAlign: 'center' }}
                            >
                                <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    {activeTab === 'theme' && <FaPalette className="text-2xl text-secondary" />}
                                    {activeTab === 'badges' && <FaTrophy className="text-2xl text-secondary" />}
                                    {activeTab === 'settings' && <FaCog className="text-2xl text-secondary" />}
                                </div>
                                <h2 className="text-xl font-medium" style={{ marginBottom: '8px', textTransform: 'capitalize' }}>{activeTab}</h2>
                                <p className="text-secondary">This module is currently under development.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
