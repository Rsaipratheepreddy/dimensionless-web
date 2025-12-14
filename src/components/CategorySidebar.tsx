'use client';
import './CategorySidebar.css';
import Image from 'next/image';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';

const CategorySidebar: React.FC = () => {
    const categories = [
        'Landscapes',
        'Animals',
        'Nature',
        'Abstracts',
        'Portraits',
        'Flowers'
    ];

    return (
        <aside className="category-sidebar">
            {/* Categories Section */}
            <div className="sidebar-section">
                <h3 className="section-title">CATEGORIES</h3>
                <div className="category-list">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`category-item ${index === 0 ? 'active' : ''}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <button className="list-art-btn">
                    <IconPlus size={16} stroke={2} />
                    <span>List Your Art</span>
                </button>
            </div>

            {/* DMN Token Info Section */}
            <div className="sidebar-section token-info-card">
                <div className="token-visual-small">
                    <Image
                        src="/dimen-coin.png"
                        alt="DMN Token"
                        width={100}
                        height={100}
                        className="token-coin-small"
                    />
                </div>
                <h3 className="token-name">Dimens (DMN)</h3>
                <div className="token-price-display">
                    <span className="price-label">Current Price</span>
                    <span className="price-amount">1 DMN = 800 INR</span>
                </div>
                <p className="token-desc">
                    Web3 digital token powering the Dimensionless platform on Polygon (ERC-20).
                </p>
                <button className="buy-dmn-btn">
                    <span>Buy Dimens</span>
                    <IconArrowRight size={16} stroke={2} />
                </button>
            </div>
        </aside>
    );
};

export default CategorySidebar;
