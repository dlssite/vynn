import { useState } from 'react';
import { DashboardProvider } from '../../context/DashboardContext';
import Sidebar from '../../components/dashboard/Sidebar';
import MobileNav from '../../components/dashboard/MobileNav';
import LivePreview from './LivePreview';
import './Dashboard.css';

const DashboardLayoutContent = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    return (
        <div className="dashboard-container">
            {/* Mobile Header */}
            <MobileNav
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                showMobilePreview={showMobilePreview}
                setShowMobilePreview={setShowMobilePreview}
            />

            {/* Sidebar Overlay (Mobile) */}
            <div
                className={`sidebar-overlay lg:hidden ${mobileMenuOpen ? 'visible' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar Navigation */}
            <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            {/* Main Content Area (Split Screen) */}
            <main className="dashboard-main">
                {/* Editor Scroll Area */}
                <div className={`editor-area ${showMobilePreview ? 'hidden-mobile' : ''}`}>
                    {/* Ambient Glows specific to dashboard */}
                    <div className="ambient-glow" style={{ top: 0, left: 0, width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 69, 0, 0.05) 0%, transparent 70%)' }} />

                    <div className="editor-content">
                        {children}
                    </div>
                </div>

                {/* Live Preview */}
                <div className={`preview-area ${showMobilePreview ? 'active-mobile' : ''}`}>
                    <LivePreview />
                </div>
            </main>
        </div>
    );
};

const DashboardLayout = ({ children }) => (
    <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
);

export default DashboardLayout;
