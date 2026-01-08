import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { referralAPI } from '../services/api';

const ReferralRedirect = () => {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const trackAndRedirect = async () => {
            try {
                // Tracking click on backend
                await referralAPI.trackClick(code);
            } catch (error) {
                console.error('Tracking error:', error);
            } finally {
                // Save to local storage for persistence across Discord flow
                localStorage.setItem('vynn_referrer', code);
                // Always redirect to signup with the ref code
                navigate(`/register?ref=${code}`);
            }
        };

        if (code) {
            trackAndRedirect();
        } else {
            navigate('/signup');
        }
    }, [code, navigate]);

    return (
        <div style={{
            height: '100vh',
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            color: 'white'
        }}>
            <SEO
                title="You've been invited!"
                description="Join Vynn today and claim your exclusive profile."
                url={`https://vynn.io/r/${code}`}
            />
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--accent)',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ opacity: 0.6, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                PREPARING YOUR INVITE...
            </p>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ReferralRedirect;
