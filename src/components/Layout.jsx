import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, contentStyle = {} }) => {
    return (
        <div className="relative overflow-hidden flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
            {/* Ambient Background Glow */}
            <div className="ambient-glow" style={{ top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'rgba(255, 69, 0, 0.1)' }} />
            <div className="ambient-glow" style={{ bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'rgba(255, 140, 0, 0.1)' }} />

            <Navbar />

            <main className="relative z-10" style={{ paddingTop: '100px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px', ...contentStyle }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
