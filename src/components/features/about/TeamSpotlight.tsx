'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconStar,
    IconBrush,
    IconUsers,
    IconBookmark,
    IconAward,
    IconHeart
} from '@tabler/icons-react';
import './TeamSpotlight.css';

gsap.registerPlugin(ScrollTrigger);

export interface TeamSpotlightProps {
    className?: string;
}

const TeamSpotlight: React.FC<TeamSpotlightProps> = ({
    className = ''
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const teamGridRef = useRef<HTMLDivElement>(null);

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

            // Team cards animation
            if (teamGridRef.current) {
                const teamCards = teamGridRef.current.querySelectorAll('.team-card');
                gsap.set(teamCards, {
                    y: 80,
                    opacity: 0,
                    scale: 0.9
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

            // Team cards animation
            if (teamGridRef.current) {
                const teamCards = teamGridRef.current.querySelectorAll('.team-card');

                gsap.to(teamCards, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: {
                        amount: 1.2,
                        from: "start"
                    },
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: teamGridRef.current,
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

    const teamMembers = [
        {
            name: "Ajay Sharma",
            role: "Founder & Creative Director",
            category: "Leadership",
            image: "/founder1.png",
            icon: IconStar,
            color: "#ff6b6b",
            expertise: "Visionary Leadership & Art Education"
        },
        {
            name: "Piyush",
            role: "Creative Director",
            category: "Creative Directors",
            image: "/studio.png",
            icon: IconBrush,
            color: "#4ecdc4",
            expertise: "Visual Design & Brand Strategy"
        },
        {
            name: "Rebecca",
            role: "Creative Director",
            category: "Creative Directors",
            image: "/studio.png",
            icon: IconBrush,
            color: "#45b7d1",
            expertise: "Creative Strategy & Content Direction"
        },
        {
            name: "Vimugha",
            role: "Lead Artist",
            category: "Artists",
            image: "/studio.png",
            icon: IconHeart,
            color: "#96ceb4",
            expertise: "Fine Arts & Student Mentoring"
        },
        {
            name: "Mohit",
            role: "Alpha Chapter Lead",
            category: "DNA Alpha Chapter",
            image: "/studio.png",
            icon: IconUsers,
            color: "#ffeaa7",
            expertise: "Community Building & Workshop Coordination"
        },
        {
            name: "Anitha",
            role: "Chapter Coordinator",
            category: "DNA Alpha Chapter",
            image: "/studio.png",
            icon: IconBookmark,
            color: "#fd79a8",
            expertise: "Program Management & Student Engagement"
        },
        {
            name: "Dr. Avin",
            role: "Academic Advisor",
            category: "DNA Alpha Chapter",
            image: "/studio.png",
            icon: IconAward,
            color: "#a29bfe",
            expertise: "Educational Psychology & Curriculum Development"
        }
    ];

    return (
        <section ref={sectionRef} className={`team-spotlight-section ${className}`} data-theme={currentTheme}>
            <div className="team-container">
                {/* Header */}
                <div className="team-header">
                    <div ref={badgeRef} className="team-badge">
                        <span>Team Spotlight</span>
                    </div>

                    <h2 ref={titleRef} className="team-title">
                        Meet Our <span className="highlight">Creative Team</span>
                    </h2>

                    <p className="team-subtitle">
                        Talented individuals passionate about nurturing creativity and building
                        an inspiring artistic community together.
                    </p>
                </div>

                {/* Team Grid */}
                <div ref={teamGridRef} className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={member.name} className="team-card">
                            <div className="team-card-inner">
                                <div className="team-image">
                                    <img src={member.image} alt={member.name} />
                                    <div className="team-icon" style={{ backgroundColor: member.color }}>
                                        <member.icon size={20} />
                                    </div>
                                </div>

                                <div className="team-content">
                                    <div className="team-category" style={{ color: member.color }}>
                                        {member.category}
                                    </div>
                                    <h3 className="team-name">{member.name}</h3>
                                    <p className="team-role">{member.role}</p>
                                    <p className="team-expertise">{member.expertise}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSpotlight; 