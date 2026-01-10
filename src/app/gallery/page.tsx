'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconPlus, IconTrash, IconEdit, IconPhoto, IconCircleCheckFilled, IconCopy } from '@tabler/icons-react';
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
    status: 'draft' | 'pending' | 'published' | 'sold' | 'leased' | 'archived';
    artwork_images: { image_url: string; is_primary: boolean }[];
    created_at?: string;
}

export default function GalleryPage() {
    const { user, profile } = useAuth();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArt, setEditingArt] = useState<Artwork | undefined>(undefined);

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

    const handleDuplicate = async (art: Artwork) => {
        try {
            // 1. Create the new artwork object
            const { id, created_at, artwork_images, ...rest } = art;
            const newArt = {
                ...rest,
                title: `${art.title} (Copy)`,
                status: 'draft', // Default to draft for safety
                created_at: new Date().toISOString()
            };

            // 2. Insert the artwork
            const { data: insertedArt, error: artError } = await supabase
                .from('artworks')
                .insert(newArt)
                .select()
                .single();

            if (artError) throw artError;

            // 3. Duplicate images
            if (artwork_images && artwork_images.length > 0) {
                const newImages = artwork_images.map(img => ({
                    artwork_id: insertedArt.id,
                    image_url: img.image_url,
                    is_primary: img.is_primary
                }));

                const { error: imgError } = await supabase
                    .from('artwork_images')
                    .insert(newImages);

                if (imgError) throw imgError;
            }

            toast.success('Artwork duplicated successfully');
            fetchArtworks(); // Refresh the list
        } catch (error: any) {
            console.error('Duplication error:', error);
            toast.error(error.message || 'Failed to duplicate artwork');
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

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
                        <button className="add-btn" onClick={() => {
                            setEditingArt(undefined);
                            setIsModalOpen(true);
                        }}>
                            <IconPlus size={20} />
                            <span>Add Artwork</span>
                        </button>
                    </div>
                </div>

                <div className="artworks-table-container">
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
                        <table className="artworks-table responsive-table">
                            <thead>
                                <tr>
                                    <th>Artwork</th>
                                    <th>Status</th>
                                    <th>Pricing</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artworks.map((art) => (
                                    <tr key={art.id}>
                                        <td data-label="Artwork" className="full-width-cell">
                                            <div className="artwork-cell">
                                                <div className="artwork-thumb">
                                                    <img
                                                        src={art.artwork_images.find(img => img.is_primary)?.image_url || '/placeholder-art.png'}
                                                        alt={art.title}
                                                    />
                                                </div>
                                                <div className="artwork-info">
                                                    <div className="artwork-name">{art.title}</div>
                                                    <div className="artwork-id">ID: {art.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <span className={`status-pill ${art.status}`}>{art.status}</span>
                                        </td>
                                        <td data-label="Pricing">
                                            <div className="pricing-cell">
                                                {art.purchase_price ? (
                                                    <div className="price-item">
                                                        <span>Sale:</span>
                                                        <strong>₹{art.purchase_price.toLocaleString()}</strong>
                                                    </div>
                                                ) : null}
                                                {art.lease_monthly_rate && (
                                                    <div className="price-item lease">
                                                        <span>Lease:</span>
                                                        <strong>₹{art.lease_monthly_rate.toLocaleString()}/mo</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="action-cell">
                                                <button
                                                    className="icon-btn"
                                                    title="Duplicate Artwork"
                                                    onClick={() => handleDuplicate(art)}
                                                >
                                                    <IconCopy size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    title="Edit Artwork"
                                                    onClick={() => {
                                                        setEditingArt(art);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <IconEdit size={18} />
                                                </button>
                                                <button className="icon-btn delete" title="Delete Artwork">
                                                    <IconTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <AddArtworkModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingArt(undefined);
                    }}
                    onSuccess={fetchArtworks}
                    editArtwork={editingArt}
                />
            </div>
        </AppLayout>
    );
}
