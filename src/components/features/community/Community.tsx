'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconUsers,
    IconStar,
    IconPalette,
    IconBrush,
    IconSchool,
    IconPlane,
    IconBuildingStore,
    IconHeart,
    IconArrowRight,
    IconSparkles
} from '@tabler/icons-react';
import './Community.css';

gsap.registerPlugin(ScrollTrigger);

export interface CommunityProps {
    className?: string;
}

const Community: React.FC<CommunityProps> = ({
    className = ''
}) => {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const heroImageRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const membersRef = useRef<HTMLDivElement>(null);


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
            gsap.set([badgeRef.current, titleRef.current, heroImageRef.current], {
                y: 50,
                opacity: 0
            });

            if (statsRef.current) {
                gsap.set(statsRef.current.children, {
                    y: 30,
                    opacity: 0
                });
            }

            if (membersRef.current) {
                const memberCards = membersRef.current.querySelectorAll('.member-profile');
                gsap.set(memberCards, {
                    y: 60,
                    opacity: 0,
                    scale: 0.95
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
                }, "-=0.4")
                .to(heroImageRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.6");

            // Stats animation
            if (statsRef.current) {
                gsap.to(statsRef.current.children, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            }

            // Members animation
            if (membersRef.current) {
                const memberCards = membersRef.current.querySelectorAll('.member-profile');

                gsap.to(memberCards, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    stagger: {
                        amount: 1.2,
                        from: "start"
                    },
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: membersRef.current,
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

    const communityStats = [
        {
            number: "81+",
            label: "Active Members",
            icon: IconUsers,
            color: "#ff6b6b"
        },
        {
            number: "11",
            label: "Alpha Chapter",
            icon: IconStar,
            color: "#4ecdc4"
        },
        {
            number: "5+",
            label: "Years Growing",
            icon: IconSparkles,
            color: "#a855f7"
        }
    ];

    const alphaMembers = [
        {
            name: "Mohit",
            role: "Digital Marketing Lead",
            expertise: "Digital presence and web development",
            image: "/studio.png",
            icon: IconBrush,
            color: "#ff6b6b"
        },
        {
            name: "Anitha",
            role: "Art Classes Manager",
            expertise: "Indian Folk Art specialist",
            image: "/founder2.png",
            icon: IconPalette,
            color: "#4ecdc4"
        },
        {
            name: "Dr. Avin Sharma",
            role: "Visual Arts Expert",
            expertise: "Ph.D. in Visual Arts & research",
            image: "/studio.png",
            icon: IconSchool,
            color: "#a855f7"
        },
        {
            name: "Anjali Jangra",
            role: "Charcoal Artist",
            expertise: "Technical precision with artistry",
            image: "/founder2.png",
            icon: IconPlane,
            color: "#fd79a8"
        },
        {
            name: "Glany Richard",
            role: "Artist & Teacher",
            expertise: "Studio owner with art expertise",
            image: "/studio.png",
            icon: IconBuildingStore,
            color: "#00b894"
        },
        {
            name: "Prasad",
            role: "Creative Member",
            expertise: "Active community contributor",
            image: "/founder2.png",
            icon: IconHeart,
            color: "#fdcb6e"
        }
    ];

    // Duplicate for infinite scroll effect
    const duplicatedMembers = [...alphaMembers, ...alphaMembers];

    const handleJoinCommunity = () => {
        console.log('Join Community clicked');
    };

    return (
        <section ref={sectionRef} className={`community-section ${className}`} data-theme={currentTheme}>
            <div className="community-container">
                {/* Header */}
                <div className="community-header">
                    <div ref={badgeRef} className="community-badge">
                        <span>Community</span>
                    </div>

                    <h2 ref={titleRef} className="community-title">
                        DNA Network <span className="highlight">(Dimensionless Network of Artists)</span>
                    </h2>

                    <p className="community-subtitle">
                        Empowering Artpreneurs through collaborative platform designed to help artists
                        and entrepreneurs learn, create, and grow within the art industry.
                    </p>
                </div>

                {/* Founder & Stats Combined */}
                <div ref={heroImageRef} className="founder-stats-section">
                    <div className="founder-hero">
                        <div className="founder-image">
                            <img src="/founder2.png" alt="Ajay Sharma - Founder" />
                        </div>
                        <div className="founder-content">
                            <h3>Founded by <span className="highlight">Ajay Sharma</span> in 2019</h3>
                            <p>Creative community fostering artistic innovation</p>
                        </div>
                    </div>

                    <div ref={statsRef} className="community-stats">
                        {communityStats.map((stat, index) => (
                            <div key={stat.label} className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="join-community-section">
                        <button className="join-community-btn" onClick={handleJoinCommunity}>
                            <span>Join Our Community</span>
                            <IconArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Alpha Chapter Section */}
                <div className="alpha-section">
                    <div className="alpha-header">
                        <h3 className="alpha-title">Alpha Chapter <span className="highlight">Highlights</span></h3>
                        <p className="alpha-description">
                            Partner with our team of artists, thinkers and industry experts to take your creative
                            strategy to the next level. We have consulted with top minds and created innovative solutions.
                        </p>
                    </div>

                    <div
                        ref={membersRef}
                        className="experts-gallery"
                    >
                        <div className="experts-scroll-container">
                            {duplicatedMembers.map((member, index) => (
                                <div
                                    key={`${member.name}-${index}`}
                                    className="expert-card"
                                >
                                    <div className="expert-image">
                                        <img src={member.image} alt={member.name} />
                                        <div className="artistic-frame"></div>
                                        <div className="paint-splash" style={{ backgroundColor: member.color }}></div>
                                    </div>
                                    <div className="expert-info">
                                        <h4 className="expert-name">{member.name}</h4>
                                        <p className="expert-role">{member.role}</p>
                                        <div className="artistic-underline" style={{ backgroundColor: member.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
};

export default Community; 