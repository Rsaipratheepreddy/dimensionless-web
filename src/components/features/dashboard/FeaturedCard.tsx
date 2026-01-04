'use client';

import React from 'react';
import './FeaturedCard.css';
import { IconCalendar, IconArrowRight, IconChevronRight } from '@tabler/icons-react';
import { getOptimizedImageUrl } from '@/utils/image-optimization';

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

    const items: FeaturedItem[] = [
        {
            title: "Traditional Masterpiece Collection",
            description: "Explore our curated collection of traditional paintings from renowned local artists. A blend of culture and creativity.",
            image: "/painting.png",
            date: "May 01, 2022, 12:01 PM",
            price: "₹ 1.52",
            creator: { name: "Evgeniy Korsak", avatar: "/founder1.png" }
        },
        {
            title: "Modern Studio Sessions",
            description: "Go behind the scenes and experience the art of creation in our premium studio environments. Exclusive access granted.",
            image: "/studio.png",
            date: "June 12, 2022, 11:30 AM",
            price: "₹ 2.40",
            creator: { name: "Zakir Horizontal", avatar: "/founder2.png" }
        },
        {
            title: "Abstract Cultural Insights",
            description: "Discover new dimensions of artistic expression with our abstract series. A visual journey through modern interpretations.",
            image: "/abtimg.png",
            date: "July 20, 2022, 02:45 PM",
            price: "₹ 1.85",
            creator: { name: "Leonardo Samsul", avatar: "/ajay-founder.png" }
        }
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [items.length]);

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
