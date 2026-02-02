import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTrash, FaTimes } from 'react-icons/fa';
import './ConfirmModal.css';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action may be irreversible.",
    confirmText = "CONFIRM",
    declineText = "DECLINE",
    variant = "danger", // danger, warning, info
    requirePrompt = false,
    promptText = "DELETE"
}) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleConfirm = () => {
        if (requirePrompt && inputValue !== promptText) return;
        onConfirm();
        onClose();
        setInputValue('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="confirm-modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`confirm-modal-container ${variant}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="prism-glow" />

                        <div className="confirm-header">
                            <div className="confirm-icon-wrapper">
                                {variant === 'danger' ? <FaTrash /> : <FaExclamationTriangle />}
                            </div>
                            <button className="confirm-close" onClick={onClose}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="confirm-body">
                            <h2 className="confirm-title">{title}</h2>
                            <p className="confirm-message">{message}</p>

                            {requirePrompt && (
                                <div className="confirm-prompt-group">
                                    <label className="prompt-label">Type <span className="highlight">"{promptText}"</span> to confirm</label>
                                    <input
                                        type="text"
                                        className="vynn-input"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder={`Type ${promptText}...`}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        <div className="confirm-footer">
                            <button className="confirm-btn-secondary" onClick={onClose}>
                                {declineText}
                            </button>
                            <button
                                className={`confirm-btn-primary ${variant}`}
                                onClick={handleConfirm}
                                disabled={requirePrompt && inputValue !== promptText}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
