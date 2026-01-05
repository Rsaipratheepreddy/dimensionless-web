'use client';

import React from 'react';
import './FeaturedCard.css';
import { IconCalendar, IconArrowRight, IconChevronRight } from '@tabler/icons-react';
import { getOptimizedImageUrl } from '@/utils/image-optimization';
import { supabase } from '@/utils/supabase';

interface FeaturedItem {
    title: string;
    description: string;
    image: string;
    date: string;
    price: string;
    creator: {
        name: string;
        avatar: string;
    };
}

const FeaturedCard: React.FC = () => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [items, setItems] = React.useState<FeaturedItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data, error } = await supabase
                    .from('artworks')
                    .select('*, profiles:artist_id(full_name, avatar_url)')
                    .eq('status', 'published')
                    .limit(5);

                if (error) throw error;

                if (data && data.length > 0) {
                    const formatted = data.map((art: any) => ({
                        title: art.title,
                        description: art.description || 'Exclusive artwork collection',
                        image: art.artwork_images?.[0]?.image_url || '/placeholder-art.png',
                        date: new Date(art.created_at).toLocaleDateString(),
                        price: `₹ ${art.purchase_price || art.lease_monthly_rate}`,
                        creator: {
                            name: art.profiles?.full_name || 'Anonymous Creator',
                            avatar: art.profiles?.avatar_url || '/founder1.png'
                        }
                    }));
                    setItems(formatted);
                }
            } catch (err) {
                console.error('Error fetching featured:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    React.useEffect(() => {
        if (items.length === 0) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [items.length]);

    if (loading) return <div className="featured-card">Loading...</div>;
    if (items.length === 0) return null;

    return (
        <div className="featured-carousel-container">
            <div className="carousel-viewport">
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {items.map((item, index) => (
                        <div className="featured-card" key={index}>
                            <div className="featured-card-left">
                                <div className="featured-image-wrapper">
                                    <div className="featured-image-container">
                                        <img
                                            src={getOptimizedImageUrl(item.image, { width: 800, format: 'webp' })}
                                            alt={item.title}
                                            className="featured-image"
                                        />
                                        <div className="status-badge-top">
                                            <span className="dot"></span>
                                            Trending Art 10+ done
                                        </div>
                                        <div className="explore-overlay">
                                            <div className="explore-text-group">
                                                <span className="explore-label">Starts at @</span>
                                                <span className="explore-main">{item.price}</span>
                                            </div>
                                            <button className="explore-btn-long">
                                                Explore Now <IconArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="featured-card-right">
                                <div className="featured-meta">
                                    <div className="featured-date">
                                        <IconCalendar size={18} stroke={1.5} />
                                        <span>{item.date}</span>
                                    </div>
                                </div>

                                <h1 className="featured-title">{item.title}</h1>
                                <p className="featured-description">{item.description}</p>

                                <div className="featured-creator-row">
                                    <div className="creator-profile">
                                        <img src={item.creator.avatar} alt={item.creator.name} className="creator-avatar-img" />
                                        <div className="creator-details">
                                            <span className="creator-label">Creator</span>
                                            <span className="creator-name-text">{item.creator.name}</span>
                                        </div>
                                    </div>
                                    <button className="other-works-btn">
                                        Other Works <IconChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="carousel-dots-bottom">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturedCard;
