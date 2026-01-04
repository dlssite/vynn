import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { FaMobileAlt, FaDesktop, FaExternalLinkAlt, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import api from '../../services/api';
import ProfileRenderer from '../../components/ProfileRenderer';

const LivePreview = () => {
    const { user } = useAuth();
    const { profileData, liveConfig, loading, previewMuted, setPreviewMuted } = useDashboard();
    const [viewMode, setViewMode] = useState('mobile');

    const profileUrl = user ? `/${user.username}` : '/';

    // Merge live config with fetched data
    const previewData = useMemo(() => {
        if (!profileData) return null;
        if (!liveConfig) return profileData;

        return {
            ...profileData,
            profile: {
                ...profileData.profile,
                ...liveConfig
            }
        };
    }, [profileData, liveConfig]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="preview-header">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Live Preview</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`btn-icon ${viewMode === 'mobile' ? 'text-white bg-white/10' : ''}`}
                        title="Mobile View"
                    >
                        <FaMobileAlt />
                    </button>
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`btn-icon ${viewMode === 'desktop' ? 'text-white bg-white/10' : ''}`}
                        title="Desktop View"
                    >
                        <FaDesktop />
                    </button>
                    <button
                        onClick={() => setPreviewMuted(!previewMuted)}
                        className={`btn-icon ${previewMuted ? 'text-orange-500' : ''}`}
                        title={previewMuted ? "Unmute Preview" : "Mute Preview"}
                    >
                        {previewMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon"
                        title="Open Live Page"
                    >
                        <FaExternalLinkAlt />
                    </a>
                </div>
            </div>

            <div className={`preview-viewport ${viewMode}-mode`}>
                {viewMode === 'mobile' ? (
                    <div className="mobile-frame">
                        <div className="mobile-notch" />
                        <div className="preview-content" style={{
                            height: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            borderRadius: '0 0 30px 30px',
                            background: '#000'
                        }}>
                            {previewData ? (
                                <ProfileRenderer
                                    key={`preview-mobile-${JSON.stringify(liveConfig?.themeConfig?.colors)}`}
                                    data={previewData}
                                    previewMode={true}
                                    isEntered={true}
                                    initialMuted={previewMuted}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted">
                                    Loading preview...
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="desktop-preview-container" style={{
                        width: '100%',
                        height: '100%',
                        background: '#000',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {previewData && (
                            <ProfileRenderer
                                key={`preview-desktop-${JSON.stringify(liveConfig?.themeConfig?.colors)}`}
                                data={previewData}
                                previewMode={true}
                                isEntered={true}
                                initialMuted={previewMuted}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivePreview;
