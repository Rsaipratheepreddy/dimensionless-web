'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconSearch, IconFilter } from '@tabler/icons-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import LottieLoader from '@/components/ui/LottieLoader';
import AddArtworkModal from '@/components/features/gallery/AddArtworkModal';
import './page.css';

interface Artwork {
    id: string;
    title: string;
    description: string;
    category: string;
    purchase_price: number | null;
    lease_monthly_rate: number | null;
    status: string;
    artist: {
        full_name: string;
    };
    artwork_images?: any[];
}

export default function AdminArtPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useModal();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'all';
    const [filter, setFilter] = useState(initialFilter);

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/artworks');
            const data = await response.json();
            if (response.ok) {
                setArtworks(data);
            } else {
                toast.error(data.error || 'Failed to load artworks');
            }
        } catch (error) {
            console.error('Error fetching artworks:', error);
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (artwork: Artwork) => {
        setEditingArtwork(artwork);
        setShowAddModal(true);
    };

    const handleAdd = () => {
        setEditingArtwork(null);
        setShowAddModal(true);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        let newStatus = currentStatus === 'published' ? 'draft' : 'published';

        // If current status is pending, we are approving it
        if (currentStatus === 'pending') {
            newStatus = 'published';
        }

        try {
            const response = await fetch(`/api/admin/artworks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                toast.success(`Artwork ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
                fetchArtworks();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Error updating status');
        }
    };

    const deleteArtwork = async (id: string, title: string) => {
        const confirmed = await confirm({
            title: 'Delete Artwork',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/artworks/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('Artwork deleted successfully');
                fetchArtworks();
            } else {
                toast.error('Failed to delete artwork');
            }
        } catch (error) {
            console.error('Error deleting artwork:', error);
            toast.error('Error deleting artwork');
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const filteredArtworks = artworks.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.artist?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || a.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <AppLayout>
            <div className="admin-container">
                <div className="page-header">
                    <div>
                        <h1>Art Management</h1>
                        <p>Manage standard artwork listings and catalog</p>
                    </div>
                    <button className="add-btn" onClick={handleAdd}>
                        <IconPlus size={20} />
                        Add Artwork
                    </button>
                </div>

                <div className="controls-row">
                    <div className="search-box">
                        <IconSearch size={20} />
                        <input
                            type="text"
                            placeholder="Search by title or artist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filters-group">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                        <button className={filter === 'published' ? 'active' : ''} onClick={() => setFilter('published')}>Published</button>
                        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending Approval</button>
                        <button className={filter === 'draft' ? 'active' : ''} onClick={() => setFilter('draft')}>Drafts</button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Artwork</th>
                                <th>Category</th>
                                <th>Artist</th>
                                <th>Pricing</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArtworks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="empty-state">
                                        No artworks found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredArtworks.map(artwork => (
                                    <tr key={artwork.id}>
                                        <td>
                                            <div className="item-cell">
                                                <img
                                                    src={artwork.artwork_images?.[0]?.image_url || '/painting.png'}
                                                    alt={artwork.title}
                                                    className="item-thumb"
                                                />
                                                <div className="item-info">
                                                    <div className="item-name">{artwork.title}</div>
                                                    <div className="item-desc">{artwork.description?.substring(0, 50)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge">{artwork.category}</span>
                                        </td>
                                        <td>{artwork.artist?.full_name || 'Admin'}</td>
                                        <td>
                                            <div className="price-info">
                                                {artwork.purchase_price && (
                                                    <div className="item-price">Buy: ₹{artwork.purchase_price.toLocaleString()}</div>
                                                )}
                                                {artwork.lease_monthly_rate && (
                                                    <div className="item-price lease">Lease: ₹{artwork.lease_monthly_rate}/mo</div>
                                                )}
                                                {!artwork.purchase_price && !artwork.lease_monthly_rate && '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${artwork.status}`}>
                                                {artwork.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                {artwork.status === 'pending' ? (
                                                    <button
                                                        className="icon-btn approve"
                                                        title="Approve & Publish"
                                                        onClick={() => toggleStatus(artwork.id, 'draft')} // toggleStatus(id, 'draft') will set it to 'published'
                                                        style={{ color: '#22c55e' }}
                                                    >
                                                        <IconEye size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="icon-btn"
                                                        title={artwork.status === 'published' ? 'Move to Draft' : 'Publish'}
                                                        onClick={() => toggleStatus(artwork.id, artwork.status)}
                                                    >
                                                        {artwork.status === 'published' ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                                    </button>
                                                )}
                                                <button
                                                    className="icon-btn"
                                                    title="Edit"
                                                    onClick={() => handleEdit(artwork)}
                                                >
                                                    <IconEdit size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete"
                                                    onClick={() => deleteArtwork(artwork.id, artwork.title)}
                                                >
                                                    <IconTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddArtworkModal
                isOpen={showAddModal}
                editArtwork={editingArtwork}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchArtworks}
            />
        </AppLayout>
    );
}
