import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false,
    onClick,
    type = 'button',
    disabled = false
}) => {

    // Inline styles for dynamic variants could be moved to CSS classes but keeping it simple for now
    const getVariantStyle = (v) => {
        switch (v) {
            case 'primary': return {
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)'
            };
            case 'secondary': return {
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
            };
            case 'ghost': return {
                background: 'transparent',
                color: 'var(--text-secondary)'
            };
            case 'outline': return {
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff'
            };
            default: return {};
        }
    };

    const getSizeStyle = (s) => {
        switch (s) {
            case 'sm': return { padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px' };
            case 'md': return { padding: '12px 24px', fontSize: '0.875rem', borderRadius: '12px' };
            case 'lg': return { padding: '16px 32px', fontSize: '1rem', borderRadius: '12px' };
            default: return {};
        }
    };

    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        ...getVariantStyle(variant),
        ...getSizeStyle(size)
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.98 }}
            type={type}
            className={className}
            style={baseStyle}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
};

export default Button;
