'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import './page.css';

interface Artwork {
    id: string;
    title: string;
    image_url?: string;
    purchase_price?: number;
}

interface Tattoo {
    id: string;
    name: string;
    image_url?: string;
    base_price?: number;
}

interface HomeData {
    artworks: Artwork[];
    tattoos: Tattoo[];
    piercings: any[];
    artClasses: any[];
}

export default function Home() {
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHomeData() {
            try {
                const response = await fetch('/api/home');
                const data = await response.json();
                setHomeData(data);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <AppLayout>
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="home-page">
                <div className="hero-section">
                    <h1>Welcome to Dimensionless</h1>
                    <p>Discover unique artworks, custom tattoo designs, professional piercings, and art classes</p>
                </div>

                <section className="section">
                    <div className="section-header">
                        <h2>Latest Artworks</h2>
                        <Link href="/shop">View All →</Link>
                    </div>
                    <div className="cards-grid">
                        {homeData?.artworks && homeData.artworks.length > 0 ? (
                            homeData.artworks.map((artwork) => (
                                <Link key={artwork.id} href={`/shop/${artwork.id}`}>
                                    <div className="card">
                                        <div className="card-image artwork-bg">🎨</div>
                                        <div className="card-body">
                                            <h3>{artwork.title}</h3>
                                            {artwork.purchase_price && (
                                                <p className="card-price">₹{Number(artwork.purchase_price).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state">No artworks available</div>
                        )}
                    </div>
                </section>

                <section className="section">
                    <div className="section-header">
                        <h2>Latest Tattoo Designs</h2>
                        <Link href="/tattoos">View All →</Link>
                    </div>
                    <div className="cards-grid">
                        {homeData?.tattoos && homeData.tattoos.length > 0 ? (
                            homeData.tattoos.map((tattoo) => (
                                <Link key={tattoo.id} href="/tattoos">
                                    <div className="card">
                                        <div className="card-image tattoo-bg">✨</div>
                                        <div className="card-body">
                                            <h3>{tattoo.name}</h3>
                                            {tattoo.base_price && (
                                                <p className="card-price">Starting at ₹{Number(tattoo.base_price).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state">No tattoo designs available</div>
                        )}
                    </div>
                </section>

                <div className="cta-section">
                    <h2>Ready to Get Started?</h2>
                    <p>Explore our collection or book a consultation today</p>
                    <div className="cta-buttons">
                        <Link href="/shop" className="cta-btn-primary">Browse Artworks</Link>
                        <Link href="/tattoos" className="cta-btn-secondary">View Tattoos</Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
