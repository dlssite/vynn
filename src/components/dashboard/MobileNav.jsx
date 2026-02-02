import { FaPalette, FaHistory, FaBars, FaTimes } from 'react-icons/fa';

const MobileNav = ({ mobileMenuOpen, setMobileMenuOpen, showMobilePreview, setShowMobilePreview }) => {
    return (
        <header className="mobile-header lg:hidden">
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Toggle Menu"
            >
                {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            <span className="text-xl font-bold tracking-tight">
                V<span className="text-orange-500">ynn.</span>
            </span>

            <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showMobilePreview
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-white/80 hover:bg-white/5'
                    }`}
                aria-label="Toggle Preview"
            >
                {showMobilePreview ? <FaPalette size={18} /> : <FaHistory size={18} />}
            </button>
        </header>
    );
};

export default MobileNav;
