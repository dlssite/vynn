import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'
import api from '../services/api'
import ProfileRenderer from '../components/ProfileRenderer'
import './Profile.css'

import ClickToEnter from '../components/ClickToEnter';
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
            <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
                <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
                    <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Age Restricted Content</h2>
                    <p className="text-gray-400 mb-6">This profile may contain content not suitable for all ages.</p>
                    <div className="flex flex-col gap-3">
                        <button
                            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors"
                            onClick={() => setNsfwConfirmed(true)}
                        >
                            I am 18 or older
                        </button>
                        <Link to="/" className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Go Back</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <ClickToEnter onEnter={handleEnter}>
            <ProfileRenderer data={data} trackClick={trackClick} isEntered={isEntered} />
        </ClickToEnter>
    );
}

export default Profile
