import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'
import api from '../services/api'
import ProfileRenderer from '../components/ProfileRenderer'

import ClickToEnter from '../components/ClickToEnter';
import SEO from '../components/SEO';
import { useAnalytics } from '../hooks/useAnalytics';

const Profile = () => {
    const { username } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [nsfwConfirmed, setNsfwConfirmed] = useState(false)
    const [isEntered, setIsEntered] = useState(false)

    // Analytics Hook
    const { startSession, trackClick } = useAnalytics(data?.profile?._id);

    const handleEnter = () => {
        setIsEntered(true);
        startSession();
    };

    useEffect(() => {
        fetchProfile()
    }, [username])

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/profiles/${username}`)
            setData(response.data)
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Profile not found')
            } else if (err.response?.status === 403) {
                setError('This profile is private')
            } else {
                setError('Something went wrong')
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
                <h1 className="text-2xl font-bold text-red-500">{error}</h1>
                <Link to="/" className="px-6 py-2 bg-orange-500 rounded-full font-bold hover:bg-orange-600 transition-colors">Go Home</Link>
            </div>
        )
    }

    // NSFW gate
    if (data.profile.isNSFW && !nsfwConfirmed) {
        return (
            <div style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.95)',
                backdropFilter: 'blur(10px)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    width: '100%', maxWidth: '420px',
                    background: 'linear-gradient(145deg, #111111, #0a0a0a)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '24px', padding: '40px',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    <div style={{
                        width: '80px', height: '80px', margin: '0 auto 24px auto',
                        background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FaExclamationTriangle size={32} color="#ef4444" />
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        Age Restricted Content
                    </h2>

                    <p style={{ color: '#a1a1aa', lineHeight: 1.6, marginBottom: '32px' }}>
                        This profile contains content marked as NSFW (Not Safe For Work).
                        You must be 18 years or older to view this page.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => setNsfwConfirmed(true)}
                            style={{
                                width: '100%', padding: '16px',
                                background: '#ef4444', color: 'white',
                                border: 'none', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s'
                            }}
                            onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        >
                            I am 18 or older
                        </button>

                        <Link
                            to="/"
                            style={{
                                display: 'block', width: '100%', padding: '16px',
                                background: 'rgba(255,255,255,0.05)', color: 'white',
                                textDecoration: 'none', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: 'bold',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            Go Back
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <ClickToEnter
            onEnter={handleEnter}
            text={data.profile.themeConfig?.entranceText}
            font={data.profile.themeConfig?.entranceFont}
        >
            {data?.profile && (
                <SEO
                    title={data.profile.username}
                    description={data.profile.bio || `Check out ${data.profile.username}'s profile on Vynn.`}
                    image={`${import.meta.env.VITE_VYNN_API_BASE || 'http://localhost:5001'}/api/og/profile/${username}`}
                    url={`https://vynn.io/${username}`}
                    type="profile"
                />
            )}
            <ProfileRenderer data={data} trackClick={trackClick} isEntered={isEntered} />
        </ClickToEnter>
    );
}

export default Profile
