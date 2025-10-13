'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import {
    IconBrush,
    IconBook,
    IconPalette,
    IconArrowRight,
    IconCalendar,
    IconStar,
    IconUsers,
    IconTrendingUp
} from '@tabler/icons-react';
import { cmsData } from '../data/cmsData';
import { useTheme } from '../contexts/ThemeContext';
import './Banner.css';

export interface BannerProps {
    className?: string;
    showVisuals?: boolean;
    onCTAClick?: () => void;
}

const Banner: React.FC<BannerProps> = ({
    className = '',
    showVisuals = true,
    onCTAClick
}) => {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const cardsRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const userTagsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // GSAP Animation Effect
    useEffect(() => {
        if (!mounted) return;

        const tl = gsap.timeline();

        // Set initial states
        gsap.set(cardRefs.current, {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 0.8,
            opacity: 0,
            transformOrigin: "center center"
        });

        gsap.set([titleRef.current, descriptionRef.current, buttonsRef.current], {
            y: 30,
            opacity: 0
        });

        gsap.set(subtitleRef.current, {
            y: 20,
            opacity: 0
        });

        gsap.set(userTagsRef.current, {
            scale: 0,
            opacity: 0
        });

        // Animation sequence
        tl.to(titleRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        })
            .to(subtitleRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.6")
            .to(cardRefs.current, {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, "-=0.4")
            .to(cardRefs.current, {
                rotation: (i) => (i - 2) * 8, // Center card stays at 0, others rotate
                x: (i) => (i - 2) * 120, // Spread horizontally
                y: (i) => Math.abs(i - 2) * 10, // Slight vertical offset
                duration: 1.2,
                ease: "power2.out",
                stagger: 0.05
            }, "-=0.2")
            .to(userTagsRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "back.out(1.7)"
            }, "-=0.8")
            .to(descriptionRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.6")
            .to(buttonsRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.4");

    }, [mounted]);

    const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
        IconBrush,
        IconBook,
        IconPalette,
        IconArrowRight,
        IconCalendar,
        IconStar,
        IconUsers,
        IconTrendingUp
    };

    const handlePrimaryCTA = () => {
        if (onCTAClick) {
            onCTAClick();
        } else {
            console.log(`Hero CTA Action: ${cmsData.hero.cta.primary.action}`);
            // You can add navigation logic here
            // window.location.href = cmsData.hero.cta.primary.href;
        }
    };

    const handleSecondaryCTA = () => {
        console.log(`Hero CTA Action: ${cmsData.hero.cta.secondary.action}`);
        // You can add navigation logic here
        // window.location.href = cmsData.hero.cta.secondary.href;
    };

    if (!mounted) {
        return null;
    }

    const artworks = [
        { id: 1, image: '/studio.png', title: 'Abstract Art', alt: 'Abstract Art Creation' },
        { id: 2, image: '/DSC02862-2.jpeg', title: 'Nature Design', alt: 'Nature Inspired Design' },
        { id: 3, image: '/studio.png', title: 'Digital Art', alt: 'Digital Art Creation' },
        { id: 4, image: '/DSC02862-2.jpeg', title: 'Clean Design', alt: 'Minimalist Clean Design' },
        { id: 5, image: '/studio.png', title: 'Creative Work', alt: 'Creative Artwork' }
    ];

    return (
        <section className={`hero-banner theme-${theme} ${className}`}>
            <div className="hero-container">
                {/* Main Title */}
                <h1 ref={titleRef} className="hero-title">
                    Explore Dimensionless<br />
                    <span className="highlight-word">Art & Tech</span>
                </h1>
                <div ref={cardsRef} className="cards-container">
                    <div ref={userTagsRef} className="user-tags">
                        <div className="user-tag user-tag-left">@coplin</div>
                        <div className="user-tag user-tag-right">@andrea</div>
                    </div>

                    <div className="cards-stack">
                        {artworks.map((artwork, index) => (
                            <div
                                key={artwork.id}
                                ref={(el) => { cardRefs.current[index] = el; }}
                                className={`card card-${index + 1} artwork-card`}
                            >
                                <div className="artwork-image">
                                    <img
                                        src={artwork.image}
                                        alt={artwork.alt}
                                        title={artwork.title}
                                    />
                                    <div className="artwork-overlay"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner; 