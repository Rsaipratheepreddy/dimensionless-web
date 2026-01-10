'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus, IconEdit, IconTrash, IconPalette } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/ui/LottieLoader';
import AddCategoryModal from '@/components/features/admin/AddCategoryModal';

interface Category {
    id: string;
    name: string;
    type: string;
    description: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminCategoriesPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            fetchCategories();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE'
            });
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const filteredCategories = categories.filter(c => {
        if (filter === 'all') return true;
        return c.type === filter;
    });

    const types = ['all', 'tattoo', 'art', 'leasing'];

    return (
        <AppLayout>
            <div className="admin-container">
                <div className="page-header">
                    <div>
                        <h1>Category Management</h1>
                        <p>Manage categories across all platform sections</p>
                    </div>
                    <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <IconPlus size={20} />
                        Add Category
                    </button>
                </div>

                <div className="controls-row">
                    <div className="filters-group">
                        {(types || []).map((type: any) => (
                            <button
                                key={type}
                                className={filter === type ? 'active' : ''}
                                onClick={() => setFilter(type)}
                            >
                                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                ({type === 'all' ? categories.length : categories.filter(c => c.type === type).length})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="admin-grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {(filteredCategories || []).map((category: any) => (
                        <div key={category.id} className="management-card">
                            <div className="card-header">
                                <div className="stat-icon" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                    <IconPalette size={20} />
                                </div>
                                <div className="action-info">
                                    <strong>{category.name}</strong>
                                    <span className="status-tag user">{category.type}</span>
                                </div>
                            </div>
                            <p className="action-info" style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', minHeight: '40px' }}>
                                {category.description || 'No description provided'}
                            </p>
                            <div className="admin-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                <span className={`status-tag ${category.is_active ? 'employee' : 'user'}`}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="action-btn-admin secondary"
                                        onClick={() => toggleActive(category.id, category.is_active)}
                                    >
                                        {category.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        className="action-btn-admin secondary"
                                        style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                                        onClick={() => deleteCategory(category.id)}
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="empty-state">
                        <p>No categories found</p>
                    </div>
                )}
            </div>

            <AddCategoryModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchCategories}
            />
        </AppLayout>
    );
}
