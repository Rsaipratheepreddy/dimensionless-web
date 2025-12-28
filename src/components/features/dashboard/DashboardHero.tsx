import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IconArrowRight } from '@tabler/icons-react';
import './DashboardHero.css';
import { getOptimizedImageUrl } from '@/utils/image-optimization';

interface Slide {
    title?: string;
    description?: string;
    image?: string;
    link?: string;
}

interface DashboardHeroProps {
    slides?: Slide[];
}

export default function DashboardHero({ slides = [] }: DashboardHeroProps) {
    const { profile } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [slides]);

    if (slides.length === 0) {
        return (
            <section className="dashboard-hero-immersive default">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}!
                    </h1>
                    <p className="hero-description">
                        Your creative journey continues here. Explore new workshops, manage your art, and connect with the community.
                    </p>
                    <button className="hero-explore-btn">
                        Explore Now
                        <div className="btn-circle">
                            <IconArrowRight size={20} />
                        </div>
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard-hero-immersive-container">
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
                    style={slide.image ? {
                        backgroundImage: `url(${getOptimizedImageUrl(slide.image, { width: 1200, format: 'webp' })})`
                    } : {}}
                >
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">{slide.title}</h1>
                        <p className="hero-description">{slide.description}</p>
                        <button
                            className="hero-explore-btn"
                            onClick={() => slide.link && (window.location.href = slide.link)}
                        >
                            Explore Now
                            <div className="btn-circle">
                                <IconArrowRight size={20} />
                            </div>
                        </button>
                    </div>
                </div>
            ))}

            <div className="carousel-indicators">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        className={`indicator-bar ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                    />
                ))}
            </div>
        </section>
    );
}
