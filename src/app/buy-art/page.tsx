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
    profiles: {
        full_name: string;
        avatar_url: string;
    } | null;
}

export default function BuyArtPage() {
    const { user } = useAuth();
    const { addToCart, isInCart } = useCart();
    const [paintings, setPaintings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPainting, setSelectedPainting] = useState<any | null>(null);

    useEffect(() => {
        fetchAvailablePaintings();
    }, []);

    const fetchAvailablePaintings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('paintings')
                .select('*, profiles(full_name, avatar_url)')
                .eq('status', 'available')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPaintings(data || []);
        } catch (error) {
            console.error('Error fetching marketplace:', error);
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

    const filteredPaintings = paintings.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <button className="filter-btn active">All Artworks</button>
                        <button className="filter-btn">New Releases</button>
                        <button className="filter-btn">Trending</button>
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

