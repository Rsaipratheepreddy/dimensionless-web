'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    IconMapPin,
    IconGlobe,
    IconNavigation,
    IconMap2,
    IconRoute,
    IconCompass,
    IconBuilding,
    IconPhone,
    IconMail,
    IconClock,
    IconExternalLink,
    IconSearch,
    IconStar,
    IconSparkles
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';
import RealisticEarth3D from './RealisticEarth3D';
import './GoogleEarthSection.css';

gsap.registerPlugin(ScrollTrigger);

export interface GoogleEarthSectionProps {
    className?: string;
    onViewOnEarthClick?: () => void;
    onGetDirectionsClick?: () => void;
}

interface LocationData {
    name: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    phone: string;
    email: string;
    hours: string;
    description: string;
    googleEarthUrl: string;
    googleMapsUrl: string;
}

const GoogleEarthSection: React.FC<GoogleEarthSectionProps> = ({
    className = '',
    onViewOnEarthClick,
    onGetDirectionsClick
}) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const { theme } = useTheme();
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const planetContainerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Art studios data for search
    const artStudios = [
        "Dimensionless Studios - Mumbai",
        "Creative Canvas Studio - Delhi",
        "Artistic Vision Gallery - Bangalore",
        "Ink & Paint Workshop - Chennai",
        "Digital Art Hub - Pune",
        "Traditional Crafts Center - Kolkata",
        "Modern Art Space - Hyderabad",
        "Sculpture & Design Studio - Ahmedabad"
    ];

    // Location data for main studio in Bangalore
    const locationData: LocationData = {
        name: "Dimensionless Studios",
        address: "Bangalore, Karnataka, India",
        coordinates: {
            lat: 12.9716,
            lng: 77.5946
        },
        phone: "+91 98765 43210",
        email: "contact@dimensionlessstudios.com",
        hours: "Always Open in the Metaverse",
        description: "Your gateway to infinite creative possibilities across the artistic universe.",
        googleEarthUrl: `https://earth.google.com/web/search/${encodeURIComponent("Dimensionless Studios Mumbai")}/@19.0760,72.8777,10a,1000d,35y,0h,0t,0r`,
        googleMapsUrl: `https://maps.google.com/?q=${19.0760},${72.8777}`
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle search functionality
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length > 0) {
            const filtered = artStudios.filter(studio =>
                studio.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const handleStudioSelect = (studio: string) => {
        setSearchQuery(studio);
        setSearchResults([]);
        console.log(`Selected studio: ${studio}`);
    };

    // GSAP Animation Effect
    useEffect(() => {
        if (!mounted) return;

        const ctx = gsap.context(() => {
            // Set initial states
            gsap.set(titleRef.current, {
                y: 30,
                opacity: 0
            });

            gsap.set(searchRef.current, {
                y: 20,
                opacity: 0
            });

            gsap.set(planetContainerRef.current, {
                x: 50,
                opacity: 0
            });

            // Animation timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });

            tl.to(titleRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            })
                .to(searchRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.4")
                .to(planetContainerRef.current, {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.6");

        }, sectionRef);

        return () => ctx.revert();
    }, [mounted]);

    const handleViewOnEarth = () => {
        if (onViewOnEarthClick) {
            onViewOnEarthClick();
        } else {
            window.open(locationData.googleEarthUrl, '_blank');
        }
    };

    const handleGetDirections = () => {
        if (onGetDirectionsClick) {
            onGetDirectionsClick();
        } else {
            window.open(locationData.googleMapsUrl, '_blank');
        }
    };

    const handleCallPhone = () => {
        window.open(`tel:${locationData.phone}`);
    };

    const handleSendEmail = () => {
        window.open(`mailto:${locationData.email}`);
    };

    if (!mounted) {
        return null;
    }

    return (
        <section ref={sectionRef} className={`google-earth-section theme-${theme} ${className}`}>
            <div className="earth-container">

                {/* Full Screen Earth Experience */}
                <div ref={planetContainerRef} className="fullscreen-earth-container">
                    <RealisticEarth3D
                        latitude={locationData.coordinates.lat}
                        longitude={locationData.coordinates.lng}
                        onLocationClick={() => {
                            console.log('Dimensionless Studios discovered!');
                            handleViewOnEarth();
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        searchResults={searchResults}
                        onStudioSelect={handleStudioSelect}
                    />
                </div>
            </div>
        </section>
    );
};

export default GoogleEarthSection; 