'use client';
import './CategorySidebar.css';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconPlus, IconDotsVertical, IconChevronRight, IconLoader2 } from '@tabler/icons-react';

const CategorySidebar: React.FC = () => {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const { count: followers } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', user?.id);

            const { count: following } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', user?.id);

            setStats({
                followers: followers || 0,
                following: following || 0
            });
        } catch (error) {
            console.error('Error fetching social stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = () => {
        if (!profile) return 0;
        let score = 0;
        const totalFields = 3;
        if (profile.full_name) score++;
        if (profile.avatar_url) score++;
        if (profile.bio) score++;
        return Math.round((score / totalFields) * 100);
    };

    const completionRate = calculateCompletion();
    const firstName = profile?.full_name?.split(' ')[0] || 'User';

    const mentors = [
        { name: "Padhang Satrio", role: "Mentor", avatar: "/founder1.png" },
        { name: "Zakir Horizontal", role: "Mentor", avatar: "/founder2.png" },
        { name: "Leonardo Samsul", role: "Mentor", avatar: "/ajay-founder.png" }
    ];

    return (
        <aside className="category-sidebar">
            <div className="sidebar-section stats-overview">
                <div className="section-header-row">
                    <h3 className="section-title">Statistic</h3>
                    <button className="more-btn"><IconDotsVertical size={18} /></button>
                </div>

                <div className="circular-progress-wrapper">
                    <div className="circular-progress" style={{ background: `conic-gradient(var(--color-primary) ${completionRate}%, var(--bg-secondary) 0)` }}>
                        <img
                            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5b4fe8&color=fff`}
                            alt="User"
                            className="progress-avatar"
                        />
                        <div className="percentage-badge">{completionRate}%</div>
                    </div>
                    <div className="welcome-text">
                        <h4>Welcome {firstName} 🔥</h4>
                        <p>{completionRate < 100 ? 'Complete your profile to achieve your target!' : 'Your profile looks great! Keep learning.'}</p>
                    </div>
                </div>

                <div className="user-social-stats">
                    <div className="stat-item">
                        <span className="stat-value">{stats.followers > 1000 ? (stats.followers / 1000).toFixed(1) + 'k' : stats.followers}</span>
                        <span className="stat-label">Followers</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.following}</span>
                        <span className="stat-label">Following</span>
                    </div>
                </div>
            </div>

            <div className="sidebar-section token-card">
                <div className="token-coin-header">
                    <img src="/dimen-coin.png" alt="Dimens Coin" className="token-coin-img" />
                </div>

                <div className="token-info">
                    <h3 className="token-name">Dimens (DMN)</h3>

                    <div className="token-price-box">
                        <span className="price-label">CURRENT PRICE</span>
                        <span className="price-value">1 DMN = 800 INR</span>
                    </div>

                    <div className="token-graph-wrapper">
                        <svg viewBox="0 0 200 60" className="token-graph">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
                                    <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,48 C20,48 35,30 50,45 C65,60 85,25 110,40 C135,55 155,10 180,35 C190,45 195,30 200,38"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M0,48 C20,48 35,30 50,45 C65,60 85,25 110,40 C135,55 155,10 180,35 C190,45 195,30 200,38 V60 H0 Z"
                                fill="url(#gradient)"
                            />
                        </svg>
                    </div>

                    <p className="token-description">
                        Web3 digital token powering the Dimensionless platform on Polygon (ERC-20).
                    </p>

                    <button className="buy-token-btn">
                        Buy Dimens <IconChevronRight size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default CategorySidebar;
