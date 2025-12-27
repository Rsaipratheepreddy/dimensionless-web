'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
    IconPlus,
    IconUpload,
    IconTrash,
    IconEdit,
    IconLoader2,
    IconPackage,
    IconClock,
    IconCheck,
    IconX,
    IconTruckDelivery
} from '@tabler/icons-react';
import LottieLoader from '@/components/LottieLoader';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import './page.css';

interface LeasablePainting {
    id: string;
    title: string;
    description: string;
    artist_name: string;
    image_url: string;
    hourly_rate: number;
    daily_rate: number;
    monthly_rate: number;
    yearly_rate: number;
    preferred_rate_interval: 'hourly' | 'daily' | 'monthly' | 'yearly';
    artist_avatar_url: string;
    is_available: boolean;
}

interface LeaseOrder {
    id: string;
    user_id: string;
    painting_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
    shipping_address: string;
    profiles: {
        full_name: string;
    };
    leasable_paintings: {
        title: string;
    };
}

export default function AdminLeasingPage() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
    const [inventory, setInventory] = useState<LeasablePainting[]>([]);
    const [orders, setOrders] = useState<LeaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState<LeasablePainting | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [artistName, setArtistName] = useState('');
    const [rateAmount, setRateAmount] = useState('');
    const [rateInterval, setRateInterval] = useState<'hourly' | 'daily' | 'monthly' | 'yearly'>('monthly');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [artistAvatarFile, setArtistAvatarFile] = useState<File | null>(null);
    const [artistPreviewUrl, setArtistPreviewUrl] = useState('');

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchData();
        }
    }, [profile, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'inventory') {
                const { data, error } = await supabase
                    .from('leasable_paintings')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setInventory(data || []);
            } else {
                const { data, error } = await supabase
                    .from('lease_orders')
                    .select(`
                        *,
                        profiles:user_id(full_name),
                        leasable_paintings:painting_id(title)
                    `)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setOrders(data as any || []);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setTitle(item.title);
        setDescription(item.description);
        setCategory(item.category || 'General');
        setArtistName(item.artist_name);
        setRateInterval(item.preferred_rate_interval);
        const currentRate = item[`${item.preferred_rate_interval}_rate` as keyof LeasablePainting];
        setRateAmount(currentRate?.toString() || '0');
        setPreviewUrl(item.image_url);
        setArtistPreviewUrl(item.artist_avatar_url || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            const { error } = await supabase
                .from('leasable_paintings')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Listing deleted');
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleArtistPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setArtistAvatarFile(file);
            setArtistPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = previewUrl;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const filePath = `leasing/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('artwork-images').upload(filePath, imageFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('artwork-images').getPublicUrl(filePath);
                imageUrl = publicUrl;
            }

            let artistAvatarUrl = artistPreviewUrl;
            if (artistAvatarFile) {
                const fileExt = artistAvatarFile.name.split('.').pop();
                const filePath = `artists/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('artwork-images').upload(filePath, artistAvatarFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('artwork-images').getPublicUrl(filePath);
                artistAvatarUrl = publicUrl;
            }

            const payload = {
                title,
                description,
                category: category || 'General',
                artist_name: artistName,
                image_url: imageUrl,
                artist_avatar_url: artistAvatarUrl,
                preferred_rate_interval: rateInterval,
                hourly_rate: rateInterval === 'hourly' ? parseFloat(rateAmount) : 0,
                daily_rate: rateInterval === 'daily' ? parseFloat(rateAmount) : 0,
                monthly_rate: rateInterval === 'monthly' ? parseFloat(rateAmount) : 0,
                yearly_rate: rateInterval === 'yearly' ? parseFloat(rateAmount) : 0,
            };

            if (editingItem) {
                const { error } = await supabase
                    .from('leasable_paintings')
                    .update(payload)
                    .eq('id', editingItem.id);
                if (error) throw error;
                toast.success('Leasable artwork updated!');
            } else {
                const { error } = await supabase
                    .from('leasable_paintings')
                    .insert([payload]);
                if (error) throw error;
                toast.success('Leasable artwork added!');
            }

            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('lease_orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success('Order updated!');
            fetchData();
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setArtistName('');
        setRateAmount('');
        setRateInterval('monthly');
        setImageFile(null);
        setPreviewUrl('');
        setArtistAvatarFile(null);
        setArtistPreviewUrl('');
    };

    if (profile?.role !== 'admin') {
        return (
            <AppLayout>
                <div className="admin-leasing-container">
                    <div className="error-center">
                        <h2>Access Denied</h2>
                        <p>Only administrators can access this page.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="admin-leasing-container">
                <header className="admin-leasing-header">
                    <div>
                        <h1>Art Leasing Admin</h1>
                        <p>Manage your leasable inventory and rental orders</p>
                    </div>
                    <button className="post-submit-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        <IconPlus size={20} /> Add Leasable Art
                    </button>
                </header>

                <nav className="admin-leasing-tabs">
                    <button
                        className={`leasing-tab ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <IconPackage size={18} /> Inventory
                    </button>
                    <button
                        className={`leasing-tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <IconClock size={18} /> Leasing Orders
                    </button>
                </nav>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <>
                        {activeTab === 'inventory' ? (
                            <div className="inventory-section">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Artwork</th>
                                            <th>Artist</th>
                                            <th>Category</th>
                                            <th>Preferred Rate</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="table-artwork-info">
                                                        <img src={item.image_url} alt={item.title} className="table-thumb" />
                                                        <span>{item.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-artist-info">
                                                        {item.artist_avatar_url && <img src={item.artist_avatar_url} alt={item.artist_name} className="table-avatar" />}
                                                        <span>{item.artist_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="status-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                        {(item as any).category || 'General'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="table-rate-badge">
                                                        ₹{item.preferred_rate_interval === 'hourly' ? item.hourly_rate : item.preferred_rate_interval === 'daily' ? item.daily_rate : item.preferred_rate_interval === 'monthly' ? item.monthly_rate : item.yearly_rate}
                                                        <small>/{item.preferred_rate_interval.slice(0, 2)}</small>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${item.is_available ? 'available' : 'leased'}`}>
                                                        {item.is_available ? 'Available' : 'Leased'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button className="action-btn-sm" onClick={() => handleEdit(item)} title="Edit">
                                                            <IconEdit size={16} />
                                                        </button>
                                                        <button className="action-btn-sm" onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }} title="Delete">
                                                            <IconTrash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="orders-section">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Artwork</th>
                                            <th>Duration</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td>{order.profiles?.full_name}</td>
                                                <td>{order.leasable_paintings?.title}</td>
                                                <td>{new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}</td>
                                                <td>₹{order.total_price}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            className="action-btn-sm"
                                                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                            title="Mark as Shipped"
                                                        >
                                                            <IconTruckDelivery size={16} />
                                                        </button>
                                                        <button
                                                            className="action-btn-sm"
                                                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                            title="Mark as Delivered"
                                                        >
                                                            <IconCheck size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <header className="modal-header">
                                <h2>{editingItem ? 'Edit Leasable Painting' : 'Add Leasable Painting'}</h2>
                                <button className="action-btn-sm" onClick={() => setIsModalOpen(false)}><IconX size={20} /></button>
                            </header>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group full">
                                        <label>Title</label>
                                        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Artwork Title" />
                                    </div>

                                    <div className="form-group">
                                        <label>Artist Name</label>
                                        <input value={artistName} onChange={e => setArtistName(e.target.value)} required placeholder="Artist public name" />
                                    </div>

                                    <div className="form-group">
                                        <label>Category</label>
                                        <input value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g. Abstract, Modern, Classic" />
                                    </div>

                                    <div className="form-group">
                                        <label>Artist Photo (Optional)</label>
                                        <div className="artist-upload-wrapper" onClick={() => document.getElementById('artist-upload')?.click()}>
                                            <input type="file" id="artist-upload" hidden onChange={handleArtistPhotoChange} />
                                            {artistPreviewUrl ? (
                                                <img src={artistPreviewUrl} className="artist-preview-img" alt="Artist" />
                                            ) : (
                                                <div className="artist-upload-placeholder">
                                                    <IconUpload size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Interval</label>
                                        <select value={rateInterval} onChange={e => setRateInterval(e.target.value as any)}>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input type="number" value={rateAmount} onChange={e => setRateAmount(e.target.value)} required placeholder="0.00" />
                                    </div>

                                    <div className="form-group full">
                                        <label>Artwork Image</label>
                                        <div className="upload-zone" onClick={() => document.getElementById('leasable-upload')?.click()}>
                                            <input type="file" id="leasable-upload" hidden onChange={handleImageChange} required={!previewUrl} />
                                            {previewUrl ? (
                                                <img src={previewUrl} className="preview-img" alt="Preview" />
                                            ) : (
                                                <>
                                                    <IconUpload size={40} color="#94a3b8" />
                                                    <p>Click to upload leasable art</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group full">
                                        <label>Description</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Tell about the art..." />
                                    </div>
                                </div>
                                <footer className="modal-footer">
                                    <button type="button" className="action-btn-sm" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="post-submit-btn" disabled={uploading}>
                                        {uploading ? 'Processing...' : (editingItem ? 'Update Art' : 'Upload Art')}
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
