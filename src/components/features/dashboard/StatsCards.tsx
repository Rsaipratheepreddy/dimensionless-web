'use client';
import './StatsCards.css';
import { IconPalette, IconBrandFigma, IconCode, IconDotsVertical } from '@tabler/icons-react';

const StatsCards: React.FC = () => {
    const stats = [
        { icon: IconPalette, label: 'UI/UX Design', progress: '2/8 watched', color: '#8b5cf6', bg: '#f5f3ff' },
        { icon: IconBrandFigma, label: 'Branding', progress: '3/8 watched', color: '#ec4899', bg: '#fdf2f8' },
        { icon: IconCode, label: 'Front End', progress: '6/12 watched', color: '#0ea5e9', bg: '#f0f9ff' },
    ];

    return (
        <div className="stats-grid">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            <Icon size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-progress">{stat.progress}</span>
                            <h3 className="stat-label">{stat.label}</h3>
                        </div>
                        <button className="stat-more-btn">
                            <IconDotsVertical size={18} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;
