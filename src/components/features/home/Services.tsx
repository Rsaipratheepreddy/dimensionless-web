'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconBrush,
    IconUsers,
    IconHome2,
    IconArrowRight,
    IconPalette,
    IconSchool,
    IconBuilding
} from '@tabler/icons-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import './Services.css';

gsap.registerPlugin(ScrollTrigger);

export interface ServicesProps {
    className?: string;
    onViewPortfolioClick?: () => void;
    onJoinClassesClick?: () => void;
    onBrowseCollectionClick?: () => void;
    onGetServiceClick?: () => void;
}

const Services: React.FC<ServicesProps> = ({
    className = '',
    onViewPortfolioClick,
    onJoinClassesClick,
    onBrowseCollectionClick,
    onGetServiceClick
}) => {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const router = useRouter();
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // GSAP Animation Effect
    useEffect(() => {
        if (!mounted) return;

        const ctx = gsap.context(() => {
            // Set initial states
            gsap.set([badgeRef.current, titleRef.current, descriptionRef.current], {
                y: 50,
                opacity: 0
            });

            if (cardsRef.current) {
                gsap.set(cardsRef.current.children, {
                    y: 80,
                    opacity: 0
                });
            }

            gsap.set(buttonRef.current, {
                y: 50,
                opacity: 0
            });

            // Create timeline with ScrollTrigger
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.to(badgeRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            })
                .to(titleRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.4")
                .to(descriptionRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.6")
                .to(cardsRef.current?.children || [], {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power2.out"
                }, "-=0.4")
                .to(buttonRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.6");

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    const handleViewPortfolio = () => {
        if (onViewPortfolioClick) {
            onViewPortfolioClick();
        } else {
            console.log('View Portfolio clicked');
        }
    };

    const handleJoinClasses = () => {
        if (onJoinClassesClick) {
            onJoinClassesClick();
        } else {
            router.push('/art-classes');
        }
    };

    const handleBrowseCollection = () => {
        if (onBrowseCollectionClick) {
            onBrowseCollectionClick();
        } else {
            console.log('Browse Collection clicked');
        }
    };

    const handleGetService = () => {
        if (onGetServiceClick) {
            onGetServiceClick();
        } else {
            console.log('Get Service clicked');
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <section ref={sectionRef} className={`services-section theme-${theme} ${className}`}>
            <div className="services-container">
                {/* Header */}
                <div className="services-header">
                    <div ref={badgeRef} className="services-badge">
                        <span>Our Services</span>
                    </div>

                    <h2 ref={titleRef} className="services-title">
                        Unleash Your <span className="highlight">Potential</span>
                    </h2>

                    <p ref={descriptionRef} className="services-description">
                        About Us section typically appears on a company or organization&apos;s website and provide
                        visitors with key information about the entity. Here are the key points typically included:
                    </p>
                </div>

                {/* Service Cards */}
                <div ref={cardsRef} className="services-grid">
                    {/* Tattoos & Custom Art */}
                    <div className="service-card">
                        <div className="service-icon tattoo-icon">
                            <IconBrush size={28} />
                        </div>
                        <h3 className="service-title">Tattoos & Custom Art</h3>
                        <p className="service-description">
                            Professional tattoo artistry and custom artwork.
                            Studio locations preview with expert artists ready to bring your vision to life.
                        </p>
                        <button className="service-cta" onClick={handleViewPortfolio}>
                            <span>View Portfolio</span>
                            <IconArrowRight size={16} />
                        </button>
                    </div>

                    {/* Lillibees Art Classes */}
                    <div className="service-card">
                        <div className="service-icon classes-icon">
                            <IconUsers size={28} />
                        </div>
                        <h3 className="service-title">Lillibees Art Classes</h3>
                        <p className="service-description">
                            Art education for kids and adults across multiple community locations.
                            Online and offline options available for all skill levels.
                        </p>
                        <button className="service-cta" onClick={handleJoinClasses}>
                            <span>Join Classes</span>
                            <IconArrowRight size={16} />
                        </button>
                    </div>

                    {/* Art Leasing */}
                    <div className="service-card">
                        <div className="service-icon leasing-icon">
                            <IconHome2 size={28} />
                        </div>
                        <h3 className="service-title">Art Leasing</h3>
                        <p className="service-description">
                            Premium artwork for residential and commercial spaces.
                            Flexible rental model with space transformation examples.
                        </p>
                        <button className="service-cta" onClick={handleBrowseCollection}>
                            <span>Browse Collection</span>
                            <IconArrowRight size={16} />
                        </button>
                    </div>

                    {/* Creative Consulting */}
                    <div className="service-card">
                        <div className="service-icon additional-icon">
                            <IconBuilding size={28} />
                        </div>
                        <h3 className="service-title">Creative Consulting</h3>
                        <p className="service-description">
                            Professional creative guidance for businesses and individuals.
                            Brand development and artistic direction services.
                        </p>
                        <button className="service-cta" onClick={handleGetService}>
                            <span>Learn More</span>
                            <IconArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Main CTA Button */}
                <div className="services-footer">
                    <button ref={buttonRef} className="main-service-cta" onClick={handleGetService}>
                        <span>Get Service</span>
                        <IconArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Services; 