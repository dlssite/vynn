import { motion } from 'framer-motion';
import { FaCheck, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProgressWidget = ({ steps }) => {
    const completedCount = steps.filter(s => s.done).length;
    const progress = Math.round((completedCount / steps.length) * 100);

    const handleAction = (step) => {
        if (step.action === 'discord' && !step.done) {
            // Discord auth flow handled by parent or specific logic.
            // For now, we assume the parent passed a wrapper or we handle it if link is missing.
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('vynn_token');
                window.location.href = `/api/auth/discord?token=${token}`;
            }
        }
    };

    return (
        <div className="glass-panel p-6 rounded-[24px] relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-bold">Profile Strength</h3>
                    <p className="text-xs text-secondary mt-1">Complete tasks to boost visibility.</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-orange-500">{progress}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
            </div>

            {/* Steps List */}
            <div className="flex flex-col gap-3">
                {steps.map((step, i) => {
                    const Wrapper = step.link ? Link : 'div';
                    const wrapperProps = step.link ? { to: step.link } : { onClick: () => handleAction(step) };

                    return (
                        <Wrapper
                            key={i}
                            {...wrapperProps}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${step.done
                                    ? 'bg-white/[0.02] border-transparent opacity-60 hover:opacity-100'
                                    : 'bg-white/5 border-white/5 hover:border-orange-500/30 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${step.done ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-secondary'
                                    }`}>
                                    <step.icon />
                                </span>
                                <span className={`text-sm font-medium ${step.done ? 'text-secondary line-through' : 'text-white'}`}>
                                    {step.label}
                                </span>
                            </div>

                            <div className="text-xs text-secondary">
                                {step.done ? (
                                    <FaCheck className="text-green-500" />
                                ) : (
                                    <FaChevronRight />
                                )}
                            </div>
                        </Wrapper>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressWidget;
