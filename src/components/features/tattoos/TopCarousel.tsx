'use client';
import './TopCarousel.css';
import Image from 'next/image';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState, useRef } from 'react';

interface CarouselItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    category: string;
}

const TopCarousel: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const items: CarouselItem[] = [
        {
            id: '1',
            title: 'Art Learning Sessions',
            subtitle: 'This month\'s curated art classes for kids',
            image: '/painting.png',
            category: 'Learning'
        },
        {
            id: '2',
            title: 'Tattoo Services',
            subtitle: 'Traditional & Contemporary Indian Tattoo Art',
            image: '/painting.png',
            category: 'Tattoos'
        },
        {
            id: '3',
            title: 'Art Exhibitions',
            subtitle: 'Upcoming exhibitions this month',
            image: '/painting.png',
            category: 'Exhibitions'
        },
        {
            id: '4',
            title: 'Piercing Services',
            subtitle: 'Professional piercing studio',
            image: '/painting.png',
            category: 'Piercings'
        }
    ];

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.offsetWidth;
            const newIndex = direction === 'left'
                ? Math.max(0, activeIndex - 1)
                : Math.min(items.length - 1, activeIndex + 1);

            setActiveIndex(newIndex);
            scrollRef.current.scrollTo({
                left: newIndex * scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="top-carousel">
            <button
                className="carousel-nav carousel-nav-left"
                onClick={() => scroll('left')}
                disabled={activeIndex === 0}
            >
                <IconChevronLeft size={24} stroke={2} />
            </button>

            <div className="carousel-container" ref={scrollRef}>
                {items.map((item) => (
                    <div key={item.id} className="carousel-item">
                        <div className="carousel-image">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            <div className="carousel-overlay">
                                <div className="carousel-content">
                                    <h2 className="carousel-title">{item.title}</h2>
                                    <p className="carousel-subtitle">{item.subtitle}</p>
                                    <button className="carousel-cta-btn">Book Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="carousel-nav carousel-nav-right"
                onClick={() => scroll('right')}
                disabled={activeIndex === items.length - 1}
            >
                <IconChevronRight size={24} stroke={2} />
            </button>

            <div className="carousel-dots">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => {
                            setActiveIndex(index);
                            if (scrollRef.current) {
                                scrollRef.current.scrollTo({
                                    left: index * scrollRef.current.offsetWidth,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TopCarousel;
