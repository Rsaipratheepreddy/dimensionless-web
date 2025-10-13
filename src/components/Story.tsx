'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconMapPin,
    IconHome,
    IconBuilding,
    IconUsers,
    IconBrandZoom,
    IconHeart,
    IconArrowRight,
    IconQuote,
    IconStar
} from '@tabler/icons-react';
import './Story.css';

gsap.registerPlugin(ScrollTrigger);

export interface StoryProps {
    className?: string;
    onLearnMoreClick?: () => void;
}

const Story: React.FC<StoryProps> = ({
    className = '',
    onLearnMoreClick
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const founderRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);

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
            gsap.set([badgeRef.current, titleRef.current], {
                y: 50,
                opacity: 0
            });

            gsap.set(founderRef.current, {
                y: 80,
                opacity: 0
            });

            gsap.set(quoteRef.current, {
                y: 60,
                opacity: 0
            });

            // Dream board cards - set initial states
            if (timelineRef.current) {
                const cards = timelineRef.current.querySelectorAll('.memory-pin');
                gsap.set(cards, {
                    y: 100,
                    opacity: 0,
                    rotation: 0,
                    scale: 0.8
                });

                // Set individual card rotations and positions after animation
                gsap.set('.pin-1', { rotation: -2 });
                gsap.set('.pin-2', { rotation: 1 });
                gsap.set('.pin-3', { rotation: -1 });
                gsap.set('.pin-4', { rotation: 2 });
                gsap.set('.pin-5', { rotation: -1.5 });
                gsap.set('.pin-6', { rotation: 0.5 });
            }

            // Header animation
            const headerTl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "top 50%",
                    toggleActions: "play none none reverse"
                }
            });

            headerTl.to(badgeRef.current, {
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
                }, "-=0.4");

            // Pinterest gallery animation
            gsap.to(founderRef.current, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: founderRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            // Dream board cards animation
            if (timelineRef.current) {
                const cards = timelineRef.current.querySelectorAll('.memory-pin');

                gsap.to(cards, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: {
                        amount: 1.2,
                        from: "random"
                    },
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: timelineRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse"
                    },
                    onComplete: () => {
                        // Apply natural rotations after cards land
                        gsap.to('.pin-1', { rotation: -2, duration: 0.5, ease: "power2.out" });
                        gsap.to('.pin-2', { rotation: 1, duration: 0.5, ease: "power2.out" });
                        gsap.to('.pin-3', { rotation: -1, duration: 0.5, ease: "power2.out" });
                        gsap.to('.pin-4', { rotation: 2, duration: 0.5, ease: "power2.out" });
                        gsap.to('.pin-5', { rotation: -1.5, duration: 0.5, ease: "power2.out" });
                        gsap.to('.pin-6', { rotation: 0.5, duration: 0.5, ease: "power2.out" });
                    }
                });

                // Pin drop animation
                const pins = timelineRef.current.querySelectorAll('.pin-head');
                gsap.set(pins, {
                    y: -50,
                    opacity: 0
                });

                gsap.to(pins, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "bounce.out",
                    delay: 0.8,
                    scrollTrigger: {
                        trigger: timelineRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse"
                    }
                });
            }

            // Founder showcase animation
            if (quoteRef.current) {
                const founderImages = quoteRef.current.querySelectorAll('.founder-image-main, .founder-image-secondary');
                const founderText = quoteRef.current.querySelector('.founder-text');

                gsap.set(founderImages, {
                    y: 60,
                    opacity: 0,
                    scale: 0.9
                });

                gsap.set(founderText, {
                    x: 50,
                    opacity: 0
                });

                gsap.to(quoteRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: quoteRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });

                gsap.to(founderImages, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: quoteRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                });

                gsap.to(founderText, {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out",
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: quoteRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                });
            }

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    const handleLearnMore = () => {
        if (onLearnMoreClick) {
            onLearnMoreClick();
        } else {
            console.log('Learn more about our story');
        }
    };

    if (!mounted) {
        return null;
    }

    const timelineEvents = [
        {
            year: '2013',
            title: 'The Bangalore Move',
            description: 'Ajay Sharma relocated to Bangalore with a vision to create something meaningful in the art world.',
            icon: IconMapPin,
            color: '#ff6b6b'
        },
        {
            year: '2015',
            title: 'Home Studio Beginnings',
            description: 'Started with a humble home studio, nurturing creativity and building the foundation of artistic excellence.',
            icon: IconHome,
            color: '#4ecdc4'
        },
        {
            year: '2018',
            title: 'First Physical Studio',
            description: 'Opened our first professional studio space, marking a significant milestone in our journey.',
            icon: IconBuilding,
            color: '#45b7d1'
        },
        {
            year: '2020',
            title: 'COVID Pivot & DNA Launch',
            description: 'Adapted to challenges by launching DNA (Dimensionless Academy) and embracing digital transformation.',
            icon: IconBrandZoom,
            color: '#96ceb4'
        },
        {
            year: '2021',
            title: 'Lillibees Launch',
            description: 'Introduced Lillibees Art Classes, expanding our reach to nurture young artistic minds.',
            icon: IconUsers,
            color: '#ffeaa7'
        },
        {
            year: '2025',
            title: 'Growth Mindset Era',
            description: 'Continuing to evolve with a growth mindset philosophy, inspiring artists and building communities.',
            icon: IconStar,
            color: '#fd79a8'
        }
    ];

    return (
        <section ref={sectionRef} className={`story-section ${className}`} data-theme={currentTheme}>
            <div className="story-container">
                {/* Header */}
                <div className="story-header">
                    <div ref={badgeRef} className="story-badge">
                        <span>Our Story</span>
                    </div>

                    <h2 ref={titleRef} className="story-title">
                        A Journey of <span className="highlight">Art & Passion</span>
                    </h2>

                    <p className="story-subtitle">
                        From humble beginnings to a thriving creative ecosystem - discover the moments
                        that shaped our artistic vision and community impact.
                    </p>
                </div>

                {/* Compact Staggered Grid Gallery */}
                <div ref={founderRef} className="pinterest-gallery">
                    <div className="gallery-column">
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Studio workspace" />
                            <div className="gallery-overlay">
                                <span>Our Creative Space</span>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Art classes in session" />
                            <div className="gallery-overlay">
                                <span>Teaching Moments</span>
                            </div>
                        </div>
                    </div>

                    <div className="gallery-column">
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Creative atmosphere" />
                            <div className="gallery-overlay">
                                <span>Creative Atmosphere</span>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Workshop in progress" />
                            <div className="gallery-overlay">
                                <span>Workshop Sessions</span>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Art supplies and tools" />
                            <div className="gallery-overlay">
                                <span>Tools & Materials</span>
                            </div>
                        </div>
                    </div>

                    <div className="gallery-column">
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Studio corner view" />
                            <div className="gallery-overlay">
                                <span>Inspiring Corners</span>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Artistic process" />
                            <div className="gallery-overlay">
                                <span>Creative Process</span>
                            </div>
                        </div>
                    </div>

                    <div className="gallery-column">
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Learning together" />
                            <div className="gallery-overlay">
                                <span>Learning Together</span>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Art exhibition" />
                            <div className="gallery-overlay">
                                <span>Art Exhibitions</span>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src="/studio.png" alt="Creative journey" />
                            <div className="gallery-overlay">
                                <span>Creative Journey</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dream Board Timeline */}
                <div className="dreamboard-section">
                    <div className="dreamboard-header">
                        <h3>Our Journey</h3>
                        <p>Milestones pinned on our creative memory board</p>
                    </div>

                    <div ref={timelineRef} className="dreamboard-container">
                        <div className="dreamboard-background">
                            <div className="board-texture"></div>
                        </div>

                        <div className="dreamboard-grid">
                            {timelineEvents.map((event, index) => (
                                <div key={event.year} className={`memory-pin pin-${index + 1}`}>
                                    <div className="pin-top">
                                        <div className="pin-head" style={{ backgroundColor: event.color }}>
                                            <event.icon size={16} />
                                        </div>
                                    </div>

                                    <div className="memory-card">
                                        <div className="card-image">
                                            <img src="/studio.png" alt={event.title} />
                                            <div className="year-badge" style={{ backgroundColor: event.color }}>
                                                {event.year}
                                            </div>
                                        </div>

                                        <div className="card-content">
                                            <h4 className="memory-title">{event.title}</h4>
                                            <p className="memory-description">{event.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Founder Showcase */}
                <div ref={quoteRef} className="founder-showcase">
                    <div className="founder-content">
                        <div className="founder-images">
                            <div className="founder-image-main">
                                <img src="/founder1.png" alt="Ajay Sharma - Founder" />
                            </div>
                            <div className="founder-image-secondary">
                                <img src="/founder2.png" alt="Ajay Sharma at work" />
                            </div>
                        </div>

                        <div className="founder-text">
                            <div className="founder-header">
                                <h3 className="founder-name">Ajay Sharma</h3>
                                <span className="founder-role">Founder & Creative Director</span>
                            </div>

                            <div className="founder-story">
                                <p className="story-paragraph">
                                    A visionary artist and educator who transformed a simple dream into a thriving
                                    creative ecosystem. With over 12 years of experience, Ajay has mentored
                                    hundreds of aspiring artists.
                                </p>
                            </div>

                            <div className="founder-quote">
                                <div className="quote-icon">
                                    <IconQuote size={20} />
                                </div>
                                <blockquote>
                                    &ldquo;Every challenge becomes an opportunity to create something beautiful.&rdquo;
                                </blockquote>
                            </div>

                            <div className="founder-actions">
                                <button className="schedule-btn" onClick={handleLearnMore}>
                                    <span>Schedule a Meeting</span>
                                    <IconArrowRight size={18} />
                                </button>
                            </div>

                            <div className="founder-achievements">
                                <div className="achievement">
                                    <div className="achievement-number">12+</div>
                                    <div className="achievement-label">Years Experience</div>
                                </div>
                                <div className="achievement">
                                    <div className="achievement-number">500+</div>
                                    <div className="achievement-label">Students Mentored</div>
                                </div>
                                <div className="achievement">
                                    <div className="achievement-number">2</div>
                                    <div className="achievement-label">Studio Locations</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Story; 