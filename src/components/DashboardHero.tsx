'use client';
import { useState, useEffect } from 'react';
import './DashboardHero.css';

const slides = [
    {
        tag: "ONLINE COURSE",
        title: "Sharpen Your Skills with\nProfessional Online Courses",
        buttonText: "Join Now",
        className: "slide-courses"
    },
    {
        tag: "MARKETPLACE",
        title: "Buy and Sell Your Unique\nArtworks to the World",
        buttonText: "Browse Art",
        className: "slide-shop"
    },
    {
        tag: "ART SERVICES",
        title: "Professional Art Leasing\nand Custom Tattoo Studios",
        buttonText: "Book Now",
        className: "slide-services"
    }
];

const DashboardHero: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[currentSlide];

    return (
        <section className={`dashboard-hero ${slide.className}`}>
            <div className="hero-content">
                <span className="hero-tag">{slide.tag}</span>
                <h1 className="hero-title">
                    {slide.title.split('\n').map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                </h1>
                <button className="hero-btn">
                    {slide.buttonText}
                    <span className="btn-icon">→</span>
                </button>
            </div>
            <div className="hero-decor">
                <div className="decor-star star-1">✦</div>
                <div className="decor-star star-2">✦</div>
                <div className="decor-star star-3">✦</div>
            </div>
            <div className="carousel-indicators">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className={`indicator ${i === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(i)}
                    />
                ))}
            </div>
        </section>
    );
};

export default DashboardHero;
