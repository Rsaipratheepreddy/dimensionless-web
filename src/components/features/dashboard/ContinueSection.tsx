'use client';
import React from 'react';
import './ContinueSection.css';
import { getOptimizedImageUrl } from '@/utils/image-optimization';

export interface CarouselItem {
    id?: string;
    title: string;
    artist: string;
    artistAvatar: string;
    category: string;
    image: string;
    price?: string;
    color: string;
    status?: string;
    selected_from?: string;
}

interface ContinueSectionProps {
    title: string;
    items: CarouselItem[];
    showPrice?: boolean;
    showAvatar?: boolean;
    buttonText?: string;
}

const ContinueSection: React.FC<ContinueSectionProps> = ({
    title,
    items,
    showPrice = true,
    showAvatar = true,
    buttonText = "Buy Now"
}) => {
    return (
        <section className="continue-section">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                <a href="#" className="view-more-link">View more</a>
            </div>

            <div className="continue-grid">
                {items.map((item, index) => {
                    const getLink = () => {
                        const type = (item as any).selected_from;
                        const id = (item as any).id;
                        if (!id || !type) return '#';
                        if (type === 'paintings') return `/buy-art/${id}`;
                        if (type === 'tattoo_designs') return `/tattoos/${id}`;
                        if (type === 'leasable_paintings') return `/art-leasing/${id}`;
                        return '#';
                    };

                    const isSold = item.status === 'sold';

                    return (
                        <div
                            key={index}
                            className={`continue-card ${isSold ? 'sold-out' : ''}`}
                            onClick={() => window.location.href = getLink()}
                        >
                            <img
                                src={getOptimizedImageUrl(item.image, { width: 600, format: 'webp' })}
                                alt={item.title}
                                className="card-background-image"
                            />

                            <div className="card-overlay-top">
                                {/* Heart button removed as per user request */}
                            </div>

                            <div className="card-overlay-bottom">
                                <h3 className="card-title-overlay">{item.title}</h3>

                                <div className="card-footer-overlay">
                                    {showAvatar && (
                                        <div className="artist-profile-overlay">
                                            <img
                                                src={getOptimizedImageUrl(item.artistAvatar || '/member-names.png', { width: 80, format: 'webp' })}
                                                alt={item.artist}
                                                className="artist-avatar-overlay"
                                            />
                                            <div className="artist-info-overlay">
                                                <span className="artist-name-overlay">{item.artist}</span>
                                                <span className="artist-label-overlay">Artist</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="card-action-row-overlay">
                                        {showPrice && item.price && (
                                            <span className="card-price-overlay">{item.price}</span>
                                        )}
                                        <button className={`buy-btn-overlay ${isSold ? 'btn-sold' : ''}`} disabled={isSold}>
                                            {isSold ? 'Sold' : buttonText}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default React.memo(ContinueSection);
