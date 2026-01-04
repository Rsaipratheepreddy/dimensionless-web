'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconPlus, IconTrash, IconEdit, IconPhoto, IconCircleCheckFilled } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import CreatorBadge from '@/components/ui/CreatorBadge';
import AddArtworkModal from '@/components/features/gallery/AddArtworkModal';
import './GalleryPage.css';

interface Artwork {
    id: string;
    title: string;
    description: string;
    purchase_price: number | null;
    lease_monthly_rate: number | null;
    status: 'draft' | 'published' | 'sold' | 'leased' | 'archived';
    artwork_images: { image_url: string; is_primary: boolean }[];
}

export default function GalleryPage() {
    const { user, profile } = useAuth();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchArtworks();
        }
    }, [user]);

    const fetchArtworks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('artworks')
                .select('*, artwork_images(image_url, is_primary)')
                .eq('artist_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArtworks(data || []);
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LottieLoader />;

    return (
        <AppLayout>
            <div className="gallery-container">
                <div className="gallery-header">
                    <div className="creator-profile-section">
                        <div className="profile-info">
                            <img
                                src={profile?.avatar_url || '/default-avatar.png'}
                                alt={profile?.full_name}
                                className="gallery-avatar"
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h1 className="gallery-title">{profile?.gallery_name || `${profile?.full_name}'s Gallery`}</h1>
                                    {profile?.role === 'creator' && (
                                        <IconCircleCheckFilled size={24} style={{ color: '#3b82f6' }} />
                                    )}
                                </div>
                                <p className="gallery-subtitle">Manage your professional art portfolio</p>
                                {artworks.length < 3 && (
                                    <div className="artwork-milestone-warning">
                                        💡 Add {3 - artworks.length} more artworks to get your gallery highlighted!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                            <IconPlus size={20} />
                            <span>Add Artwork</span>
                        </button>
                    </div>
                </div>

                <div className="artworks-grid">
                    {artworks.length === 0 ? (
                        <div className="empty-state">
                            <IconPhoto size={48} color="#94a3b8" />
                            <h3>Your gallery is empty</h3>
                            <p>Upload your first 3 masterpieces to become a featured creator.</p>
                            <button className="add-btn" style={{ margin: '20px auto' }} onClick={() => setIsModalOpen(true)}>
                                Add Your First Artwork
                            </button>
                        </div>
                    ) : (
                        artworks.map((art) => (
                            <div key={art.id} className="artwork-card">
                                <div className="artwork-image">
                                    <img
                                        src={art.artwork_images.find(img => img.is_primary)?.image_url || '/placeholder-art.png'}
                                        alt={art.title}
                                    />
                                    <span className={`status-badge ${art.status}`}>{art.status}</span>
                                </div>
                                <div className="artwork-details">
                                    <h3>{art.title}</h3>
                                    <div className="pricing-info">
                                        {art.purchase_price && (
                                            <div className="price-tag">
                                                <span className="label">Sale:</span>
                                                <span className="value">₹{art.purchase_price.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {art.lease_monthly_rate && profile?.is_pro && (
                                            <div className="price-tag lease">
                                                <span className="label">Lease:</span>
                                                <span className="value">₹{art.lease_monthly_rate.toLocaleString()}/mo</span>
                                            </div>
                                        )}
                                        {art.lease_monthly_rate && !profile?.is_pro && (
                                            <div className="price-tag lease unavailable">
                                                <span className="label">Lease Status:</span>
                                                <span className="value" style={{ fontSize: '12px', color: '#dc2626' }}>Pro Only</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <AddArtworkModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchArtworks}
                />
            </div>
        </AppLayout>
    );
}
