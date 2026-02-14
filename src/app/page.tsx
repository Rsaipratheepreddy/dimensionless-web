'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ArtCard from '@/components/features/tattoos/ArtCard';
import Link from 'next/link';
import Image from 'next/image';
import './page.css';

interface ArtworkImage {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
}

interface Artwork {
    id: string;
    title: string;
    image_url?: string;
    images?: ArtworkImage[];
    purchase_price?: number;
    lease_monthly_rate?: number;
    status?: string;
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

function getArtworkImage(artwork: Artwork): string {
    if (artwork.image_url) return artwork.image_url;
    if (artwork.images && artwork.images.length > 0) {
        const primary = artwork.images.find(img => img.is_primary);
        return primary?.image_url || artwork.images[0]?.image_url || '/painting.png';
    }
    return '/painting.png';
}

export default function Home() {
    const router = useRouter();
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
                                <ArtCard
                                    key={artwork.id}
                                    id={artwork.id}
                                    title={artwork.title}
                                    image={getArtworkImage(artwork)}
                                    price={Number(artwork.purchase_price) || 0}
                                    currency="INR"
                                    allowPurchase={!!artwork.purchase_price}
                                    allowLease={!!artwork.lease_monthly_rate}
                                    status={artwork.status === 'sold' ? 'sold' : 'available'}
                                    onClick={() => router.push(`/artworks/${artwork.id}`)}
                                />
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
                                <div key={tattoo.id} className="card" onClick={() => router.push('/tattoos')}>
                                    <div className="card-image tattoo-bg">
                                        {tattoo.image_url ? (
                                            <Image
                                                src={tattoo.image_url}
                                                alt={tattoo.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized
                                            />
                                        ) : (
                                            <span>✨</span>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <h3>{tattoo.name}</h3>
                                        {tattoo.base_price && (
                                            <p className="card-price">Starting at ₹{Number(tattoo.base_price).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
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
