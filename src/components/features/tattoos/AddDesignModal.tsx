'use client';

import { useState, useEffect } from 'react';
import { IconX, IconUpload } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';

interface AddDesignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingDesign?: any;
    type?: 'tattoo' | 'piercing';
}

interface Category {
    id: string;
    name: string;
    color: string;
}

export default function AddDesignModal({ isOpen, onClose, onSuccess, editingDesign, type = 'tattoo' }: AddDesignModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        size: 'Medium',
        estimated_duration: 60,
        base_price: 5000,
        image_url: ''
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (editingDesign) {
                setFormData({
                    name: editingDesign.name || '',
                    description: editingDesign.description || '',
                    category_id: editingDesign.category_id || '',
                    size: editingDesign.size || 'Medium',
                    estimated_duration: editingDesign.estimated_duration || 60,
                    base_price: editingDesign.base_price || 5000,
                    image_url: editingDesign.image_url || ''
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    category_id: categories[0]?.id || '',
                    size: 'Medium',
                    estimated_duration: 60,
                    base_price: 5000,
                    image_url: ''
                });
            }
        }
    }, [isOpen, editingDesign]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/categories?type=${type}`);
            const data = await response.json();
            setCategories(data);
            if (data.length > 0 && !formData.category_id && !editingDesign) {
                setFormData(prev => ({ ...prev, category_id: data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image_url: reader.result as string }));
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingDesign
                ? `/api/admin/${type}s/${editingDesign.id}`
                : `/api/admin/${type}s`;

            const response = await fetch(url, {
                method: editingDesign ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(editingDesign ? 'Design updated successfully' : 'Design created successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(editingDesign ? 'Failed to update design' : 'Failed to create design');
            }
        } catch (error) {
            console.error(editingDesign ? 'Error updating design:' : 'Error creating design:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingDesign ? 'Edit Design' : 'Add New Design'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IconX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="design-form">
                    <div className="form-group">
                        <label>Design Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g., Minimalist Lotus"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the design..."
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Size *</label>
                            <select
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                required
                            >
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (minutes) *</label>
                            <input
                                type="number"
                                value={formData.estimated_duration}
                                onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
                                required
                                min="15"
                                step="15"
                            />
                        </div>

                        <div className="form-group">
                            <label>Base Price (₹) *</label>
                            <input
                                type="number"
                                value={formData.base_price}
                                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                                required
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Design Image</label>
                        <div className="image-upload">
                            {formData.image_url ? (
                                <div className="image-preview">
                                    <img src={formData.image_url} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => setFormData({ ...formData, image_url: '' })}
                                    >
                                        <IconX size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-area">
                                    <IconUpload size={32} />
                                    <span>Click to upload image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? (editingDesign ? 'Updating...' : 'Creating...') : (editingDesign ? 'Update Design' : 'Create Design')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
