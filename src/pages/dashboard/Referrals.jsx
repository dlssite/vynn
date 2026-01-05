import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaCheck, FaUsers, FaCoins, FaStar, FaGift } from 'react-icons/fa';
import { referralAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Referrals.css';

const Referrals = () => {
    const [loading, setLoading] = useState(true);
    const [codes, setCodes] = useState(null);
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [credits, setCredits] = useState(0);
    const [creditHistory, setCreditHistory] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [codeRes, statsRes, listRes, creditsRes, historyRes] = await Promise.all([
                referralAPI.getCode(),
                referralAPI.getStats(),
                referralAPI.getReferrals(),
                referralAPI.getCredits(),
                referralAPI.getCreditHistory()
            ]);

            setCodes(codeRes.data || {});
            setStats(statsRes.data || {});
            setReferrals(listRes.data || []);
            setCredits(creditsRes.data?.credits || 0);
            setCreditHistory(historyRes.data || []);
        } catch (error) {
            console.error('Error fetching referral data:', error);
            toast.error('Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    borderTop: '2px solid var(--accent)',
                    borderBottom: '2px solid var(--accent)',
                    borderLeft: '2px solid transparent',
                    borderRight: '2px solid transparent',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="referrals-container">
            {/* Header */}
            <div className="referrals-header">
                <h1>Referrals & Credits</h1>
                <p>Invite friends, earn credits, and unlock exclusive badges.</p>
            </div>

            {/* Top Cards Grid */}
            <div className="stats-grid">

                {/* Credit Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stat-card"
                >
                    <div className="stat-icon">
                        <FaCoins />
                    </div>
                    <div className="relative z-10">
                        <h3 className="stat-label">Your Balance</h3>
                        <div className="stat-value">
                            <span className="stat-number">{credits}</span>
                            <span className="stat-unit text-accent">CREDITS</span>
                        </div>
                        <p className="stat-meta">
                            Earn 50 credits per referral
                        </p>
                    </div>
                </motion.div>

                {/* Referral Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="relative z-10">
                        <h3 className="stat-label">Total Referrals</h3>
                        <div className="stat-value">
                            <span className="stat-number">{stats?.totalReferrals || 0}</span>
                            <span className="stat-unit text-green">USERS</span>
                        </div>
                        <div className="stat-meta">
                            <span style={{ fontWeight: 'bold', color: 'white' }}>{stats?.activeReferrals || 0}</span> Active •
                            <span style={{ fontWeight: 'bold', color: 'white', marginLeft: '4px' }}>{stats?.totalCreditsEarned || 0}</span> Credits Earned
                        </div>
                    </div>
                </motion.div>

                {/* Next Reward Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                    style={{ background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(255,255,255,0.03) 100%)' }}
                >
                    <div className="stat-icon">
                        <FaGift />
                    </div>
                    <div className="relative z-10">
                        <h3 className="stat-label">Next Milestone</h3>
                        <div className="flex flex-col gap-1">
                            <span className="text-xl font-bold text-white">
                                {stats?.totalReferrals < 5 ? 'Recruiter Badge' :
                                    stats?.totalReferrals < 25 ? 'Ambassador Badge' :
                                        stats?.totalReferrals < 100 ? 'Legend Badge' : 'Max Level!'}
                            </span>
                            <div className="progress-container">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${Math.min(100, (
                                            stats?.totalReferrals < 5 ? (stats?.totalReferrals / 5) * 100 :
                                                stats?.totalReferrals < 25 ? ((stats?.totalReferrals - 5) / 20) * 100 :
                                                    stats?.totalReferrals < 100 ? ((stats?.totalReferrals - 25) / 75) * 100 : 100
                                        ))}%`
                                    }}
                                />
                            </div>
                            <p className="stat-meta" style={{ marginTop: '8px' }}>
                                {stats?.totalReferrals < 5 ? `${5 - stats.totalReferrals} more to unlock` :
                                    stats?.totalReferrals < 25 ? `${25 - stats.totalReferrals} more to unlock` :
                                        stats?.totalReferrals < 100 ? `${100 - stats.totalReferrals} more to unlock` : 'You are a legend!'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Link Clicks Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                    style={{ background: 'linear-gradient(135deg, rgba(82, 82, 91, 0.4) 0%, rgba(255,255,255,0.03) 100%)' }}
                >
                    <div className="stat-icon" style={{ transform: 'rotate(-10deg)', opacity: 0.1 }}>
                        <FaStar />
                    </div>
                    <div className="relative z-10">
                        <h3 className="stat-label">Link Clicks</h3>
                        <div className="stat-value">
                            <span className="stat-number">{stats?.referralClicks || 0}</span>
                            <span className="stat-unit" style={{ color: '#a1a1aa' }}>CLICKS</span>
                        </div>
                        <p className="stat-meta">
                            Total referral link traffic
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Referral Codes */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="codes-section"
            >
                <h3 className="text-lg font-bold mb-4">Your Referral Codes</h3>
                <div className="codes-grid">
                    {/* Standard Code */}
                    <div className="code-card">
                        <div className="code-header">
                            <span className="code-label">Standard Code</span>
                            <span className="badge-pill">Permanent</span>
                        </div>
                        <div className="code-display">
                            <code className="code-text">
                                {codes?.referralCode}
                            </code>
                            <button
                                onClick={() => copyToClipboard(codes?.referralCode)}
                                className="copy-btn"
                            >
                                {copied ? <FaCheck className="text-green" /> : <FaCopy />}
                            </button>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Link:</span>
                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => copyToClipboard(`${window.location.origin}/r/${codes?.referralCode}`)}>
                                {window.location.host}/r/{codes?.referralCode}
                            </code>
                        </div>
                    </div>

                    {/* Premium Code */}
                    {codes?.isPremium ? (
                        <div className="code-card" style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, transparent 100%)', borderColor: 'rgba(234, 179, 8, 0.2)' }}>
                            <div className="code-header">
                                <span className="code-label text-accent" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaStar size={10} /> Premium Code
                                </span>
                                <span className="badge-pill" style={{ color: '#fcd34d', background: 'rgba(234, 179, 8, 0.2)' }}>Custom</span>
                            </div>
                            <div className="code-display">
                                <code className="code-text" style={{ borderColor: 'rgba(234, 179, 8, 0.3)', color: '#fcd34d' }}>
                                    {codes?.premiumReferralCode}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(codes?.premiumReferralCode)}
                                    className="copy-btn"
                                    style={{ color: '#fcd34d', background: 'rgba(234, 179, 8, 0.1)' }}
                                >
                                    {copied ? <FaCheck /> : <FaCopy />}
                                </button>
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'rgba(252, 211, 77, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Link:</span>
                                <code style={{ background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', color: '#fcd34d' }} onClick={() => copyToClipboard(`${window.location.origin}/r/${codes?.premiumReferralCode}`)}>
                                    {window.location.host}/r/{codes?.premiumReferralCode}
                                </code>
                            </div>
                        </div>
                    ) : (
                        <div className="code-card" style={{ borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                            <FaStar className="text-accent mb-2" size={20} />
                            <h4 className="font-bold text-sm">Premium Code Locked</h4>
                            <p className="stat-meta">Upgrade to Vynn+ to get a custom vynn+username code</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Content Tabs (Referrals / History) */}
            <div className="lists-grid">

                {/* Referrals List */}
                <div className="list-panel">
                    <div className="list-header">
                        <h3>Referred Users</h3>
                    </div>
                    <div className="table-container">
                        <table className="referral-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Joined</th>
                                    <th>Code Used</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.length > 0 ? (
                                    referrals.map((user) => (
                                        <tr key={user.id}>
                                            <td style={{ fontWeight: 500, color: 'white' }}>{user.username}</td>
                                            <td>
                                                {new Date(user.referredAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {user.codeUsed || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.rewardClaimed ? 'status-rewarded' : 'status-pending'}`}>
                                                    {user.rewardClaimed ? 'Rewarded' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                            No referrals yet. Share your code to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Credit History */}
                <div className="list-panel">
                    <div className="list-header">
                        <h3>Credit History</h3>
                    </div>
                    <div className="history-list">
                        {creditHistory.length > 0 ? (
                            creditHistory.map((tx, idx) => (
                                <div key={idx} className="history-item">
                                    <div className="history-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className={`history-tag ${tx.type === 'earned' || tx.type.includes('bonus') ? 'tag-earned' : 'tag-spent'}`}>
                                                {tx.type}
                                            </span>
                                            <span className="history-desc">{tx.description}</span>
                                        </div>
                                        <span className="history-date">
                                            {new Date(tx.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`history-amount ${tx.type === 'earned' || tx.type.includes('bonus') ? 'amount-plus' : 'amount-minus'}`}>
                                        {tx.type === 'earned' || tx.type.includes('bonus') ? '+' : '-'}{tx.amount}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                No credit history found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Referrals;
