'use client';
import { IconHeart } from '@tabler/icons-react';
import Image from 'next/image';
import React from 'react';
import './ArtCard.css';

interface ArtCardProps {
    id: string;
    title: string;
    image: string;
    price: number;
    secondaryPrice?: string;
    currency?: string;
    artistName?: string;
    artistAvatar?: string;
    isVerified?: boolean;
    allowPurchase?: boolean;
    allowLease?: boolean;
    status?: 'available' | 'sold' | 'leased' | 'hidden';
    onBuyNow?: (e: React.MouseEvent) => void;
    onLeaseNow?: (e: React.MouseEvent) => void;
    onClick?: () => void;
}

const ArtCard: React.FC<ArtCardProps> = ({
    id,
    title,
    image,
    price,
    secondaryPrice,
    currency = 'INR',
    artistName,
    artistAvatar,
    isVerified = true,
    allowPurchase = true,
    allowLease = false,
    status = 'available',
    onBuyNow,
    onLeaseNow,
    onClick
}) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleBuyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onBuyNow) onBuyNow(e);
    };

    const handleLeaseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onLeaseNow) onLeaseNow(e);
    };

    return (
        <div className="nft-art-card" onClick={onClick}>
            <div className={`nft-image-container ${imageLoaded ? 'loaded' : ''}`}>
                <Image
                    src={image || '/placeholder-art.png'}
                    alt={title}
                    className="nft-main-img"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={false}
                    onLoad={() => setImageLoaded(true)}
                    style={{ objectFit: 'cover' }}
                />

                <div className="nft-top-actions">
                    <div /> {/* Spacer */}
                    <button className="nft-icon-btn shadow wishlist" onClick={(e) => e.stopPropagation()}>
                        <IconHeart size={20} />
                    </button>
                </div>
            </div>

            <div className="nft-card-content">
                <h3 className="nft-title" title={title}>{title}</h3>

                <div className="nft-price-row">
                    <div className="nft-primary-price">
                        <span className="price-label">Price:</span>
                        <span className="price-val">{price.toLocaleString()} {currency === 'INR' ? '₹' : currency}</span>
                    </div>
                    {secondaryPrice && (
                        <div className="nft-secondary-price">
                            {secondaryPrice}
                        </div>
                    )}
                </div>

                <div className="nft-card-actions">
                    {allowPurchase ? (
                        <button className="nft-btn btn-buy" onClick={handleBuyClick}>
                            Buy Now
                        </button>
                    ) : allowLease ? (
                        <button className="nft-btn btn-buy" onClick={handleLeaseClick}>
                            Lease Now
                        </button>
                    ) : (
                        <button className="nft-btn btn-buy">
                            View Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtCard;
