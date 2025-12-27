'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    IconCalendar,
    IconSearch,
    IconPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconSchool,
    IconUpload,
    IconX,
    IconUsers,
    IconChartBar
} from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/LottieLoader';
import { toast } from 'react-hot-toast';
import { useModal } from '@/contexts/ModalContext';
import { supabase } from '@/utils/supabase';

interface Event {
    id: string;
    title: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
    price: number;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    type: 'event' | 'competition';
    category_name: string;
    _count?: {
        registrations: number;
    };
}

export default function AdminEventsPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { confirm } = useModal();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'competition'>('all');

    // Create Event Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newEventData, setNewEventData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        price: 0,
        type: 'event' as 'event' | 'competition',
        status: 'published' as 'draft' | 'published',
        is_online: false,
        location: '',
        meeting_link: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editEventId, setEditEventId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/admin/events');
            const data = await response.json();
            if (response.ok) {
                setEvents(data);
            } else {
                toast.error(data.error || 'Failed to load events');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (event: Event) => {
        setNewEventData({
            title: event.title,
            description: event.description || '',
            start_date: event.start_date.substring(0, 16), // Format for datetime-local
            end_date: event.end_date.substring(0, 16),
            price: event.price,
            type: event.type,
            status: event.status as any,
            is_online: (event as any).is_online || false,
            location: (event as any).location || '',
            meeting_link: (event as any).meeting_link || ''
        });
        setImagePreview(event.image_url);
        setEditEventId(event.id);
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            let imageUrl = imagePreview;
            if (imageFile) {
                setUploadingImage(true);
                const fileExt = imageFile.name.split('.').pop();
                const filePath = `events/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('artwork-images').upload(filePath, imageFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('artwork-images').getPublicUrl(filePath);
                imageUrl = publicUrl;
                setUploadingImage(false);
            }

            const payload = {
                ...newEventData,
                image_url: imageUrl,
                id: editEventId
            };

            const response = await fetch('/api/admin/events', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(isEditing ? 'Event updated successfully' : 'Event created successfully');

                if (isEditing) {
                    setEvents(prev => prev.map(e => e.id === editEventId ? { ...e, ...data } : e));
                } else {
                    setEvents(prev => [data, ...prev]);
                }

                setShowCreateModal(false);
                resetForm();
            } else {
                const data = await response.json();
                toast.error(data.error || `Failed to ${isEditing ? 'update' : 'create'} event`);
            }
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} event:`, error);
            toast.error(`Error ${isEditing ? 'updating' : 'creating'} event`);
        } finally {
            setCreateLoading(false);
            setUploadingImage(false);
        }
    };

    const resetForm = () => {
        setNewEventData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            price: 0,
            type: 'event',
            status: 'published',
            is_online: false,
            location: '',
            meeting_link: ''
        });
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setEditEventId(null);
    };

    const deleteEvent = async (id: string, title: string) => {
        const confirmed = await confirm({
            title: 'Delete Event',
            message: `Are you sure you want to delete "${title}"? This will also remove all registrations.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/events?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('Event deleted successfully');
                setEvents(prev => prev.filter(e => e.id !== id));
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Error deleting event');
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'competition' ? e.type === 'competition' : e.status === filter);
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: events.length,
        published: events.filter(e => e.status === 'published').length,
        competitions: events.filter(e => e.type === 'competition').length,
        totalAttendees: events.reduce((sum, e) => sum + (e._count?.registrations || 0), 0)
    };

    return (
        <AppLayout>
            <div className="admin-events-page">
                <div className="page-header">
                    <div>
                        <h1>Event & Competition Management</h1>
                        <p>Create, manage and track your events</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="add-btn">
                        <IconPlus size={20} />
                        New Event
                    </button>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.published}</div>
                        <div className="stat-label">Published</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.competitions}</div>
                        <div className="stat-label">Competitions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalAttendees}</div>
                        <div className="stat-label">Total Registrations</div>
                    </div>
                </div>

                <div className="controls-row">
                    <div className="search-box">
                        <IconSearch size={20} />
                        <input
                            type="text"
                            placeholder="Search by event title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filters-group">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                        <button className={filter === 'published' ? 'active' : ''} onClick={() => setFilter('published')}>Published</button>
                        <button className={filter === 'draft' ? 'active' : ''} onClick={() => setFilter('draft')}>Drafts</button>
                        <button className={filter === 'competition' ? 'active' : ''} onClick={() => setFilter('competition')}>Competitions Only</button>
                    </div>
                </div>

                <div className="events-table-container">
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Event Details</th>
                                <th>Type & Pricing</th>
                                <th>Status</th>
                                <th>Attendees</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        No events found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map(event => (
                                    <tr key={event.id}>
                                        <td>
                                            <div className="event-cell-info">
                                                <img
                                                    src={event.image_url || '/painting.png'}
                                                    alt=""
                                                    className="event-thumb"
                                                />
                                                <div>
                                                    <div className="event-name">{event.title}</div>
                                                    <div className="event-meta">
                                                        <IconCalendar size={14} />
                                                        {new Date(event.start_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                <span className={`badge ${event.type}`}>
                                                    {event.type}
                                                </span>
                                                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                                                    {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${event.status}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                                <IconUsers size={16} />
                                                {event._count?.registrations || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="icon-btn"
                                                    title="Edit"
                                                    onClick={() => handleEditClick(event)}
                                                >
                                                    <IconEdit size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    title="View Attendees"
                                                >
                                                    <IconChartBar size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete"
                                                    onClick={() => deleteEvent(event.id, event.title)}
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

                {/* CREATE EVENT MODAL */}
                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal-content admin-modal">
                            <div className="modal-header">
                                <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
                                <button className="close-modal" onClick={() => { setShowCreateModal(false); resetForm(); }}>
                                    <IconPlus size={24} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitEvent}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Event Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newEventData.title}
                                            onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                                            placeholder="Enter event title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={newEventData.type}
                                            onChange={(e) => setNewEventData({ ...newEventData, type: e.target.value as any })}
                                        >
                                            <option value="event">Standard Event</option>
                                            <option value="competition">Competition</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            value={newEventData.description}
                                            onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                                            placeholder="Event description..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newEventData.start_date}
                                            onChange={(e) => setNewEventData({ ...newEventData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newEventData.end_date}
                                            onChange={(e) => setNewEventData({ ...newEventData, end_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input
                                            type="number"
                                            value={newEventData.price}
                                            onChange={(e) => setNewEventData({ ...newEventData, price: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Event Mode</label>
                                        <select
                                            value={newEventData.is_online ? 'online' : 'offline'}
                                            onChange={(e) => setNewEventData({ ...newEventData, is_online: e.target.value === 'online' })}
                                        >
                                            <option value="offline">Offline (Physical Venue)</option>
                                            <option value="online">Online (Virtual)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{newEventData.is_online ? 'Meeting Link' : 'Location'}</label>
                                        <input
                                            type="text"
                                            required
                                            value={newEventData.is_online ? newEventData.meeting_link : newEventData.location}
                                            onChange={(e) => setNewEventData({
                                                ...newEventData,
                                                [newEventData.is_online ? 'meeting_link' : 'location']: e.target.value
                                            })}
                                            placeholder={newEventData.is_online ? 'Zoom, Google Meet, etc.' : 'Enter venue address'}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Event Banner Image</label>
                                        <div
                                            className="upload-zone-event"
                                            onClick={() => document.getElementById('event-img-upload')?.click()}
                                        >
                                            <input
                                                type="file"
                                                id="event-img-upload"
                                                hidden
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            {imagePreview ? (
                                                <div className="preview-container">
                                                    <img src={imagePreview} alt="Preview" className="event-preview-img" />
                                                    <button
                                                        type="button"
                                                        className="remove-preview"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImageFile(null);
                                                            setImagePreview('');
                                                        }}
                                                    >
                                                        <IconX size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <IconUpload size={32} />
                                                    <p>Click to upload event banner</p>
                                                    <span>JPG, PNG or WEBP (Max 5MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={createLoading || uploadingImage}>
                                        {createLoading || uploadingImage ? 'Processing...' : (isEditing ? 'Update Event' : 'Create Event')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
