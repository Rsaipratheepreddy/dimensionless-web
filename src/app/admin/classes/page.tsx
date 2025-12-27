'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconUsers,
    IconCalendar,
    IconExternalLink,
    IconChartBar
} from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/LottieLoader';
import { toast } from 'react-hot-toast';
import { useModal } from '@/contexts/ModalContext';

interface ArtClass {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    pricing_type: 'free' | 'one_time' | 'subscription';
    price: number;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    _count?: {
        registrations: number;
    };
}

export default function AdminClassesPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { confirm } = useModal();
    const [classes, setClasses] = useState<ArtClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/admin/art-classes');
            const data = await response.json();
            if (response.ok) {
                setClasses(data);
            } else {
                toast.error(data.error || 'Failed to load classes');
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const deleteClass = async (id: string, title: string) => {
        const confirmed = await confirm({
            title: 'Delete Class',
            message: `Are you sure you want to delete "${title}"? This will also remove all associated sessions and historical data.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/art-classes?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('Class deleted successfully');
                setClasses(prev => prev.filter(c => c.id !== id));
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete class');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            toast.error('Error deleting class');
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const filteredClasses = classes.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || c.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: classes.length,
        published: classes.filter(c => c.status === 'published').length,
        draft: classes.filter(c => c.status === 'draft').length,
        totalStudents: classes.reduce((sum, c) => sum + (c._count?.registrations || 0), 0)
    };

    return (
        <AppLayout>
            <div className="admin-classes-page">
                <div className="page-header">
                    <div>
                        <h1>Art Class Management</h1>
                        <p>Create, manage and track your art classes</p>
                    </div>
                    <a href="/admin/classes/new" className="add-btn">
                        <IconPlus size={20} />
                        New Class
                    </a>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Classes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.published}</div>
                        <div className="stat-label">Published</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.draft}</div>
                        <div className="stat-label">Drafts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalStudents}</div>
                        <div className="stat-label">Enrolled Students</div>
                    </div>
                </div>

                <div className="controls-row">
                    <div className="search-box">
                        <IconSearch size={20} />
                        <input
                            type="text"
                            placeholder="Search by class title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filters-group">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                        <button className={filter === 'published' ? 'active' : ''} onClick={() => setFilter('published')}>Published</button>
                        <button className={filter === 'draft' ? 'active' : ''} onClick={() => setFilter('draft')}>Drafts</button>
                        <button className={filter === 'archived' ? 'active' : ''} onClick={() => setFilter('archived')}>Archived</button>
                    </div>
                </div>

                <div className="classes-table-container">
                    <table className="classes-table">
                        <thead>
                            <tr>
                                <th>Class Details</th>
                                <th>Category & Pricing</th>
                                <th>Status</th>
                                <th>Students</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        No classes found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredClasses.map(artClass => (
                                    <tr key={artClass.id}>
                                        <td>
                                            <div className="class-cell">
                                                <img
                                                    src={artClass.thumbnail_url || '/painting.png'}
                                                    alt=""
                                                    className="class-thumb"
                                                />
                                                <div>
                                                    <div className="class-name">{artClass.title}</div>
                                                    <div className="class-meta">
                                                        <IconCalendar size={14} />
                                                        {new Date(artClass.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                <span className={`badge ${artClass.pricing_type}`}>
                                                    {artClass.pricing_type.replace('_', ' ')}
                                                </span>
                                                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                                                    {artClass.pricing_type === 'free' ? 'Free' : `₹${artClass.price.toLocaleString()}`}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${artClass.status}`}>
                                                {artClass.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                                <IconUsers size={16} />
                                                {artClass._count?.registrations || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="icon-btn"
                                                    title="Edit"
                                                    onClick={() => router.push(`/admin/classes/edit/${artClass.id}`)}
                                                >
                                                    <IconEdit size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    title="View Attendees"
                                                    onClick={() => router.push(`/admin/classes/${artClass.id}/attendees`)}
                                                >
                                                    <IconChartBar size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete"
                                                    onClick={() => deleteClass(artClass.id, artClass.title)}
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
        </AppLayout>
    );
}
