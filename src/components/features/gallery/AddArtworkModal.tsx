'use client';

import React, { useState } from 'react';
import { IconPhoto, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase-client';
import { toast } from 'react-hot-toast';

interface AddArtworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editArtwork?: any;
}

export default function AddArtworkModal({ isOpen, onClose, onSuccess, editArtwork }: AddArtworkModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [leaseRate, setLeaseRate] = useState('');
    const [category, setCategory] = useState('Fine Art');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'draft' | 'published'>('published');

    // New fields
    const [stockQuantity, setStockQuantity] = useState('1');
    const [origin, setOrigin] = useState('');
    const [designStyle, setDesignStyle] = useState('');
    const [deliveryInfo, setDeliveryInfo] = useState('');
    const [allowPurchase, setAllowPurchase] = useState(true);
    const [allowLease, setAllowLease] = useState(false);
    const [existingImages, setExistingImages] = useState<any[]>([]);

    const supabase = createClient();

    React.useEffect(() => {
        if (editArtwork && isOpen) {
            setTitle(editArtwork.title || '');
            setDescription(editArtwork.description || '');
            setPurchasePrice(editArtwork.purchase_price?.toString() || '');
            setLeaseRate(editArtwork.lease_monthly_rate?.toString() || '');
            setCategory(editArtwork.category || 'Fine Art');
            setStockQuantity(editArtwork.stock_quantity?.toString() || '1');
            setOrigin(editArtwork.origin || '');
            setDesignStyle(editArtwork.design_style || '');
            setDeliveryInfo(editArtwork.delivery_info || '');
            setAllowPurchase(editArtwork.allow_purchase ?? true);
            setAllowLease(editArtwork.allow_lease ?? false);
            setStatus(editArtwork.status === 'draft' ? 'draft' : 'published');
            setExistingImages(editArtwork.artwork_images || []);
            setPreviews(editArtwork.artwork_images?.map((img: any) => img.image_url) || []);
            setImages([]); // Reset new images
        } else if (isOpen) {
            // Reset for new creation
            setTitle('');
            setDescription('');
            setPurchasePrice('');
            setLeaseRate('');
            setCategory('Fine Art');
            setStockQuantity('1');
            setOrigin('');
            setDesignStyle('');
            setDeliveryInfo('');
            setAllowPurchase(true);
            setAllowLease(false);
            setStatus('published');
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
                artist_id: user.id,
                purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
                lease_monthly_rate: leaseRate ? parseFloat(leaseRate) : null,
                category,
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
        <div className="modal-overlay">
            <div className="modal-content artwork-modal">
                <div className="modal-header">
                    <h2>{editArtwork ? 'Edit Artwork' : 'Add New Artwork'}</h2>
                    <button type="button" className="close-btn" onClick={onClose}><IconX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-section">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="Artwork title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Tell the story behind this piece..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={allowPurchase}
                                            onChange={e => setAllowPurchase(e.target.checked)}
                                        />
                                        Allow Purchase
                                    </label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={allowLease}
                                            onChange={e => setAllowLease(e.target.checked)}
                                        />
                                        Allow Lease
                                    </label>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sale Price (₹)</label>
                                    <input
                                        type="number"
                                        value={purchasePrice}
                                        onChange={e => setPurchasePrice(e.target.value)}
                                        placeholder="Optional"
                                        disabled={!allowPurchase}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Monthly Lease (₹)</label>
                                    <input
                                        type="number"
                                        value={leaseRate}
                                        onChange={e => setLeaseRate(e.target.value)}
                                        placeholder="Optional"
                                        disabled={!allowLease}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={stockQuantity}
                                        onChange={e => setStockQuantity(e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Origin (Made in)</label>
                                    <input
                                        type="text"
                                        value={origin}
                                        onChange={e => setOrigin(e.target.value)}
                                        placeholder="e.g. India"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Design Style</label>
                                    <input
                                        type="text"
                                        value={designStyle}
                                        onChange={e => setDesignStyle(e.target.value)}
                                        placeholder="e.g. Modern Minimalist"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value as 'draft' | 'published')}
                                        className="status-select"
                                    >
                                        <option value="published">Published (Visible to customers)</option>
                                        <option value="draft">Draft (Private to you)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Delivery Info</label>
                                    <input
                                        type="text"
                                        value={deliveryInfo}
                                        onChange={e => setDeliveryInfo(e.target.value)}
                                        placeholder="e.g. 3-5 business days"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <label>Images</label>
                            <div className="image-upload-grid">
                                {previews.map((preview, index) => (
                                    <div key={index} className="preview-card">
                                        <img src={preview} alt="Preview" />
                                        <button type="button" onClick={() => removeImage(index)} className="remove-img">
                                            <IconTrash size={16} />
                                        </button>
                                        {index === 0 && <span className="primary-label">Primary</span>}
                                    </div>
                                ))}
                                <label className="upload-placeholder-card">
                                    <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                                    <IconPlus size={32} />
                                    <span>Add Image</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (editArtwork ? 'Updating...' : 'Adding...') : (editArtwork ? 'Update Artwork' : 'Publish Artwork')}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .artwork-modal {
                    background: white;
                    width: 90%;
                    max-width: 900px;
                    border-radius: 24px;
                    padding: 32px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: #1e293b;
                }
                .form-group input, .form-group textarea, .form-group select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    background: white;
                }
                .status-select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .checkbox-group {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px !important;
                }
                .checkbox-label {
                    display: flex !important;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    user-select: none;
                    margin-bottom: 0 !important;
                }
                .checkbox-label input {
                    width: auto !important;
                    padding: 0 !important;
                }
                .image-upload-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }
                .preview-card {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .preview-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .remove-img {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(255,255,255,0.9);
                    border: none;
                    border-radius: 50%;
                    padding: 4px;
                    cursor: pointer;
                }
                .primary-label {
                    position: absolute;
                    bottom: 4px;
                    left: 4px;
                    background: #36454F;
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .upload-placeholder-card {
                    aspect-ratio: 1;
                    border: 2px dashed #cbd5e1;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    gap: 8px;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }
                .btn-primary {
                    background: #36454F;
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .btn-secondary {
                    background: #f1f5f9;
                    color: #475569;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .artwork-modal {
                        padding: 20px;
                        width: 95%;
                    }
                }
            `}</style>
        </div>
    );
}
