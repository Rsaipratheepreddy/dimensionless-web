'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import './page.css';
import LottieLoader from '@/components/ui/LottieLoader';
import AddDesignModal from '@/components/features/tattoos/AddDesignModal';

interface TattooDesign {
    id: string;
    name: string;
    description: string;
    category: string;
    category_id: string;
    size: string;
    estimated_duration: number;
    base_price: number;
    image_url: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminTattoosPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [designs, setDesigns] = useState<TattooDesign[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useModal();
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [editingDesign, setEditingDesign] = useState<TattooDesign | null>(null);

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchDesigns();
    }, []);

    const fetchDesigns = async () => {
        try {
            const response = await fetch('/api/admin/tattoos');
            const data = await response.json();
            setDesigns(data);
        } catch (error) {
            console.error('Error fetching designs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (design: TattooDesign) => {
        setEditingDesign(design);
        setShowAddModal(true);
    };

    const handleAdd = () => {
        setEditingDesign(null);
        setShowAddModal(true);
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/tattoos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (response.ok) {
                toast.success(`Design ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                fetchDesigns();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Error updating status');
        }
    };

    const deleteDesign = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Delete Design',
            message: `Are you sure you want to delete "${name}"? This will also affect any associated bookings.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/tattoos/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('Design deleted successfully');
                fetchDesigns();
            } else {
                toast.error('Failed to delete design');
            }
        } catch (error) {
            console.error('Error deleting design:', error);
            toast.error('Error deleting design');
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const filteredDesigns = designs.filter(d => {
        if (filter === 'active') return d.is_active;
        if (filter === 'inactive') return !d.is_active;
        return true;
    });

    return (
        <AppLayout>
            <div className="admin-tattoos-page">
                <div className="page-header">
                    <div>
                        <h1>Tattoo Designs</h1>
                        <p>Manage your tattoo design catalog</p>
                    </div>
                    <button className="add-btn" onClick={handleAdd}>
                        <IconPlus size={20} />
                        Add Design
                    </button>
                </div>

                <div className="filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({designs.length})
                    </button>
                    <button
                        className={filter === 'active' ? 'active' : ''}
                        onClick={() => setFilter('active')}
                    >
                        Active ({designs.filter(d => d.is_active).length})
                    </button>
                    <button
                        className={filter === 'inactive' ? 'active' : ''}
                        onClick={() => setFilter('inactive')}
                    >
                        Inactive ({designs.filter(d => !d.is_active).length})
                    </button>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Design</th>
                                <th>Category</th>
                                <th>Size</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDesigns.map(design => (
                                <tr key={design.id}>
                                    <td>
                                        <div className="item-cell">
                                            <img src={design.image_url || '/painting.png'} alt={design.name} className="item-thumb" />
                                            <div className="item-info">
                                                <div className="item-name">{design.name}</div>
                                                <div className="item-desc">{design.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{design.category}</span>
                                    </td>
                                    <td>{design.size}</td>
                                    <td>
                                        <div className="price-info">
                                            <div className="item-price">₹{design.base_price.toLocaleString()}</div>
                                            <div className="item-duration">{design.estimated_duration} mins</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${design.is_active ? 'active' : 'inactive'}`}>
                                            {design.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="icon-btn"
                                                title={design.is_active ? 'Deactivate' : 'Activate'}
                                                onClick={() => toggleActive(design.id, design.is_active)}
                                            >
                                                {design.is_active ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                            </button>
                                            <button
                                                className="icon-btn"
                                                title="Edit"
                                                onClick={() => handleEdit(design)}
                                            >
                                                <IconEdit size={18} />
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                title="Delete"
                                                onClick={() => deleteDesign(design.id, design.name)}
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredDesigns.length === 0 && (
                    <div className="empty-state">
                        <p>No designs found</p>
                        <button onClick={handleAdd}>Add Your First Design</button>
                    </div>
                )}
            </div>

            <AddDesignModal
                isOpen={showAddModal}
                editingDesign={editingDesign}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchDesigns}
            />
        </AppLayout>
    );
}
