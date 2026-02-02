import { FiZap } from "react-icons/fi";
import styles from "./ServerCard.module.css";

// Note: Using a standard <a> tag for external navigation to the servers app, or react-router Link if internal.
// The user said: "button to visit it from which they can then enter the server dashboard"
// This implies the servers app is separate (Next.js) and we are currently in Frontend (Vite).
// We should probably link to the Next.js app URL. Assuming localhost:3000 for development.

const SERVERS_APP_URL = import.meta.env.VITE_SERVERS_URL || 'http://localhost:3000';

export default function ServerCard({ server, compact = false }) {
    // Safe defaults
    const {
        name = "Unknown Server",
        slug,
        guildId,
        _id,
        icon = null,
        banner = null,
        memberCount = 0,
        description = "No description provided.",
        tags = [],
        isVerified = false,
        isPro = false
    } = server || {};

    const targetSlug = slug || guildId || _id;

    // Format member count
    const formattedMembers = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(memberCount);

    return (
        <div className={`${styles.card} glass-panel ${isPro ? styles.pro : ''} ${compact ? styles.compact : ''}`}>
            {isPro && <div className={styles.proBadge}>PRO</div>}
            <div className={styles.banner}>
                {banner ? (
                    <img src={banner} alt={`${name} banner`} className={styles.bannerImage} loading="lazy" />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #222)' }}></div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    {icon ? (
                        <img src={icon} alt={name} className={styles.icon} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                    )}
                </div>

                <div className={styles.header}>
                    <h3 className={styles.name} title={name}>{name}</h3>
                    <div className={styles.members}>
                        <span className={styles.online}></span>
                        {formattedMembers} Members
                    </div>
                </div>

                <p className={styles.tagline}>{description}</p>

                <div className={styles.tags}>
                    {tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className={styles.tag}>#{tag}</span>
                    ))}
                </div>

                <div className={styles.footer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div className="flex gap-2">
                        {isVerified && (
                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                Verified
                            </div>
                        )}
                        {server.boostLevel > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#f47fff', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(244, 127, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(244, 127, 255, 0.2)', whiteSpace: 'nowrap' }}>
                                <FiZap /> Lvl {server.boostLevel}
                            </div>
                        )}
                    </div>
                    {/* External Link to Servers App */}
                    <a
                        href={`${SERVERS_APP_URL}/servers/${targetSlug}`}
                        className={styles.joinBtn}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Server
                    </a>
                </div>
            </div>
        </div>
    );
}
