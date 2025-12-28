'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
    IconLoader2,
    IconArtboard,
    IconSearch,
    IconSettings,
    IconBrush,
    IconHeart
} from '@tabler/icons-react';
import Link from 'next/link';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import './page.css';

interface LeasablePainting {
    id: string;
    title: string;
    artist_name: string;
    artist_avatar_url?: string;
    image_url: string;
    monthly_rate: number;
    hourly_rate: number;
    daily_rate: number;
    yearly_rate: number;
    preferred_rate_interval?: 'hourly' | 'daily' | 'monthly' | 'yearly';
    is_available: boolean;
    category_id?: string;
    lease_orders?: {
        end_date: string;
    }[];
}

interface Category {
    id: string;
    name: string;
    color: string;
}

export default function ArtLeasingGallery() {
    const { profile } = useAuth();
    const [paintings, setPaintings] = useState<LeasablePainting[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paintingsRes, categoriesRes] = await Promise.all([
                supabase
                    .from('leasable_paintings')
                    .select(`
                        *,
                        lease_orders(end_date, status)
                    `)
                    .eq('is_available', true)
                    .order('created_at', { ascending: false }),
                fetch('/api/categories?type=leasing')
            ]);

            if (paintingsRes.error) throw paintingsRes.error;
            setPaintings(paintingsRes.data || []);

            const categoriesData = await categoriesRes.json();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPaintings = paintings.filter(art => {
        const matchesCategory = selectedCategory === 'all' || art.category_id === selectedCategory;
        const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.artist_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getDisplayPrice = (art: LeasablePainting) => {
        const interval = art.preferred_rate_interval || (art.monthly_rate > 0 ? 'monthly' : 'hourly');
        const price = art[`${interval}_rate` as keyof LeasablePainting] as number;
        const labels = { hourly: '/hr', daily: '/day', monthly: '/mo', yearly: '/yr' };
        return { price, label: labels[interval as keyof typeof labels] };
    };

    const getAvailabilityStatus = (art: LeasablePainting) => {
        if (!art.lease_orders || art.lease_orders.length === 0) return null;
        const activeLeases = art.lease_orders
            .filter((o: any) => ['pending', 'processing', 'shipped', 'delivered'].includes(o.status))
            .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

        if (activeLeases.length > 0) {
            const endDate = new Date(activeLeases[0].end_date);
            if (endDate > new Date()) {
                return `Leased until ${endDate.toLocaleDateString()}`;
            }
        }
        return null;
    };

    return (
        <AppLayout>
            <div className="leasing-gallery">
                <header className="leasing-header-v2">
                    <div className="header-left">
                        <h1>Art Leasing</h1>
                        <p>Discover unique collections from talented creators</p>
                    </div>
                    <div className="search-bar-container">
                        <IconSearch size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title or artist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <div className="filter-bar">
                    <button
                        className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Artworks
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <LottieLoader />
                ) : filteredPaintings.length > 0 ? (
                    <div className="leasing-grid">
                        {filteredPaintings.map(art => {
                            const { price, label } = getDisplayPrice(art);
                            const availability = getAvailabilityStatus(art);
                            return (
                                <Link href={`/art-leasing/${art.id}`} key={art.id} className="leasing-card-wrapper">
                                    <div className="leasing-card">
                                        <div className="leasing-card-img-container">
                                            <img src={art.image_url} alt={art.title} className="leasing-card-img" />
                                            <div className="card-wishlist-btn">
                                                <IconHeart size={18} />
                                            </div>
                                            {availability && (
                                                <div className="availability-badge">
                                                    {availability}
                                                </div>
                                            )}
                                        </div>

                                        <div className="leasing-card-overlay">
                                            <div className="overlay-top">
                                                <h3 className="leasing-card-title">{art.title}</h3>
                                                <div className="leasing-artist-row-minimal">
                                                    {art.artist_avatar_url ? (
                                                        <img src={art.artist_avatar_url} className="artist-avatar-xs" />
                                                    ) : (
                                                        <div className="artist-avatar-xs-placeholder">
                                                            <IconBrush size={12} />
                                                        </div>
                                                    )}
                                                    <div className="artist-info-minimal">
                                                        <span className="artist-name-minimal">{art.artist_name}</span>
                                                        <span className="info-label-xs">Artist</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="overlay-bottom">
                                                <div className="leasing-price-minimal">
                                                    ₹{price}<span>{label}</span>
                                                </div>
                                                <div className="lease-action-pill">
                                                    {availability ? 'View Slot' : 'Lease'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="premium-empty-state">
                        <div className="empty-icon-box">
                            <IconArtboard size={48} color="#0f172a" />
                        </div>
                        <h3>No artworks found</h3>
                        <p>Try adjusting your search or category filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
