'use client';

import React, { useState } from 'react';
import { IconPhoto, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AddArtworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editArtwork?: any;
}

export default function AddArtworkModal({ isOpen, onClose, onSuccess, editArtwork }: AddArtworkModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [about, setAbout] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [leaseRate, setLeaseRate] = useState('');
    const [category, setCategory] = useState('Fine Art');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'draft' | 'pending' | 'published' | 'sold' | 'leased' | 'archived'>('published');
    const { profile } = useAuth();

    // New fields
    const [stockQuantity, setStockQuantity] = useState('1');
    const [origin, setOrigin] = useState('');
    const [designStyle, setDesignStyle] = useState('');
    const [medium, setMedium] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [deliveryInfo, setDeliveryInfo] = useState('');
    const [allowPurchase, setAllowPurchase] = useState(true);
    const [allowLease, setAllowLease] = useState(false);
    const [existingImages, setExistingImages] = useState<any[]>([]);

    const supabase = createClient();

    React.useEffect(() => {
        if (editArtwork && isOpen) {
            setTitle(editArtwork.title || '');
            setDescription(editArtwork.description || '');
            setAbout(editArtwork.about || '');
            setPurchasePrice(editArtwork.purchase_price?.toString() || '');
            setLeaseRate(editArtwork.lease_monthly_rate?.toString() || '');
            setCategory(editArtwork.category || 'Fine Art');
            setStockQuantity(editArtwork.stock_quantity?.toString() || '1');
            setOrigin(editArtwork.origin || '');
            setDesignStyle(editArtwork.design_style || '');
            setMedium(editArtwork.medium || '');
            setDimensions(editArtwork.dimensions || '');
            setDeliveryInfo(editArtwork.delivery_info || '');
            setAllowPurchase(editArtwork.allow_purchase ?? true);
            setAllowLease(editArtwork.allow_lease ?? false);
            setStatus(editArtwork.status || 'published');
            setExistingImages(editArtwork.artwork_images || []);
            setPreviews(editArtwork.artwork_images?.map((img: any) => img.image_url) || []);
            setImages([]); // Reset new images
        } else if (isOpen) {
            // Reset for new creation
            setTitle('');
            setDescription('');
            setAbout('');
            setPurchasePrice('');
            setLeaseRate('');
            setCategory('Fine Art');
            setStockQuantity('1');
            setOrigin('');
            setDesignStyle('');
            setMedium('');
            setDimensions('');
            setDeliveryInfo('');
            setAllowPurchase(true);
            setAllowLease(false);
            setStatus(profile?.role === 'admin' ? 'published' : 'pending');
            setExistingImages([]);
            setPreviews([]);
            setImages([]);
        }
    }, [editArtwork, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = async (imageId: string) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0 && existingImages.length === 0) {
            toast.error('Please add at least one image');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const artworkData = {
                title,
                description,
                about,
                artist_id: user.id,
                purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
                lease_monthly_rate: leaseRate ? parseFloat(leaseRate) : null,
                category,
                medium,
                dimensions,
                stock_quantity: parseInt(stockQuantity) || 1,
                origin,
                design_style: designStyle,
                delivery_info: deliveryInfo,
                allow_purchase: allowPurchase,
                allow_lease: allowLease,
                status: status
            };

            let artworkId = editArtwork?.id;

            if (editArtwork) {
                const { error: updateError } = await supabase
                    .from('artworks')
                    .update(artworkData)
                    .eq('id', editArtwork.id);

                if (updateError) throw updateError;
            } else {
                const { data: artwork, error: artworkError } = await supabase
                    .from('artworks')
                    .insert(artworkData)
                    .select()
                    .single();

                if (artworkError) throw artworkError;
                artworkId = artwork.id;
            }

            // 2. Upload NEW Images
            if (images.length > 0) {
                const imageRecords = [];
                for (let i = 0; i < images.length; i++) {
                    const file = images[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${artworkId}/${Date.now()}-${i}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('artwork-images')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('artwork-images')
                        .getPublicUrl(fileName);

                    imageRecords.push({
                        artwork_id: artworkId,
                        image_url: publicUrl,
                        is_primary: i === 0 && existingImages.length === 0,
                        display_order: existingImages.length + i
                    });
                }

                const { error: imagesError } = await supabase
                    .from('artwork_images')
                    .insert(imageRecords);

                if (imagesError) throw imagesError;
            }

            toast.success(editArtwork ? 'Artwork updated successfully!' : 'Artwork added successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || (editArtwork ? 'Failed to update artwork' : 'Failed to add artwork'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`admin-modal-overlay ${isOpen ? 'active' : ''}`} style={{ display: isOpen ? 'flex' : 'none' }}>
            <div className="admin-modal-content" style={{ maxWidth: '900px' }}>
                <div className="admin-modal-header">
                    <h2>{editArtwork ? 'Edit Artwork' : 'Add New Artwork'}</h2>
                    <button type="button" className="admin-modal-close" onClick={onClose}>
                        <IconX size={20} />
                    </button>
                </div>

                <div className="admin-modal-body">
                    <form id="artwork-form" onSubmit={handleSubmit}>
                        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="admin-form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Artwork title"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="Fine Art">Fine Art</option>
                                    <option value="Abstract">Abstract</option>
                                    <option value="Portrait">Portrait</option>
                                    <option value="Landscape">Landscape</option>
                                    <option value="Digital">Digital</option>
                                    <option value="Photography">Photography</option>
                                </select>
                            </div>

                            <div className="admin-form-group full-width">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description..."
                                    rows={2}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <label>About / Story</label>
                                <textarea
                                    value={about}
                                    onChange={e => setAbout(e.target.value)}
                                    placeholder="The story behind this artwork..."
                                    rows={4}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Medium</label>
                                <input type="text" value={medium} onChange={e => setMedium(e.target.value)} placeholder="e.g. Oil on Canvas" />
                            </div>

                            <div className="admin-form-group">
                                <label>Dimensions</label>
                                <input type="text" value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="e.g. 24x36 inches" />
                            </div>

                            <div className="admin-form-group">
                                <label>Origin (Made in)</label>
                                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Italy, India" />
                            </div>

                            <div className="admin-form-group">
                                <label>Design Style</label>
                                <input type="text" value={designStyle} onChange={e => setDesignStyle(e.target.value)} placeholder="e.g. Modern, Renaissance" />
                            </div>

                            <div className="admin-form-group">
                                <label>Delivery Info</label>
                                <input type="text" value={deliveryInfo} onChange={e => setDeliveryInfo(e.target.value)} placeholder="e.g. 2-3 days delivery" />
                            </div>

                            <div className="admin-form-group">
                                <label>Purchase Price (₹)</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={allowPurchase}
                                        onChange={e => setAllowPurchase(e.target.checked)}
                                        style={{ width: 'auto' }}
                                    />
                                    <input
                                        type="number"
                                        value={purchasePrice}
                                        onChange={e => setPurchasePrice(e.target.value)}
                                        disabled={!allowPurchase}
                                        placeholder="0.00"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Monthly Lease (₹)</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={allowLease}
                                        onChange={e => setAllowLease(e.target.checked)}
                                        style={{ width: 'auto' }}
                                    />
                                    <input
                                        type="number"
                                        value={leaseRate}
                                        onChange={e => setLeaseRate(e.target.value)}
                                        disabled={!allowLease}
                                        placeholder="0.00"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                    disabled={profile?.role !== 'admin'}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="published">Published</option>
                                    <option value="sold">Sold</option>
                                    <option value="leased">Leased</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label>Stock Quantity</label>
                                <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} min="1" />
                            </div>

                            <div className="admin-form-group full-width">
                                <label>Artwork Images</label>
                                <div className="image-upload-grid">
                                    {existingImages.map((img, idx) => (
                                        <div key={img.id} className="preview-card">
                                            <img src={img.image_url} alt="Preview" />
                                            <button type="button" className="remove-img" onClick={() => handleRemoveExistingImage(img.id)}>
                                                <IconX size={14} />
                                            </button>
                                            {img.is_primary && <span className="primary-label">Primary</span>}
                                        </div>
                                    ))}
                                    {images.map((img, idx) => (
                                        <div key={idx} className="preview-card">
                                            <img src={URL.createObjectURL(img)} alt="Preview" />
                                            <button type="button" className="remove-img" onClick={() => removeImage(idx)}>
                                                <IconX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="upload-placeholder-card">
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                                        <IconPlus size={24} />
                                        <span>Add Image</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="admin-modal-footer">
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
                    <button form="artwork-form" type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (editArtwork ? 'Update Artwork' : 'Add Artwork')}
                    </button>
                </div>
            </div>

        </div>
    );
}
