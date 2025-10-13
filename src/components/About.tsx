'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IconTrendingUp, IconCurrencyDollar, IconArrowRight } from '@tabler/icons-react';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

export interface AboutProps {
    className?: string;
    onLearnMoreClick?: () => void;
}

const About: React.FC<AboutProps> = ({
    className = '',
    onLearnMoreClick
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

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
            gsap.set([badgeRef.current, titleRef.current, descriptionRef.current, cardsRef.current, buttonRef.current], {
                y: 50,
                opacity: 0
            });

            gsap.set(imageRef.current, {
                x: 100,
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
                .to(cardsRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.4")
                .to(buttonRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.6")
                .to(imageRef.current, {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out"
                }, "-=1");

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    const handleLearnMoreClick = () => {
        if (onLearnMoreClick) {
            onLearnMoreClick();
        } else {
            console.log('Learn More clicked');
            // You can add navigation logic here
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <section ref={sectionRef} className={`about-section ${className}`} data-theme={currentTheme}>
            <div className="about-container">
                <div className="about-content">
                    {/* Badge */}
                    <div ref={badgeRef} className="about-badge">
                        <span>About Company 🎯</span>
                    </div>

                    {/* Title */}
                    <h2 ref={titleRef} className="about-title">
                        We believe in <span className="highlight">doing</span><br />
                        the right thing
                    </h2>

                    {/* Description */}
                    <p ref={descriptionRef} className="about-description">
                        Foster a supportive and inclusive environment where our team
                        can thrive. We believe in doing the right thing, always.
                    </p>

                    {/* Feature Cards */}
                    <div ref={cardsRef} className="about-cards">
                        <div className="about-card">
                            <div className="card-icon growth-icon">
                                <IconTrendingUp size={24} />
                            </div>
                            <h3 className="card-title">Growth</h3>
                            <p className="card-description">
                                Our mission's to drive grow & improve progress.
                            </p>
                        </div>

                        <div className="about-card">
                            <div className="card-icon revenue-icon">
                                <IconCurrencyDollar size={24} />
                            </div>
                            <h3 className="card-title">Revenue</h3>
                            <p className="card-description">
                                Our mission's to drive grow & improve progress.
                            </p>
                        </div>
                    </div>

                    {/* Learn More Button */}
                    <button ref={buttonRef} className="learn-more-btn" onClick={handleLearnMoreClick}>
                        <span>Learn More</span>
                        <IconArrowRight size={20} />
                    </button>
                </div>

                {/* Image */}
                <div ref={imageRef} className="about-image">
                    <img
                        src="/DSC02862-2.jpeg"
                        alt="Team collaboration"
                        className="about-img"
                    />
                </div>
            </div>
        </section>
    );
};

export default About; 