'use client';
import React from 'react';
import { IconHeart, IconTrash, IconEdit } from '@tabler/icons-react';
import './ArtCard.css';
import { getOptimizedImageUrl } from '@/utils/image-optimization';

interface ArtCardProps {
    title: string;
    image: string;
    price: number;
    artistName?: string;
    artistAvatar?: string;
    showArtist?: boolean;
    status?: 'available' | 'sold' | 'hidden';
    onBuy?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    onClick?: () => void;
    isOwner?: boolean;
}

const ArtCard: React.FC<ArtCardProps> = ({
    title,
    image,
    price,
    artistName,
    artistAvatar,
    showArtist = true,
    status = 'available',
    onBuy,
    onDelete,
    onEdit,
    onClick,
    isOwner = false
}) => {
    return (
        <div className="art-card-premium" onClick={onClick}>
            <div className="art-card-image-wrap">
                <img
                    src={getOptimizedImageUrl(image || '/placeholder-art.png', { width: 500, format: 'webp' })}
                    alt={title}
                    className="art-card-img"
                />

                {/* Status Badge for Owner view */}
                {isOwner && (
                    <span className={`art-status-badge ${status}`}>
                        {status}
                    </span>
                )}

                {/* Top Action Buttons (Wishlist or Edit/Delete) */}
                <div className="art-card-actions-top">
                    {isOwner ? (
                        <>
                            <button className="art-action-btn edit" onClick={(e) => { e.stopPropagation(); onEdit?.(); }} title="Edit">
                                <IconEdit size={18} />
                            </button>
                            <button className="art-action-btn delete" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} title="Delete">
                                <IconTrash size={18} />
                            </button>
                        </>
                    ) : (
                        <button className="art-action-btn wishlist">
                            <IconHeart size={18} />
                        </button>
                    )}
                </div>

                {/* Main Overlay Content */}
                <div className="art-card-overlay">
                    <div className="art-card-info-main">
                        <h3 className="art-card-title">{title}</h3>

                        {showArtist && (
                            <div className="art-card-artist">
                                <img
                                    src={getOptimizedImageUrl(artistAvatar || '/founder1.png', { width: 60, format: 'webp' })}
                                    alt={artistName}
                                    className="art-artist-avatar"
                                />
                                <div className="art-artist-details">
                                    <span className="art-artist-name">{artistName || 'Unknown Artist'}</span>
                                    <span className="art-artist-label">Artist</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="art-card-footer">
                        <div className="art-card-price">
                            <span className="price-currency">₹</span>
                            <span className="price-amount">{price.toLocaleString()}</span>
                        </div>

                        {!isOwner && onBuy && (
                            <button className="art-buy-button" onClick={(e) => { e.stopPropagation(); onBuy(); }}>
                                View Details
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtCard;
