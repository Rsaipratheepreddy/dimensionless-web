'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus, IconEdit, IconTrash, IconPalette } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/LottieLoader';
import AddCategoryModal from '@/components/AddCategoryModal';

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
            <div className="admin-categories-page">
                <div className="page-header">
                    <div>
                        <h1>Category Management</h1>
                        <p>Manage categories across all sections</p>
                    </div>
                    <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <IconPlus size={20} />
                        Add Category
                    </button>
                </div>

                <div className="filters">
                    {types.map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                        >
                            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                            ({type === 'all' ? categories.length : categories.filter(c => c.type === type).length})
                        </button>
                    ))}
                </div>

                <div className="categories-grid">
                    {filteredCategories.map(category => (
                        <div key={category.id} className="category-card">
                            <div className="category-header">
                                <div className="category-color" style={{ backgroundColor: category.color }}>
                                    <IconPalette size={20} color="white" />
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <span className="type-badge">{category.type}</span>
                                </div>
                            </div>
                            <p className="category-description">{category.description || 'No description'}</p>
                            <div className="category-footer">
                                <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <div className="category-actions">
                                    <button onClick={() => toggleActive(category.id, category.is_active)}>
                                        {category.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => deleteCategory(category.id)}>
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
