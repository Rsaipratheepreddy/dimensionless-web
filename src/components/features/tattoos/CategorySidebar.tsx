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

            <div className="sidebar-section token-card finance-card">
                <div className="section-header-row">
                    <h3 className="section-title">Your Finance</h3>
                    <button className="more-btn"><IconDotsVertical size={18} /></button>
                </div>

                <div className="finance-balance-box">
                    <span className="balance-label">Total Balance</span>
                    <div className="balance-value-row">
                        <span className="balance-amount">28,672</span>
                        <span className="balance-decimal">.10</span>
                        <span className="balance-currency-text">Rupees</span>
                        <span className="balance-change">+61.2%</span>
                    </div>
                </div>

                <div className="token-graph-wrapper">
                    <svg viewBox="0 0 200 60" className="token-graph">
                        <path
                            d="M0,45 C30,45 40,20 60,35 C80,50 100,10 130,25 C160,40 180,5 200,20"
                            fill="none"
                            stroke="#c3ff00"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <circle cx="60" cy="35" r="4" fill="#c3ff00" />
                        <circle cx="130" cy="25" r="4" fill="#c3ff00" />
                        <circle cx="200" cy="20" r="4" fill="#c3ff00" />
                    </svg>
                </div>

                <button className="top-up-btn">
                    Top Up Balance <IconPlus size={18} />
                </button>
            </div>

            <div className="sidebar-section creators-section">
                <div className="section-header-row">
                    <h3 className="section-title">Featured Creators</h3>
                    <button className="view-all-link">See All <IconChevronRight size={14} /></button>
                </div>

                <div className="creators-list">
                    {mentors.map((mentor, i) => (
                        <div key={i} className="creator-item">
                            <img src={mentor.avatar} alt={mentor.name} className="creator-avatar" />
                            <div className="creator-info">
                                <span className="creator-name">{mentor.name}</span>
                                <span className="creator-type">Creator</span>
                            </div>
                            <button className="follow-btn">Follow</button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default CategorySidebar;
