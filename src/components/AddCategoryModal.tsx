'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'tattoo',
        description: '',
        color: '#8b5cf6'
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setFormData({
                    name: '',
                    type: 'tattoo',
                    description: '',
                    color: '#8b5cf6'
                });
            }
        } catch (error) {
            console.error('Error creating category:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const colorPresets = [
        '#8b5cf6', // Purple
        '#ef4444', // Red
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Orange
        '#ec4899', // Pink
        '#14b8a6', // Teal
        '#f97316', // Orange-red
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Category</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IconX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="category-form">
                    <div className="form-group">
                        <label>Category Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g., Minimalist"
                        />
                    </div>

                    <div className="form-group">
                        <label>Type *</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="tattoo">Tattoo</option>
                            <option value="art">Art</option>
                            <option value="leasing">Leasing</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this category..."
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label>Color *</label>
                        <div className="color-picker">
                            <div className="color-presets">
                                {colorPresets.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`color-preset ${formData.color === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </div>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="color-input"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
