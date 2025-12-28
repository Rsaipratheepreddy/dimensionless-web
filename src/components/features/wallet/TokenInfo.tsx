'use client';
import './TokenInfo.css';
import Image from 'next/image';
import { IconCoin, IconArrowRight, IconShield, IconUsers, IconTrendingUp } from '@tabler/icons-react';

const TokenInfo: React.FC = () => {
    const benefits = [
        {
            icon: IconShield,
            title: 'Secure & Transparent',
            description: 'Built on Polygon (ERC-20) blockchain'
        },
        {
            icon: IconUsers,
            title: 'Community Rewards',
            description: 'Earn DMN for participation and contributions'
        },
        {
            icon: IconTrendingUp,
            title: 'Real Value',
            description: 'Use DMN for art, services, and more'
        }
    ];

    return (
        <section className="token-info-section">
            <div className="token-container">
                <div className="token-content">
                    <div className="token-visual">
                        <div className="coin-wrapper">
                            <div className="coin-glow"></div>
                            <Image
                                src="/dimen-coin.png"
                                alt="DMN Token"
                                width={300}
                                height={300}
                                className="token-coin"
                            />
                        </div>
                    </div>

                    <div className="token-details">
                        <div className="token-badge">
                            <IconCoin size={16} stroke={2} />
                            <span>Web3 Digital Token</span>
                        </div>

                        <h2 className="token-title">
                            Dimens <span className="highlight">(DMN)</span>
                        </h2>

                        <p className="token-description">
                            DMN is a Web3 digital token powering the Dimensionless Creative Platform —
                            where art, tech, and community meet. Built on Polygon (ERC-20), DMN rewards
                            creators, learners, and collaborators, supporting real-world projects that
                            merge creativity with decentralized innovation.
                        </p>

                        <div className="token-price">
                            <span className="price-label">Current Price</span>
                            <span className="price-value">1 DMN = 800 INR</span>
                        </div>

                        <div className="token-benefits">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={index} className="benefit-item">
                                        <div className="benefit-icon">
                                            <Icon size={20} stroke={1.5} />
                                        </div>
                                        <div className="benefit-content">
                                            <h4 className="benefit-title">{benefit.title}</h4>
                                            <p className="benefit-description">{benefit.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="token-actions">
                            <button className="buy-token-btn">
                                <span>BUY DIMENS</span>
                                <IconArrowRight size={20} stroke={2} />
                            </button>
                            <button className="learn-more-btn">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>

                <div className="token-info-note">
                    <p>
                        You can buy any Art and Tech services by Dimensionless with Dimens (DMN)
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TokenInfo;
