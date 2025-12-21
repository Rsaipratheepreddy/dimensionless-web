'use client';
import './CategorySidebar.css';
import { IconPlus, IconDotsVertical, IconChevronRight } from '@tabler/icons-react';

const CategorySidebar: React.FC = () => {
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
                    <div className="circular-progress">
                        <img src="/ajay-founder.png" alt="User" className="progress-avatar" />
                        <div className="percentage-badge">32%</div>
                    </div>
                    <div className="welcome-text">
                        <h4>Good Morning Jason 🔥</h4>
                        <p>Continue your learning to achieve your target!</p>
                    </div>
                </div>

                <div className="user-social-stats">
                    <div className="stat-item">
                        <span className="stat-value">52k</span>
                        <span className="stat-label">Followers</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">824</span>
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
