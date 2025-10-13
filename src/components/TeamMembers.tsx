'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconPhone,
    IconMail
} from '@tabler/icons-react';
import './TeamMembers.css';

gsap.registerPlugin(ScrollTrigger);

export interface TeamMembersProps {
    className?: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
    className = ''
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

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

    // GSAP Animation Effect for infinite scroll
    useEffect(() => {
        if (!mounted || !scrollerRef.current) return;

        const ctx = gsap.context(() => {
            // Header animation
            if (headerRef.current) {
                gsap.fromTo(headerRef.current.children,
                    {
                        y: 50,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: headerRef.current,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }

            // Infinite scroll animation
            const scrollWrapper = scrollerRef.current;
            const scrollContent = scrollWrapper?.querySelector('.scroller-content');

            if (scrollContent) {
                const scrollWidth = scrollContent.scrollWidth;
                const duration = 20; // 20 seconds for one complete cycle

                gsap.to(scrollContent, {
                    x: -scrollWidth / 2,
                    duration: duration,
                    ease: "none",
                    repeat: -1
                });
            }

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    const teamMembers = [
        {
            name: "Amy Rosum",
            role: "Customer Success Agent",
            image: "/founder2.png"
        },
        {
            name: "Sophie Chamberlain",
            role: "Specialized Support",
            image: "/studio.png"
        },
        {
            name: "Lana Steiner",
            role: "VP of Customer Success",
            image: "/founder2.png"
        },
        {
            name: "Orlando Diggs",
            role: "Customer Success Lead",
            image: "/studio.png"
        },
        {
            name: "Sasha Kindred",
            role: "Customer Success Lead",
            image: "/founder2.png"
        }
    ];

    // Duplicate for infinite scroll effect
    const duplicatedMembers = [...teamMembers, ...teamMembers];

    const handleBookCall = () => {
        console.log('Book a call clicked');
    };

    const handleGetInTouch = () => {
        console.log('Get in touch clicked');
    };

    return (
        <section ref={sectionRef} className={`team-members-section ${className}`} data-theme={currentTheme}>
            <div className="members-container">
                {/* Header */}
                <div ref={headerRef} className="members-header">
                    <h1 className="main-title">
                        We've got an entire <span className="highlight">team dedicated</span>
                    </h1>
                    <p className="subtitle">
                        Get help 24/7, with our award-winning support network of creative experts.
                    </p>

                    <div className="cta-buttons">
                        <button className="book-call-btn" onClick={handleBookCall}>
                            <IconPhone size={18} />
                            <span>Book a call</span>
                        </button>
                        <button className="get-touch-btn" onClick={handleGetInTouch}>
                            <span>Get in touch</span>
                        </button>
                    </div>
                </div>

                {/* Infinite Scroll Members */}
                <div ref={scrollerRef} className="scroll-wrapper">
                    <div className="scroller-content">
                        {duplicatedMembers.map((member, index) => (
                            <div key={`${member.name}-${index}`} className="member-card">
                                <div className="member-image">
                                    <img src={member.image} alt={member.name} />
                                </div>
                                <div className="member-info">
                                    <h3 className="member-name">{member.name}</h3>
                                    <p className="member-role">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TeamMembers; 