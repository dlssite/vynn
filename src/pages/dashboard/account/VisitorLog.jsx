import { useState, useEffect } from 'react';
import { FaDesktop, FaMobileAlt, FaClock, FaGlobe } from 'react-icons/fa';
import api from '../../../services/api';
import { formatDistanceToNow } from 'date-fns';

const VisitorLog = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
        // Poll every 15s for "Live" feel
        const interval = setInterval(fetchSessions, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/analytics/sessions');
            setSessions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load sessions', error);
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading && sessions.length === 0) {
        return <div className="p-8 text-center text-secondary">Loading visitor log...</div>;
    }

    return (
        <div className="glass-panel p-6" style={{ borderRadius: '24px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem' }}>
                <FaClock style={{ color: '#8b5cf6' }} /> Recent Visitors
            </h3>

            {sessions.length === 0 ? (
                <div className="text-secondary text-center py-8 text-sm">No recent visitors found</div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden-mobile overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '12px', fontWeight: '500' }}>Visitor</th>
                                    <th style={{ padding: '12px', fontWeight: '500' }}>Location</th>
                                    <th style={{ padding: '12px', fontWeight: '500' }}>Source</th>
                                    <th style={{ padding: '12px', fontWeight: '500' }}>Time</th>
                                    <th style={{ padding: '12px', fontWeight: '500', textAlign: 'right' }}>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: session.device === 'mobile' ? '#f97316' : '#3b82f6'
                                            }}>
                                                {session.device === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{session.visitorId}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{session.browser}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {session.countryCode === 'UN' ? <FaGlobe style={{ opacity: 0.5 }} /> : (
                                                    <img
                                                        src={`https://flagcdn.com/20x15/${session.countryCode.toLowerCase()}.png`}
                                                        alt={session.countryCode}
                                                        style={{ borderRadius: '2px' }}
                                                    />
                                                )}
                                                <span style={{ fontSize: '0.875rem' }}>{session.country}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                                            {session.referrer.length > 20 ? session.referrer.substring(0, 20) + '...' : session.referrer}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '500' }}>{formatDistanceToNow(new Date(session.startedAt), { addSuffix: true }).replace('about ', '')}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{session.activity}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                            {formatDuration(session.duration)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="show-mobile">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sessions.map((session) => (
                                <div key={session.id} style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ color: session.device === 'mobile' ? '#f97316' : '#3b82f6' }}>
                                                {session.device === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
                                            </div>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{session.visitorId}</span>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                            {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true }).replace('about ', '')}
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {session.countryCode === 'UN' ? <FaGlobe style={{ opacity: 0.5, fontSize: '0.8rem' }} /> : (
                                                <img
                                                    src={`https://flagcdn.com/20x15/${session.countryCode.toLowerCase()}.png`}
                                                    alt={session.countryCode}
                                                    style={{ borderRadius: '2px', width: '16px' }}
                                                />
                                            )}
                                            <span style={{ opacity: 0.8 }}>{session.country}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#8b5cf6' }}>
                                            {formatDuration(session.duration)}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                            {session.referrer === 'Direct' ? 'Direct Source' : session.referrer}
                                        </div>
                                        <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                                            {session.activity}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VisitorLog;
