'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconSearch, IconFilter, IconShoppingCart, IconHeart, IconX, IconPlus, IconCheck } from '@tabler/icons-react';
import LottieLoader from '@/components/LottieLoader';
import AppLayout from '@/components/AppLayout';
import ArtCard from '@/components/ArtCard';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import './page.css';

interface Painting {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    artist_id: string;
    category_id: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    } | null;
}

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
    const [selectedPainting, setSelectedPainting] = useState<any | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paintingsRes, categoriesRes] = await Promise.all([
                supabase
                    .from('paintings')
                    .select('*, profiles(full_name, avatar_url)')
                    .eq('status', 'available')
                    .order('created_at', { ascending: false }),
                fetch('/api/categories?type=art')
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



    const handleAddToCart = (painting: any) => {
        addToCart({
            id: painting.id,
            title: painting.title,
            price: painting.price,
            image_url: painting.image_url,
            artist_id: painting.artist_id,
            artist_name: painting.profiles?.full_name
        });
        toast.success(`${painting.title} added to cart!`);
    };

    const filteredPaintings = paintings.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
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
                                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
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
                                    <ArtCard
                                        key={painting.id}
                                        title={painting.title}
                                        image={painting.image_url}
                                        price={painting.price}
                                        artistName={painting.profiles?.full_name}
                                        artistAvatar={painting.profiles?.avatar_url}
                                        showArtist={true}
                                        onClick={() => setSelectedPainting(painting)}
                                        onBuy={() => setSelectedPainting(painting)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedPainting && (
                    <div className="detail-modal-overlay" onClick={() => setSelectedPainting(null)}>
                        <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-detail" onClick={() => setSelectedPainting(null)}>
                                <IconX size={24} />
                            </button>

                            <div className="detail-grid">
                                <div className="detail-image-side">
                                    <img src={selectedPainting.image_url} alt={selectedPainting.title} />
                                </div>

                                <div className="detail-info-side">
                                    <div className="detail-artist">
                                        <img src={selectedPainting.profiles?.avatar_url || '/founder1.png'} alt={selectedPainting.profiles?.full_name} />
                                        <span>{selectedPainting.profiles?.full_name}</span>
                                    </div>

                                    <h1>{selectedPainting.title}</h1>
                                    <div className="detail-price-tag">₹{selectedPainting.price.toLocaleString()}</div>

                                    <div className="detail-desc">
                                        <h3>About the Artwork</h3>
                                        <p>{selectedPainting.description || 'No description available for this piece.'}</p>
                                    </div>

                                    <div className="detail-actions">
                                        <button
                                            className={`add-to-cart-btn ${isInCart(selectedPainting.id) ? 'in-cart' : ''}`}
                                            onClick={() => handleAddToCart(selectedPainting)}
                                        >
                                            {isInCart(selectedPainting.id) ? (
                                                <><IconCheck size={20} /> In Cart</>
                                            ) : (
                                                <><IconPlus size={20} /> Add to Cart</>
                                            )}
                                        </button>
                                        <button className="buy-now-detail-btn" onClick={() => {
                                            if (!isInCart(selectedPainting.id)) handleAddToCart(selectedPainting);
                                            window.location.href = '/checkout';
                                        }}>
                                            Checkout Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

