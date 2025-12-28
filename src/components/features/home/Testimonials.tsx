'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IconStar } from '@tabler/icons-react';
import './Testimonials.css';
import { getOptimizedImageUrl } from '@/utils/image-optimization';

gsap.registerPlugin(ScrollTrigger);

export interface TestimonialsProps {
    className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ className = '' }) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

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

            if (cardsRef.current) {
                const rows = cardsRef.current.querySelectorAll('.testimonials-row');
                gsap.set(rows, {
                    y: 60,
                    opacity: 0
                });
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

            // Rows animation
            if (cardsRef.current) {
                const rows = cardsRef.current.querySelectorAll('.testimonials-row');
                gsap.to(rows, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.3,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: cardsRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse"
                    }
                });
            }

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    const testimonials = [
        {
            id: 1,
            text: "Exceeded our expectations with innovative designs that brought our vision to life - a truly remarkable creative agency.",
            author: "Samantha Johnson",
            position: "CEO and Co-founder of ABC Company",
            avatar: "/founder1.png"
        },
        {
            id: 2,
            text: "Their ability to capture our brand essence in every project is unparalleled - an invaluable creative collaborator.",
            author: "Isabella Rodriguez",
            position: "CEO and Co-founder of ABC Company",
            avatar: "/founder2.png"
        },
        {
            id: 3,
            text: "Creative geniuses who listen, understand, and craft captivating visuals - an agency that truly understands our needs.",
            author: "Gabrielle Williams",
            position: "CEO and Co-founder of ABC Company",
            avatar: "/founder1.png"
        },
        {
            id: 4,
            text: "A refreshing and imaginative agency that consistently delivers exceptional results - highly recommended for any project.",
            author: "Victoria Thompson",
            position: "CEO and Co-founder of ABC Company",
            avatar: "/founder2.png"
        },
        {
            id: 5,
            text: "Their team's artistic flair and strategic approach resulted in remarkable campaigns - a reliable creative partner.",
            author: "John Peter",
            position: "CEO and Co-founder of ABC Company",
            avatar: "/founder1.png"
        },
        {
            id: 6,
            text: "From concept to execution, their creativity knows no bounds - a game-changer for our brand's success.",
            author: "Natalie Martinez",
            position: "CEO and Co-founder of ABC Company",
            avatar: "/founder2.png"
        }
    ];

    // Create duplicate arrays for infinite scroll
    const firstRowTestimonials = [...testimonials, ...testimonials, ...testimonials];
    const secondRowTestimonials = [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials, ...testimonials];

    return (
        <section ref={sectionRef} className={`testimonials-section ${className}`} data-theme={currentTheme}>
            <div className="testimonials-container">
                {/* Header */}
                <div className="testimonials-header">
                    <div ref={badgeRef} className="testimonials-badge">
                        <IconStar size={16} fill="currentColor" />
                        <span>Rated 4/5 by over 1 Lakh users</span>
                    </div>

                    <h2 ref={titleRef} className="testimonials-title">
                        Words of praise from others about our <span className="highlight">presence.</span>
                    </h2>
                </div>

                {/* Testimonials Grid */}
                <div ref={cardsRef} className="testimonials-grid">
                    {/* First Row - Scrolling Right */}
                    <div className="testimonials-row">
                        {firstRowTestimonials.map((testimonial, index) => (
                            <div key={`row1-${testimonial.id}-${index}`} className="testimonial-card">
                                <div className="testimonial-quote">
                                    <span className="quote-mark">&ldquo;</span>
                                    <p className="testimonial-text">{testimonial.text}</p>
                                </div>
                                <div className="testimonial-author">
                                    <div className="author-avatar">
                                        <img src={getOptimizedImageUrl(testimonial.avatar, { width: 60, format: "webp" })} alt={testimonial.author} />
                                    </div>
                                    <div className="author-info">
                                        <h4 className="author-name">{testimonial.author}</h4>
                                        <p className="author-position">{testimonial.position}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second Row - Scrolling Left */}
                    <div className="testimonials-row">
                        {secondRowTestimonials.map((testimonial, index) => (
                            <div key={`row2-${testimonial.id}-${index}`} className="testimonial-card">
                                <div className="testimonial-quote">
                                    <span className="quote-mark">&ldquo;</span>
                                    <p className="testimonial-text">{testimonial.text}</p>
                                </div>
                                <div className="testimonial-author">
                                    <div className="author-avatar">
                                        <img src={getOptimizedImageUrl(testimonial.avatar, { width: 60, format: "webp" })} alt={testimonial.author} />
                                    </div>
                                    <div className="author-info">
                                        <h4 className="author-name">{testimonial.author}</h4>
                                        <p className="author-position">{testimonial.position}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials; 