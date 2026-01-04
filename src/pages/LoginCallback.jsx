import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaAward } from 'react-icons/fa';

const LoginCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            handleLogin(token);
        } else {
            navigate('/login?error=discord_failed');
        }
    }, [location]);

    const handleLogin = async (token) => {
        try {
            await loginWithToken(token);
            navigate('/account');
        } catch (error) {
            console.error('Login error:', error);
            navigate('/login?error=discord_failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            color: 'white'
        }}>
            <FaAward className="animate-bounce" size={48} style={{ color: 'var(--accent-primary)', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Synchronizing Citizen DNA...</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Finalizing Discord connection.</p>
        </div>
    );
};

export default LoginCallback;
