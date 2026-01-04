'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    IconStarFilled,
    IconShoppingBag,
    IconTruck,
    IconCheck,
    IconHeart,
    IconPlus,
    IconMinus,
    IconMapPin,
    IconArrowLeft,
    IconShare,
    IconCertificate
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase-client';
import AppLayout from '@/components/layout/AppLayout';
import LottieLoader from '@/components/ui/LottieLoader';
import Link from 'next/link';
import ReviewSection from '@/components/features/artworks/ReviewSection';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import './ProductDetails.css';

interface ArtworkImage {
    image_url: string;
    is_primary: boolean;
}

interface Artwork {
    id: string;
    title: string;
    description: string;
    about: string;
    purchase_price: number;
    lease_monthly_rate: number;
    artist_id: string;
    artist_name: string;
    category: string;
    origin: string;
    design_style: string;
    delivery_info: string;
    variants: any[];
    stock_quantity: number;
    avg_rating: number;
    total_reviews: number;
    artwork_images: ArtworkImage[];
    allow_purchase: boolean;
    allow_lease: boolean;
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const initialQty = parseInt(searchParams.get('qty') || '1');

    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
    const [quantity, setQuantity] = useState(initialQty);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('description');

    const supabase = createClient();
    const { addToCart } = useCart();
    const router = useRouter();

    const fetchData = useCallback(async () => {
        const [artworkRes, reviewsRes] = await Promise.all([
            supabase
                .from('artworks')
                .select('*, artwork_images(*)')
                .eq('id', id)
                .single(),
            supabase
                .from('artwork_reviews')
                .select('*, profiles(full_name, avatar_url)')
                .eq('artwork_id', id)
                .order('created_at', { ascending: false })
        ]);

        if (artworkRes.data) {
            setArtwork(artworkRes.data);
            if (!selectedVariant && artworkRes.data.variants?.length > 0) {
                setSelectedVariant(artworkRes.data.variants[0].name);
            }
        }
        if (reviewsRes.data) {
            setReviews(reviewsRes.data);
        }
        setLoading(false);
    }, [id, supabase, selectedVariant]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;
    if (!artwork) return <AppLayout><div className="error-center">Artwork not found.</div></AppLayout>;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y, show: true });
    };

    const handleAddToCart = () => {
        if (!artwork) return;

        const cartKey = `${artwork.id}-${selectedVariant || 'default'}`;
        addToCart({
            id: artwork.id,
            cartKey,
            title: artwork.title,
            price: artwork.purchase_price,
            image_url: artwork.artwork_images?.find(img => img.is_primary)?.image_url || artwork.artwork_images?.[0]?.image_url,
            artist_id: artwork.artist_id,
            artist_name: artwork.artist_name,
            quantity,
            variant: selectedVariant || undefined
        });
        toast.success(`Added ${quantity} ${artwork.title} to cart`);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/checkout');
    };

    return (
        <AppLayout>
            <div className="product-page-container">
                <div className="breadcrumb">
                    <Link href="/buy-art" className="back-link"><IconArrowLeft size={18} /> Back to Gallery</Link>
                    <span className="separator">/</span>
                    <span className="category">{artwork.category}</span>
                </div>

                <div className="product-grid">
                    {/* Left: Image Gallery */}
                    <div className="image-section">
                        <div className="thumbnail-rail">
                            {artwork.artwork_images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`thumb-card ${activeImage === i ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveImage(i)}
                                >
                                    <img src={img.image_url} alt={`Thumbnail ${i}`} />
                                </div>
                            ))}
                        </div>

                        <div
                            className="main-preview-container"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setZoomPos(prev => ({ ...prev, show: false }))}
                        >
                            <img
                                src={artwork.artwork_images[activeImage]?.image_url}
                                alt={artwork.title}
                                className="main-img"
                            />
                            {zoomPos.show && (
                                <div
                                    className="zoom-overlay"
                                    style={{
                                        backgroundImage: `url(${artwork.artwork_images[activeImage]?.image_url})`,
                                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="info-section">
                        <div className="header-meta">
                            <h1 className="product-title">{artwork.title}</h1>
                            <div className="rating-summary">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <IconStarFilled
                                            key={i}
                                            size={16}
                                            color={i < Math.floor(artwork.avg_rating) ? '#f59e0b' : '#e2e8f0'}
                                        />
                                    ))}
                                </div>
                                <span className="rating-val">{artwork.avg_rating}</span>
                                <span className="review-count">({artwork.total_reviews} reviews)</span>
                            </div>
                        </div>

                        <div className="specs-grid">
                            <div className="spec-item">
                                <span className="label">Made in:</span>
                                <span className="val">{artwork.origin || 'Australia'}</span>
                            </div>
                            <div className="spec-item">
                                <span className="label">Design:</span>
                                <span className="val">{artwork.design_style || 'Modern'}</span>
                            </div>
                            <div className="spec-item">
                                <span className="label">Delivery:</span>
                                <span className="val">{artwork.delivery_info || '2-3 days delivery'}</span>
                            </div>
                        </div>

                        {artwork.variants?.length > 0 && (
                            <div className="variant-section">
                                <label>Screen size / Finish</label>
                                <div className="variant-chips">
                                    {artwork.variants.map((v: any, i: number) => (
                                        <button
                                            key={i}
                                            className={`variant-chip ${selectedVariant === v.name ? 'active' : ''}`}
                                            onClick={() => setSelectedVariant(v.name)}
                                        >
                                            {v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="quantity-section">
                            <label>Quantity</label>
                            <div className="qty-picker">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><IconMinus size={18} /></button>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                                <button onClick={() => setQuantity(quantity + 1)}><IconPlus size={18} /></button>
                            </div>
                            <span className="stock-hint">Available: {artwork.stock_quantity}</span>
                        </div>

                        <div className="price-card">
                            <div className="price-label">Price</div>
                            <div className="price-display">₹{artwork.purchase_price?.toLocaleString()}</div>
                        </div>

                        <div className="action-buttons">
                            {artwork.allow_purchase && (
                                <>
                                    <button className="btn-cart" onClick={handleAddToCart}>
                                        <IconShoppingBag size={20} /> Add to cart
                                    </button>
                                    <button className="btn-buy" onClick={handleBuyNow}>Buy now</button>
                                </>
                            )}
                            {artwork.allow_lease && (
                                <button className="btn-lease">Lease for ₹{artwork.lease_monthly_rate}/mo</button>
                            )}
                            {!artwork.allow_purchase && !artwork.allow_lease && (
                                <button className="btn-lease" disabled>View Only</button>
                            )}
                            <button className="btn-wishlist"><IconHeart size={20} /></button>
                        </div>

                        <div className="seller-card">
                            <div className="seller-info">
                                <div className="seller-avatar">
                                    <IconCheck size={14} className="verified-icon" />
                                    <img src="/founder1.png" alt="Seller" />
                                </div>
                                <div className="seller-details">
                                    <h3>Guanjoi Trading LLC</h3>
                                    <div className="seller-stats">
                                        <IconStarFilled size={12} color="#f59e0b" />
                                        <span>4.2 • 1290 items sold</span>
                                    </div>
                                </div>
                            </div>
                            <button className="view-profile-btn">Seller's profile</button>
                        </div>
                    </div>
                </div>

                <div className="product-tabs">
                    <div className="tab-headers">
                        <button
                            className={activeTab === 'description' ? 'active' : ''}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={activeTab === 'reviews' ? 'active' : ''}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({artwork.total_reviews})
                        </button>
                        <button
                            className={activeTab === 'usage' ? 'active' : ''}
                            onClick={() => setActiveTab('usage')}
                        >
                            Usage guide
                        </button>
                    </div>
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <p>{artwork.description || 'No description provided.'}</p>
                        )}
                        {activeTab === 'reviews' && (
                            <ReviewSection
                                artworkId={artwork.id}
                                avgRating={Number(artwork.avg_rating)}
                                totalReviews={artwork.total_reviews}
                                reviews={reviews}
                                onReviewAdded={fetchData}
                            />
                        )}
                        {activeTab === 'usage' && (
                            <p>Proper care and handling instructions for this artwork...</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
