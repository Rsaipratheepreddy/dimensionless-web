'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconSearch, IconFilter, IconShoppingCart, IconHeart, IconX, IconPlus, IconCheck } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import ArtCard from '@/components/features/tattoos/ArtCard';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import './page.css';

interface Category {
    id: string;
    name: string;
    color: string;
}

export default function BuyArtPage() {
    const { user } = useAuth();
    const { addToCart, isInCart } = useCart();
    const [paintings, setPaintings] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [artworksRes, categoriesRes] = await Promise.all([
                supabase
                    .from('artworks')
                    .select('*, profiles:artist_id(full_name, avatar_url), artwork_images(*)')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false }),
                fetch('/api/categories?type=art')
            ]);

            if (artworksRes.error) throw artworksRes.error;
            setPaintings(artworksRes.data || []);

            const categoriesResData = await categoriesRes.json();
            setCategories(categoriesResData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (painting: any) => {
        addToCart({
            id: painting.id,
            cartKey: painting.id,
            title: painting.title,
            price: painting.purchase_price,
            image_url: painting.artwork_images?.find((img: any) => img.is_primary)?.image_url || painting.artwork_images?.[0]?.image_url,
            artist_id: painting.artist_id,
            artist_name: painting.profiles?.full_name,
            quantity: 1
        });
        toast.success(`${painting.title} added to cart!`);
    };

    const filteredPaintings = paintings.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AppLayout>
            <div className="marketplace-container">
                <div className="marketplace-header">
                    <div className="header-text">
                        <h1>Buy Original Art</h1>
                        <p>Discover unique collections from talented creators</p>
                    </div>
                    <div className="header-tools">
                        <div className="search-bar-market">
                            <IconSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by title or artist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="marketplace-content">
                    <div className="content-filters">
                        <button
                            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            All Artworks
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.name)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <LottieLoader />
                    ) : (
                        <div className="marketplace-grid">
                            {filteredPaintings.length === 0 ? (
                                <div className="no-results">
                                    <h3>No artworks found</h3>
                                    <p>Try adjusting your search query.</p>
                                </div>
                            ) : (
                                filteredPaintings.map((painting) => (
                                    <Link key={painting.id} href={`/artworks/${painting.id}`} style={{ textDecoration: 'none' }}>
                                        <ArtCard
                                            id={painting.id}
                                            title={painting.title}
                                            image={painting.artwork_images?.find((img: any) => img.is_primary)?.image_url || painting.artwork_images?.[0]?.image_url}
                                            price={painting.purchase_price || painting.lease_monthly_rate}
                                            currency={painting.purchase_price ? 'INR' : 'Lease'}
                                            artistName={painting.profiles?.full_name}
                                            artistAvatar={painting.profiles?.avatar_url}
                                            allowPurchase={painting.allow_purchase}
                                            allowLease={painting.allow_lease}
                                            onBuyNow={(e) => {
                                                e.preventDefault();
                                                handleAddToCart(painting);
                                            }}
                                        />
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
