import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
    const [profileData, setProfileData] = useState(null);
    const [liveConfig, setLiveConfig] = useState(null);
    const [uploadStats, setUploadStats] = useState({ uploadCount: 0, limit: 5 });
    const [loading, setLoading] = useState(true);
    const [previewMuted, setPreviewMuted] = useState(false);

    const fetchUploadStats = useCallback(async () => {
        try {
            const res = await api.get('/upload/stats');
            setUploadStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await api.get('/profiles/@me');
            setProfileData(res.data);
            setLoading(false);
            return res.data;
        } catch (error) {
            console.error('Failed to fetch profile', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
        fetchUploadStats();
    }, [fetchProfile, fetchUploadStats]);

    const updateProfileData = (updates) => {
        setProfileData(prev => {
            if (!prev) return prev;
            const newData = {
                ...prev,
                profile: {
                    ...prev.profile,
                    ...updates
                }
            };

            // Sync LiveConfig if themeConfig or displayedBadges are updated
            if (updates.themeConfig || updates.displayedBadges) {
                setLiveConfig(prevConfig => ({
                    ...prevConfig,
                    ...updates
                }));
            }

            return newData;
        });
    };

    return (
        <DashboardContext.Provider value={{
            profileData,
            setProfileData,
            updateProfileData,
            liveConfig,
            setLiveConfig,
            loading,
            fetchProfile,
            uploadStats,
            fetchUploadStats,
            previewMuted,
            setPreviewMuted
        }}>
            {children}
        </DashboardContext.Provider>
    );
};
