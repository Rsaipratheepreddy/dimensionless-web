'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import ArtCard from '@/components/features/tattoos/ArtCard';
import LottieLoader from '@/components/ui/LottieLoader';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './ArtworkDiscovery.css';

type FilterMode = 'all' | 'buy' | 'lease';

export default function ArtworkDiscovery() {
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterMode>('all');
    const { addToCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        fetchArtworks();
    }, [filter]);

    const fetchArtworks = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('artworks')
                .select(`
                    *,
                    artist:profiles!artist_id(full_name, avatar_url),
                    images:artwork_images(*)
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (filter === 'buy') {
                query = query.eq('allow_purchase', true);
            } else if (filter === 'lease') {
                query = query.eq('allow_lease', true);
            }

            const { data, error } = await query;

            if (error) throw error;
            setArtworks(data || []);
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = (art: any) => {
        addToCart({
            id: art.id,
            cartKey: art.id,
            title: art.title,
            price: art.purchase_price,
            image_url: art.images?.find((img: any) => img.is_primary)?.image_url || art.images?.[0]?.image_url,
            artist_id: art.artist_id,
            artist_name: art.artist?.full_name,
            quantity: 1
        });
        toast.success(`${art.title} added to cart!`);
        router.push(`/artworks/${art.id}`); // Navigate to details page
    };

    const handleLeaseNow = (art: any) => {
        router.push(`/artworks/${art.id}`);
    };

    return (
        <section className="artwork-discovery-section">
            <div className="discovery-header">
                <div className="discovery-title-area">
                    <h2 className="discovery-title">All Artworks</h2>
                    <span className="item-count">({artworks.length} items)</span>
                </div>

                <div className="discovery-filters">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-tab ${filter === 'buy' ? 'active' : ''}`}
                        onClick={() => setFilter('buy')}
                    >
                        Buy
                    </button>
                    <button
                        className={`filter-tab ${filter === 'lease' ? 'active' : ''}`}
                        onClick={() => setFilter('lease')}
                    >
                        Lease
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-wrap">
                    <LottieLoader />
                </div>
            ) : artworks.length === 0 ? (
                <div className="empty-discovery">
                    <p>No artworks found in this category.</p>
                </div>
            ) : (
                <div className="artwork-grid">
                    {artworks.map((art) => (
                        <Link key={art.id} href={`/artworks/${art.id}`} style={{ textDecoration: 'none' }}>
                            <ArtCard
                                id={art.id}
                                title={art.title}
                                image={art.images?.find((img: any) => img.is_primary)?.image_url || art.images?.[0]?.image_url}
                                price={art.purchase_price || art.lease_monthly_rate || 0}
                                currency="INR"
                                artistName={art.artist?.full_name}
                                artistAvatar={art.artist?.avatar_url}
                                allowPurchase={art.allow_purchase}
                                allowLease={art.allow_lease}
                                status={art.status}
                                onBuyNow={(e) => {
                                    e.preventDefault(); // Prevent Link navigation
                                    handleBuyNow(art);
                                }}
                                onLeaseNow={(e) => {
                                    e.preventDefault(); // Prevent Link navigation
                                    handleLeaseNow(art);
                                }}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
