import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ClickToEnter = ({ onEnter, children, text = "click to enter...", font = "'Courier New', monospace" }) => {
    const [entered, setEntered] = useState(false);

    const handleEnter = () => {
        setEntered(true);
        if (onEnter) onEnter();
    };

    return (
        <>
            <AnimatePresence>
                {!entered && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            background: '#050505', // Deep black
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#ffffff'
                        }}
                        onClick={handleEnter}
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                            style={{
                                fontFamily: font,
                                fontSize: '18px',
                                letterSpacing: '0.1em',
                                opacity: 0.8,
                                textAlign: 'center',
                                padding: '0 20px'
                            }}
                        >
                            {text}
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 
                We render children always, but maybe hidden or muted underneath?
                Actually, for the "reveal" effect, it's best if they are there 
                but covered. 
            */}
            <div style={{ opacity: entered ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
                {children}
            </div>
        </>
    );
};

export default ClickToEnter;
