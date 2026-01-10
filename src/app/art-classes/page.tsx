'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconSearch,
    IconCalendarEvent,
    IconFilter,
    IconCurrencyRupee
} from '@tabler/icons-react';
import Link from 'next/link';
import './page.css';
import { toast } from 'react-hot-toast';
import LottieLoader from '@/components/ui/LottieLoader';
import { supabase } from '@/utils/supabase';

interface ArtClass {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    pricing_type: 'free' | 'one_time' | 'subscription';
    price: number;
    category_name: string;
    category_id: string;
    session_count: number;
}

export default function ArtClassesPage() {
    const [classes, setClasses] = useState<ArtClass[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState<any>(null); // Added banner state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPricing, setSelectedPricing] = useState<string>('all');
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchInitialData();
        fetchBanner(); // Call fetchBanner on initial mount
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [selectedCategory, selectedPricing]);

    const fetchInitialData = async () => {
        try {
            const catResponse = await fetch('/api/categories?type=art_class');
            const catData = await catResponse.json();
            if (catResponse.ok) {
                setCategories(catData);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBanner = async () => {
        try {
            const { data, error } = await supabase.from('home_config').select('*').eq('id', 'classes_banner').single();
            if (error) {
                console.warn('Classes banner fetch notice:', error.message || error);
                return;
            }
            if (data) setBanner(data);
        } catch (error) {
            console.error('Unexpected error fetching banner:', error);
        }
    };

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (selectedPricing !== 'all') params.append('pricing', selectedPricing);

            const response = await fetch(`/api/art-classes?${params.toString()}`);
            const data = await response.json();
            if (response.ok) {
                setClasses(data);
            } else {
                toast.error('Failed to load classes');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        c.id && c.id !== 'undefined' && (
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <AppLayout>
            <div className="art-classes-page">
                {/* Replaced original classes-hero with new banner section */}
                <section className="classes-hero" style={banner?.image_url ? { backgroundImage: `url(${banner.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    <div className="hero-badge">{banner?.title || 'Master Your Craft'}</div>
                    <h1>{banner?.config_data?.hero_title || 'Learn from Professional Artists'}</h1>
                    <p>{banner?.description || 'Browse our curated selection of expert-led art classes and workshops.'}</p>
                </section>

                <div className="discovery-controls">
                    <div className="search-filter-row">
                        <div className="search-input-wrapper">
                            <IconSearch size={22} />
                            <input
                                type="text"
                                placeholder="What would you like to learn?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="pricing-filters">
                            <button
                                className={selectedPricing === 'all' ? 'active' : ''}
                                onClick={() => setSelectedPricing('all')}
                            >
                                All
                            </button>
                            <button
                                className={selectedPricing === 'free' ? 'active' : ''}
                                onClick={() => setSelectedPricing('free')}
                            >
                                Free
                            </button>
                            <button
                                className={selectedPricing === 'one_time' ? 'active' : ''}
                                onClick={() => setSelectedPricing('one_time')}
                            >
                                Paid
                            </button>
                            <button
                                className={selectedPricing === 'subscription' ? 'active' : ''}
                                onClick={() => setSelectedPricing('subscription')}
                            >
                                Subscription
                            </button>
                        </div>
                    </div>

                    <div className="category-tags">
                        <button
                            className={`category-tag ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            All Categories
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tag ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <div className="classes-grid">
                        {filteredClasses.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                No art classes found matching your filters.
                            </div>
                        ) : (
                            filteredClasses.map(c => (
                                <Link href={`/art-classes/${c.id}`} key={c.id} className="class-card">
                                    <div className={`card-thumb ${loadedImages[c.id] ? 'loaded' : ''}`}>
                                        <img
                                            src={c.thumbnail_url || '/painting.png'}
                                            alt={c.title}
                                            loading="lazy"
                                            onLoad={() => setLoadedImages(prev => ({ ...prev, [c.id]: true }))}
                                        />
                                        <span className={`pricing-badge ${c.pricing_type}`}>
                                            {c.pricing_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="card-content">
                                        <span className="cat-name">{c.category_name}</span>
                                        <h3>{c.title}</h3>
                                        <p className="desc">{c.description}</p>
                                        <div className="card-footer">
                                            <div className="price-tag">
                                                {c.pricing_type === 'free' ? 'Free' : `₹${c.price.toLocaleString()}`}
                                            </div>
                                            <div className="sessions-count">
                                                <IconCalendarEvent size={16} />
                                                {c.session_count} {c.session_count === 1 ? 'Session' : 'Sessions'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
