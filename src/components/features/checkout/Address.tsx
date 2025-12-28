'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconMapPin,
    IconPhone,
    IconClock,
    IconArrowRight,
    IconCamera,
    IconUsers,
    IconPalette
} from '@tabler/icons-react';
import './Address.css';

gsap.registerPlugin(ScrollTrigger);

export interface AddressProps {
    className?: string;
    onGetDirectionsClick?: (studioName: string) => void;
    onViewGalleryClick?: (studioName: string) => void;
}

const Address: React.FC<AddressProps> = ({
    className = '',
    onGetDirectionsClick,
    onViewGalleryClick
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const locationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        // Get initial theme
        const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
        setCurrentTheme(theme);

        // Listen for theme changes
        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
            setCurrentTheme(newTheme);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
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

            if (locationsRef.current) {
                gsap.set(locationsRef.current.children, {
                    y: 80,
                    opacity: 0
                });
            }

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
                .to(locationsRef.current?.children || [], {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.3,
                    ease: "power2.out"
                }, "-=0.4");

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    const handleGetDirections = (studioName: string) => {
        if (onGetDirectionsClick) {
            onGetDirectionsClick(studioName);
        } else {
            console.log(`Get directions to ${studioName}`);
        }
    };

    const handleViewGallery = (studioName: string) => {
        if (onViewGalleryClick) {
            onViewGalleryClick(studioName);
        } else {
            console.log(`View gallery for ${studioName}`);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <section ref={sectionRef} className={`address-section ${className}`} data-theme={currentTheme}>
            <div className="address-container">
                {/* Header */}
                <div className="address-header">
                    <div ref={badgeRef} className="address-badge">
                        <span>Studios & Locations</span>
                    </div>

                    <h2 ref={titleRef} className="address-title">
                        Visit Our <span className="highlight">Studios</span>
                    </h2>

                    <p ref={descriptionRef} className="address-description">
                        Discover our creative spaces where art comes to life. Interactive map or location cards
                        showcasing our professional studios with complete facility features.
                    </p>
                </div>

                {/* Location Cards */}
                <div ref={locationsRef} className="locations-grid">
                    {/* AECS Layout Studio */}
                    <div className="location-card">
                        <div className="location-image">
                            <img src="/studio.png" alt="AECS Layout Studio" />
                            <div className="location-overlay">
                                <button
                                    className="gallery-btn"
                                    onClick={() => handleViewGallery('AECS Layout Studio')}
                                >
                                    <IconCamera size={20} />
                                    <span>View Gallery</span>
                                </button>
                            </div>
                        </div>

                        <div className="location-content">
                            <div className="location-header">
                                <h3 className="location-name">AECS Layout Studio</h3>
                                <span className="location-year">(Est. 2018)</span>
                            </div>

                            <div className="location-address">
                                <IconMapPin size={18} />
                                <span>#106 1st Main Road, 2nd Cross A Block, AECS Layout</span>
                            </div>

                            <div className="location-features">
                                <div className="feature">
                                    <IconUsers size={16} />
                                    <span>Group Classes</span>
                                </div>
                                <div className="feature">
                                    <IconPalette size={16} />
                                    <span>Art Supplies</span>
                                </div>
                                <div className="feature">
                                    <IconClock size={16} />
                                    <span>9 AM - 8 PM</span>
                                </div>
                            </div>

                            <button
                                className="location-cta"
                                onClick={() => handleGetDirections('AECS Layout Studio')}
                            >
                                <span>Get Directions</span>
                                <IconArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Adarsh Palm Meadows Studio */}
                    <div className="location-card">
                        <div className="location-image">
                            <img src="/studio.png" alt="Adarsh Palm Meadows Studio" />
                            <div className="location-overlay">
                                <button
                                    className="gallery-btn"
                                    onClick={() => handleViewGallery('Adarsh Palm Meadows Studio')}
                                >
                                    <IconCamera size={20} />
                                    <span>View Gallery</span>
                                </button>
                            </div>
                        </div>

                        <div className="location-content">
                            <div className="location-header">
                                <h3 className="location-name">Adarsh Palm Meadows Studio</h3>
                                <span className="location-year">(Premium)</span>
                            </div>

                            <div className="location-address">
                                <IconMapPin size={18} />
                                <span>#3/3 Adarsh Palm Meadows, above Scent Salon</span>
                            </div>

                            <div className="location-features">
                                <div className="feature">
                                    <IconUsers size={16} />
                                    <span>Private Sessions</span>
                                </div>
                                <div className="feature">
                                    <IconPalette size={16} />
                                    <span>Premium Materials</span>
                                </div>
                                <div className="feature">
                                    <IconClock size={16} />
                                    <span>10 AM - 9 PM</span>
                                </div>
                            </div>

                            <button
                                className="location-cta"
                                onClick={() => handleGetDirections('Adarsh Palm Meadows Studio')}
                            >
                                <span>Get Directions</span>
                                <IconArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Address; 