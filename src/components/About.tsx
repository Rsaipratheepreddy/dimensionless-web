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
    const descriptionRef = useRef<HTMLDivElement>(null);
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
                        <span>About Dimens</span>
                    </div>

                    {/* Title */}
                    <h2 ref={titleRef} className="about-title">
                        DEFINING DIGITAL DIMENS
                    </h2>

                    {/* Description */}
                    <div ref={descriptionRef} className="about-description">
                        <p>
                            Dimens (DMN) is a Web3-powered digital token that fuels the Dimensionless Creative Platform — a space where art, technology, and community converge. Currently built on the Polygon blockchain (ERC-20 standard), DMN serves as a reward and incentive token for creators, learners, and collaborators within the Dimensionless ecosystem.
                        </p>
                        <p>
                            Its ongoing projects and real-world use cases bridge art and innovation, empowering users to create, connect, and grow in a decentralized creative economy.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div ref={cardsRef} className="about-cards">
                        <div className="about-card">
                            <div className="card-header">
                                <h3 className="card-title">Growth</h3>
                                <div className="card-icon growth-icon">
                                    <IconTrendingUp size={20} />
                                </div>
                            </div>
                            <p className="card-description">
                                Our mission is to grow the creative community across the world
                            </p>
                        </div>

                        <div className="about-card">
                            <div className="card-header">
                                <h3 className="card-title">Revenue</h3>
                                <div className="card-icon revenue-icon">
                                    <IconCurrencyDollar size={20} />
                                </div>
                            </div>
                            <p className="card-description">
                                Our mission is to grow the revenue to 10x by art and tech integration
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
                        src="/abtimg.png"
                        alt="Dimens Network"
                        className="about-img"
                    />
                    <div className="about-image-overlay">
                        <div className="network-text">
                            NETWORKING<br />
                            DIMENS.IN
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About; 