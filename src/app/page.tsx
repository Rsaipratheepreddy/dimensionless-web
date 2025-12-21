'use client';

import AppLayout from '../components/AppLayout';
import DashboardHero from '../components/DashboardHero';
import StatsCards from '../components/StatsCards';
import ContinueSection, { CarouselItem } from '../components/ContinueSection';
import LessonList from '../components/LessonList';
import ActionCards from '../components/ActionCards';

export default function Home() {
    const artItems: CarouselItem[] = [
        {
            title: "Divine Serenity - Buddha Oil Painting",
            artist: "Leonardo samsul",
            artistAvatar: "/member-names.png",
            category: "OIL PAINTING",
            image: "/painting.png",
            price: "₹12,500",
            color: "#0ea5e9"
        },
        {
            title: "Modern Architecture Vision Studio",
            artist: "Bayu Saito",
            artistAvatar: "/founder1.png",
            category: "PHOTOGRAPHY",
            image: "/studio.png",
            price: "₹8,000",
            color: "#6366f1"
        },
        {
            title: "Abstract Branding & Identity Design",
            artist: "Padhang Satrio",
            artistAvatar: "/founder2.png",
            category: "DIGITAL ART",
            image: "/abtimg.png",
            price: "₹5,400",
            color: "#ec4899"
        },
        {
            title: "Cosmic Whispers - Acrylic Mix",
            artist: "Sarah Chen",
            artistAvatar: "/member-names.png",
            category: "ACRYLIC",
            image: "/painting.png",
            price: "₹15,200",
            color: "#8b5cf6"
        },
        {
            title: "Urban Solitude - B&W Collection",
            artist: "Marcus Bell",
            artistAvatar: "/founder1.png",
            category: "SKETCH",
            image: "/studio.png",
            price: "₹4,200",
            color: "#f59e0b"
        },
        {
            title: "Nature's Echo - Water Color",
            artist: "Elena Rodriguez",
            artistAvatar: "/founder2.png",
            category: "WATER COLOR",
            image: "/abtimg.png",
            price: "₹9,800",
            color: "#10b981"
        }
    ];

    const tattooItems: CarouselItem[] = [
        {
            title: "Minimalist Lotus Fine Line",
            artist: "Generic",
            artistAvatar: "/member-names.png",
            category: "MINIMALIST",
            image: "/studio.png",
            color: "#1e293b"
        },
        {
            title: "Neo-Traditional Phoenix Backpiece",
            artist: "Generic",
            artistAvatar: "/founder1.png",
            category: "NEO-TRADITIONAL",
            image: "/painting.png",
            color: "#ef4444"
        },
        {
            title: "Geometric Mandala Sleeve",
            artist: "Generic",
            artistAvatar: "/founder2.png",
            category: "GEOMETRIC",
            image: "/abtimg.png",
            color: "#6366f1"
        },
        {
            title: "Watercolor Dreamcatcher",
            artist: "Generic",
            artistAvatar: "/member-names.png",
            category: "WATERCOLOR",
            image: "/studio.png",
            color: "#ec4899"
        },
        {
            title: "Japanese Irezumi Dragon",
            artist: "Generic",
            artistAvatar: "/founder1.png",
            category: "TRADITIONAL",
            image: "/painting.png",
            color: "#f59e0b"
        },
        {
            title: "Tiny Constellation Wrist Tattoo",
            artist: "Generic",
            artistAvatar: "/founder2.png",
            category: "FINELINE",
            image: "/abtimg.png",
            color: "#10b981"
        }
    ];

    const leasingItems: CarouselItem[] = [
        {
            title: "Vibrant Horizon - Corporate Collection",
            artist: "Studio Ardent",
            artistAvatar: "/ajay-founder.png",
            category: "CORPORATE",
            image: "/studio.png",
            price: "₹2,500/mo",
            color: "#1e293b"
        },
        {
            title: "Serenity Flow - Zen Garden Series",
            artist: "Elena Rodriguez",
            artistAvatar: "/founder2.png",
            category: "WELLNESS",
            image: "/painting.png",
            price: "₹3,200/mo",
            color: "#10b981"
        },
        {
            title: "Industrial Echo - Metal Series",
            artist: "Marcus Bell",
            artistAvatar: "/founder1.png",
            category: "INDUSTRIAL",
            image: "/abtimg.png",
            price: "₹4,000/mo",
            color: "#f59e0b"
        },
        {
            title: "Nature's Whispers - Office Set",
            artist: "Studio Ardent",
            artistAvatar: "/ajay-founder.png",
            category: "CORPORATE",
            image: "/painting.png",
            price: "₹2,800/mo",
            color: "#8b5cf6"
        },
        {
            title: "Modern Solitude - Loft Collection",
            artist: "Bayu Saito",
            artistAvatar: "/founder1.png",
            category: "MODERN",
            image: "/studio.png",
            price: "₹3,500/mo",
            color: "#3b82f6"
        },
        {
            title: "Abstract Pulse - Gallery Rental",
            artist: "Padhang Satrio",
            artistAvatar: "/founder2.png",
            category: "EXHIBITION",
            image: "/abtimg.png",
            price: "₹5,000/mo",
            color: "#f43f5e"
        }
    ];

    return (
        <AppLayout>
            <div className="dashboard-content">
                <DashboardHero />
                <ActionCards />


                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    <ContinueSection
                        title="Trending Art"
                        items={artItems}
                        buttonText="Buy Now"
                    />

                    <ContinueSection
                        title="Trending Tattoos"
                        items={tattooItems}
                        showPrice={false}
                        showAvatar={false}
                        buttonText="Book Slot"
                    />

                    <ContinueSection
                        title="Art Leasing"
                        items={leasingItems}
                        buttonText="Lease Now"
                    />
                </div>

                <LessonList />
            </div>
        </AppLayout>
    );
}
