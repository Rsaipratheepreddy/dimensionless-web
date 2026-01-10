import Image from 'next/image';
import React from 'react';
import './HeroBanner.css';

const HeroBanner: React.FC = () => {
    return (
        <div className="hero-banner-container">
            <div className="hero-banner-left">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Buy and Lease the Latest Premium Art Works
                    </h1>
                    <button className="hero-explore-btn">
                        Explore Now
                    </button>
                </div>
                <div className="hero-image">
                    <Image
                        src="/painting.png"
                        alt="Premium Artwork"
                        className="hero-img"
                        width={600}
                        height={600}
                        priority
                    />
                </div>
            </div>

            <div className="hero-banner-right">
                <div className="dimen-card">
                    <div className="dimen-top">
                        <div className="dimen-title-row">
                            <Image
                                src="/dimen-coin.png"
                                alt="Dimen Coin"
                                className="dimen-icon-small"
                                width={32}
                                height={32}
                            />
                            <span className="dimen-name">Dimens (DMN)</span>
                        </div>
                        <div className="dimen-price-display">
                            <div className="price-row">
                                <span className="price-dmn">1 DMN</span>
                                <span className="price-sep">=</span>
                                <span className="price-inr">₹800</span>
                            </div>
                        </div>
                    </div>

                    <div className="dimen-graph-section">
                        <svg viewBox="0 0 320 100" className="dimen-graph-svg">
                            <defs>
                                <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,70 Q40,55 80,60 T160,50 T240,55 T320,45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <path
                                d="M0,70 Q40,55 80,60 T160,50 T240,55 T320,45 L320,100 L0,100 Z"
                                fill="url(#graphGradient)"
                            />
                            <circle cx="80" cy="60" r="4" fill="#10b981" />
                            <circle cx="160" cy="50" r="4" fill="#10b981" />
                            <circle cx="240" cy="55" r="4" fill="#10b981" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
