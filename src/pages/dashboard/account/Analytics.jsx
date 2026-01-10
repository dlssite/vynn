import { useState, useEffect } from 'react';
import {
    FaEye, FaGlobe, FaMobileAlt, FaDesktop, FaClock,
    FaChartLine, FaArrowUp, FaArrowDown, FaMapMarkerAlt, FaLink, FaDiscord
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import VisitorLog from './VisitorLog';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [loading, setLoading] = useState(true);

    // Real Data State
    const [stats, setStats] = useState({
        totalViews: '0',
        uniqueVisitors: '0',
        ctr: '0%',
        avgTime: '0m 0s',
        bounceRate: '0%',
        liveVisitors: 0
    });
    const [viewsData, setViewsData] = useState([]);
    const [devices, setDevices] = useState([]);
    const [locations, setLocations] = useState([]);
    const [referrers, setReferrers] = useState([]);
    const [linkPerformance, setLinkPerformance] = useState([]);

    useEffect(() => {
        fetchAnalytics();

        // Refresh live count every 30s
        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [timeRange]);

    const fetchAnalytics = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get(`/analytics/stats?timeRange=${timeRange}`);

            // Assuming res.data structure matches our backend response
            setStats(res.data.stats);
            setViewsData(res.data.viewsData);
            setDevices(res.data.devices);
            setLocations(res.data.locations);
            setReferrers(res.data.referrers);
            setLinkPerformance(res.data.linkPerformance || []);

        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Chart Dimensions
    const maxView = Math.max(...(viewsData.map(d => d.views) || [0, 10])); // Avoid NaN
    const points = viewsData.map((d, i) => {
        const x = (i / (Math.max(viewsData.length - 1, 1))) * 100;
        const y = 100 - (d.views / (maxView || 1)) * 100; // Avoid divide by zero
        return `${x},${y}`;
    }).join(' ');

    const polygonPoints = `0,100 ${points} 100,100`;

    if (loading && !stats.totalViews) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-10">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="text-secondary">Performance metrics for <span style={{ color: 'white', fontWeight: '500' }}>{timeRange === '7d' ? 'the last 7 days' : timeRange}</span></p>
                </div>

                <div className="time-range-selector">
                    {['24h', '7d', '30d'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="dash-grid grid-cols-1 md-cols-2 lg-cols-5 mb-8">
                <MetricCard
                    label="Total Views" value={stats.totalViews}
                    change="" icon={FaEye} color="#3b82f6"
                />
                <MetricCard
                    label="Unique Visitors" value={stats.uniqueVisitors}
                    change="" icon={FaChartLine} color="#f97316"
                />
                <MetricCard
                    label="Discord Joins" value={stats.discordJoins || '0'}
                    change="" icon={FaDiscord} color="#5865F2"
                />
                <MetricCard
                    label="Avg. Session" value={stats.avgTime}
                    change="" icon={FaClock} color="#8b5cf6"
                />
                <MetricCard
                    label="Click Rate" value={stats.ctr}
                    change="" icon={FaGlobe} color="#10b981"
                />
            </div>

            {/* Main Interactive Chart */}
            <div className="glass-panel p-8 mb-8" style={{ borderRadius: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '4px' }}>Views Overview</h3>
                        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Engagement over time</p>
                    </div>
                    <div className="live-indicator">
                        <div className="live-dot" />
                        {stats.liveVisitors} Live Now
                    </div>
                </div>

                <div style={{ position: 'relative', height: '300px', width: '100%' }} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Y-Axis Grid Lines */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                        {[100, 75, 50, 25, 0].map((tick, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
                                <span style={{ fontSize: '10px', color: 'rgba(161, 161, 161, 0.3)', width: '20px' }}>{Math.round((maxView * tick) / 100)}</span>
                                <div style={{ height: '1px', flex: 1, borderTop: '1px dashed rgba(255, 255, 255, 0.05)' }} />
                            </div>
                        ))}
                    </div>

                    {/* SVG Chart */}
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', paddingTop: '8px', paddingLeft: '32px', paddingBottom: '24px', overflow: 'visible' }} preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        <motion.polygon
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            points={polygonPoints}
                            fill="url(#chartGradient)"
                        />

                        <motion.polyline
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            points={points}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />

                        {viewsData.map((d, i) => {
                            const x = (i / (Math.max(viewsData.length - 1, 1))) * 100;
                            const y = 100 - (d.views / (maxView || 1)) * 100;
                            return (
                                <g key={i}>
                                    <circle
                                        cx={x} cy={y} r="2"
                                        fill="transparent"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredPoint({ ...d, x, y })}
                                    />
                                    <circle
                                        cx={x} cy={y} r="0.8"
                                        fill="#fff"
                                        stroke="#f97316"
                                        strokeWidth="0.2"
                                        style={{
                                            pointerEvents: 'none',
                                            transition: 'all 0.3s ease',
                                            opacity: hoveredPoint?.day === d.day ? 1 : 0.6,
                                            transformOrigin: `${x}px ${y}px`,
                                            transform: hoveredPoint?.day === d.day ? 'scale(1.5)' : 'scale(1)'
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tooltip */}
                    {hoveredPoint && (
                        <div
                            className="chart-tooltip"
                            style={{
                                position: 'absolute',
                                left: `${hoveredPoint.x}%`,
                                top: `${hoveredPoint.y}%`,
                                transform: 'translate(-50%, -120%)'
                            }}
                        >
                            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{hoveredPoint.day}</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {hoveredPoint.views} <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 'normal' }}>views</span>
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '32px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {viewsData.map((d, i) => (
                        <span key={i}>{d.day}</span>
                    ))}
                </div>
            </div>

            {/* Breakdown Section */}
            <div className="dash-grid grid-cols-1 lg-cols-3">
                {/* Locations */}
                <div className="glass-panel p-6" style={{ borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem' }}>
                        <FaMapMarkerAlt style={{ color: '#f97316' }} /> Locations
                    </h3>
                    {locations.length === 0 ? (
                        <div className="text-secondary text-center my-auto text-sm">No location data yet</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                            {locations.map((loc, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                                            <span style={{ fontSize: '1.25rem' }}>{loc.code === 'UN' ? '❓' : (
                                                // Simple flag mapping or just use code
                                                `https://flagcdn.com/20x15/${loc.code.toLowerCase()}.png` ? <img src={`https://flagcdn.com/20x15/${loc.code.toLowerCase()}.png`} alt={loc.code} /> : loc.code
                                            )}</span> {loc.code}
                                        </span>
                                        <span style={{ fontWeight: 'bold', color: 'white', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{loc.percent}%</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${loc.percent}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="progress-bar-fill"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Device & Sources */}
                <div className="lg-span-2">
                    <div className="dash-grid grid-cols-1 md-cols-2" style={{ height: '100%' }}>
                        {/* Device Distribution */}
                        <div className="glass-panel p-6" style={{ borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem' }}>
                                <FaMobileAlt style={{ color: '#3b82f6' }} /> Devices
                            </h3>

                            {devices.length === 0 ? (
                                <div className="text-secondary text-center my-auto text-sm">No device data yet</div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', padding: '32px 0' }}>
                                    {devices.map((dev, i) => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div className="device-bar-container">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${dev.percent}%` }}
                                                    style={{ width: '100%', background: dev.label === 'Mobile' ? '#f97316' : '#3b82f6', opacity: 0.8 }}
                                                />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{dev.percent}%</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500' }}>{dev.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Referrers */}
                        <div className="glass-panel p-6" style={{ borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem' }}>
                                <FaGlobe style={{ color: '#8b5cf6' }} /> Sources
                            </h3>
                            {referrers.length === 0 ? (
                                <div className="text-secondary text-center my-auto text-sm">No source data yet</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', flex: 1 }}>
                                    {referrers.map((ref, i) => (
                                        <div key={i} className="source-item">
                                            <div
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.125rem', background: `rgba(139, 92, 246, 0.2)`, color: '#8b5cf6'
                                                }}
                                            >
                                                {ref.source[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{ref.source}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{ref.count} visitors</div>
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{ref.percent}%</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Performance Section */}
            <div className="glass-panel p-8 mb-8" style={{ borderRadius: '24px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem' }}>
                    <FaLink style={{ color: '#ec4899' }} /> Top Links
                </h3>
                {linkPerformance.length === 0 ? (
                    <div className="text-secondary text-center py-8 text-sm">No link click data yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Link</th>
                                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Clicks</th>
                                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {linkPerformance.map((link, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold', color: 'white' }}>{link.label}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{link.url}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {link.clicks}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '6px',
                                                background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', fontWeight: 'bold', fontSize: '0.75rem'
                                            }}>
                                                {link.ctr}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Visitor Log Section */}
            <VisitorLog />
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ label, value, change, isNegative, icon: Icon, color }) => (
    <div className="stat-card">
        <div className="stat-card-icon-bg" style={{ color }}>
            <Icon />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '1.125rem', color }}>
                    <Icon />
                </div>
                <p className="stat-card-label" style={{ margin: 0 }}>{label}</p>
            </div>

            <div style={{ marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', margin: 0 }}>{value}</h2>
            </div>

            {/* 
                For V1, we don't calculate "Change vs last week" accurately yet on backend, 
                so we might hide this or leave blank if change is empty string
            */}
            {change && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold',
                    color: isNegative ? '#f87171' : '#4ade80',
                    background: isNegative ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)'
                }}>
                    {isNegative ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />}
                    {change}
                </div>
            )}
        </div>
    </div>
);

export default Analytics;
