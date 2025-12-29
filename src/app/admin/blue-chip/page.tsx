'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'react-hot-toast';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconPhoto } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';

export default function AdminBlueChipManagement() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        valuation: 0,
        token_price: 0,
        total_tokens: 100,
        available_tokens: 100,
        image_url: '',
        status: 'available'
    });

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const res = await fetch('/api/tokens/config');
            const data = await res.json();
            if (res.ok) setListings(data.blueChip);
        } catch (error) {
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/blue-chip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success('Listing added!');
                setIsAdding(false);
                fetchListings();
            }
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/admin/blue-chip?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Listing deleted');
                fetchListings();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Blue Chip Art Management</h1>
                        <p style={{ color: '#666' }}>Manage premium art listings for $DIMEN token trading</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        style={{ background: '#5b4fe8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, display: 'flex', gap: '8px' }}
                    >
                        <IconPlus size={20} />
                        Add New Listing
                    </button>
                </div>

                {isAdding && (
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '32px' }}>
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <label>Title <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px' }} /></label>
                            <label>Artist <input type="text" required value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px' }} /></label>
                            <label>Valuation (INR) <input type="number" required value={formData.valuation} onChange={e => setFormData({ ...formData, valuation: Number(e.target.value) })} style={{ width: '100%', padding: '10px', marginTop: '4px' }} /></label>
                            <label>Token Price ($DIMEN) <input type="number" required value={formData.token_price} onChange={e => setFormData({ ...formData, token_price: Number(e.target.value) })} style={{ width: '100%', padding: '10px', marginTop: '4px' }} /></label>
                            <label>Image URL <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px' }} /></label>
                            <label>Status
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', marginTop: '4px' }}>
                                    <option value="available">Available</option>
                                    <option value="sold_out">Sold Out</option>
                                    <option value="coming_soon">Coming Soon</option>
                                </select>
                            </label>
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 700 }}>Save Listing</button>
                                <button type="button" onClick={() => setIsAdding(false)} style={{ background: '#f3f4f6', padding: '10px 20px', borderRadius: '8px', fontWeight: 700 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {listings.map(art => (
                        <div key={art.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                            <div style={{ height: '180px', background: '#f9fafb' }}>
                                {art.image_url ? <img src={art.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><IconPhoto size={48} /></div>}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h4 style={{ margin: 0 }}>{art.title}</h4>
                                <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 16px' }}>by {art.artist}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '20px' }}>
                                    <span>Valuation: <strong>₹{art.valuation.toLocaleString()}</strong></span>
                                    <span>Price: <strong>{art.token_price.toLocaleString()} $D</strong></span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => handleDelete(art.id)} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                                        <IconTrash size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
