'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
    IconArrowLeft,
    IconDeviceFloppy,
    IconPlus,
    IconTrash,
    IconCalendar,
    IconClock,
    IconLink,
    IconCurrencyRupee,
    IconUpload,
    IconLoader2
} from '@tabler/icons-react';
import { supabase } from '@/utils/supabase';
import './editor.css';
import LottieLoader from '@/components/ui/LottieLoader';
import { toast } from 'react-hot-toast';

interface Session {
    id?: string;
    session_title: string;
    session_date: string;
    session_time: string;
    session_link: string;
}

export default function ClassEditorPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params.id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        category_id: '',
        pricing_type: 'free' as 'free' | 'one_time' | 'subscription',
        price: 0,
        subscription_duration: 30,
        status: 'draft' as 'draft' | 'published' | 'archived'
    });

    const [sessions, setSessions] = useState<Session[]>([
        { session_title: 'Introduction', session_date: '', session_time: '10:00', session_link: '' }
    ]);

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchClassData();
        }
    }, [isEdit]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories?type=art_class');
            const data = await response.json();
            if (response.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchClassData = async () => {
        try {
            const response = await fetch(`/api/admin/art-classes/${params.id}`);
            const data = await response.json();
            if (response.ok) {
                setFormData({
                    title: data.title,
                    description: data.description || '',
                    thumbnail_url: data.thumbnail_url || '',
                    category_id: data.category_id || '',
                    pricing_type: data.pricing_type,
                    price: data.price,
                    subscription_duration: data.subscription_duration || 30,
                    status: data.status
                });
                setSessions(data.sessions || []);
            } else {
                toast.error('Failed to load class data');
                router.push('/admin/classes');
            }
        } catch (error) {
            console.error('Error fetching class:', error);
            toast.error('Error loading class data');
        } finally {
            setLoading(false);
        }
    };

    const addSession = () => {
        setSessions([...sessions, {
            session_title: '',
            session_date: '',
            session_time: '10:00',
            session_link: ''
        }]);
    };

    const removeSession = (index: number) => {
        if (sessions.length === 1) return;
        setSessions(sessions.filter((_, i) => i !== index));
    };

    const updateSessionValue = (index: number, field: keyof Session, value: string) => {
        const newSessions = [...sessions];
        newSessions[index] = { ...newSessions[index], [field]: value };
        setSessions(newSessions);
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return toast.error('File size must be less than 5MB');
            }

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `art-classes/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('artwork-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('artwork-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, thumbnail_url: publicUrl });
            toast.success('Thumbnail uploaded!');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title) return toast.error('Title is required');
        if (sessions.some(s => !s.session_date || !s.session_time)) {
            return toast.error('Please fill in all session dates and times');
        }

        setSaving(true);
        try {
            const response = await fetch('/api/admin/art-classes' + (isEdit ? `/${params.id}` : ''), {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, sessions })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(isEdit ? 'Class updated!' : 'Class created!');
                router.push('/admin/classes');
            } else {
                toast.error(data.error || 'Failed to save class');
            }
        } catch (error) {
            console.error('Error saving class:', error);
            toast.error('Error connecting to server');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="class-editor-page">
                <div className="editor-header">
                    <button className="back-btn" onClick={() => router.back()}>
                        <IconArrowLeft size={20} />
                        Back
                    </button>
                    <h1>{isEdit ? 'Edit Art Class' : 'Create New Art Class'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="editor-form">
                    <div className="form-main">
                        <section className="form-section">
                            <h3>Basic Information</h3>
                            <div className="form-group">
                                <label>Class Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a catchy title..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows={6}
                                    placeholder="Describe what students will learn..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>Pricing & Access</h3>
                            <div className="pricing-grid">
                                <label className={`pricing-card ${formData.pricing_type === 'free' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="pricing"
                                        hidden
                                        checked={formData.pricing_type === 'free'}
                                        onChange={() => setFormData({ ...formData, pricing_type: 'free', price: 0 })}
                                    />
                                    <div className="pricing-icon free">F</div>
                                    <div className="pricing-details">
                                        <h4>Free</h4>
                                        <p>Direct access</p>
                                    </div>
                                </label>
                                <label className={`pricing-card ${formData.pricing_type === 'one_time' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="pricing"
                                        hidden
                                        checked={formData.pricing_type === 'one_time'}
                                        onChange={() => setFormData({ ...formData, pricing_type: 'one_time' })}
                                    />
                                    <div className="pricing-icon paid">P</div>
                                    <div className="pricing-details">
                                        <h4>One-time</h4>
                                        <p>Single payment</p>
                                    </div>
                                </label>
                                <label className={`pricing-card ${formData.pricing_type === 'subscription' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="pricing"
                                        hidden
                                        checked={formData.pricing_type === 'subscription'}
                                        onChange={() => setFormData({ ...formData, pricing_type: 'subscription' })}
                                    />
                                    <div className="pricing-icon sub">S</div>
                                    <div className="pricing-details">
                                        <h4>Subscription</h4>
                                        <p>Recurring access</p>
                                    </div>
                                </label>
                            </div>

                            {formData.pricing_type !== 'free' && (
                                <div className="price-inputs">
                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <div className="input-with-icon">
                                            <IconCurrencyRupee size={20} />
                                            <input
                                                type="number"
                                                value={isNaN(formData.price) ? '' : formData.price}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {formData.pricing_type === 'subscription' && (
                                        <div className="form-group">
                                            <label>Duration (Days)</label>
                                            <input
                                                type="number"
                                                value={isNaN(formData.subscription_duration) ? '' : formData.subscription_duration}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setFormData({ ...formData, subscription_duration: isNaN(val) ? 0 : val });
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="form-section">
                            <div className="section-header">
                                <h3>Class Sessions</h3>
                                <button type="button" className="add-session-btn" onClick={addSession}>
                                    <IconPlus size={18} /> Add Session
                                </button>
                            </div>
                            <div className="sessions-list">
                                {sessions.map((session, index) => (
                                    <div key={index} className="session-item">
                                        <div className="session-head">
                                            <span className="session-number">Session {index + 1}</span>
                                            {sessions.length > 1 && (
                                                <button type="button" className="remove-btn" onClick={() => removeSession(index)}>
                                                    <IconTrash size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="session-grid">
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="E.g. Sketching basics"
                                                    value={session.session_title}
                                                    onChange={e => updateSessionValue(index, 'session_title', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Date</label>
                                                <div className="input-with-icon">
                                                    <IconCalendar size={18} />
                                                    <input
                                                        type="date"
                                                        value={session.session_date}
                                                        onChange={e => updateSessionValue(index, 'session_date', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Time</label>
                                                <div className="input-with-icon">
                                                    <IconClock size={18} />
                                                    <input
                                                        type="time"
                                                        value={session.session_time}
                                                        onChange={e => updateSessionValue(index, 'session_time', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group span-2">
                                                <label>Class Link (Zoom/Meet)</label>
                                                <div className="input-with-icon">
                                                    <IconLink size={18} />
                                                    <input
                                                        type="url"
                                                        placeholder="https://zoom.us/j/..."
                                                        value={session.session_link}
                                                        onChange={e => updateSessionValue(index, 'session_link', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="form-sidebar">
                        <section className="form-section sticky">
                            <h3>Thumbnail</h3>
                            <div className="thumbnail-upload">
                                <div
                                    className={`thumb-preview-zone ${uploading ? 'uploading' : ''}`}
                                    onClick={() => !uploading && document.getElementById('thumb-input')?.click()}
                                >
                                    {formData.thumbnail_url ? (
                                        <img src={formData.thumbnail_url} alt="Preview" />
                                    ) : (
                                        <div className="thumb-placeholder">
                                            {uploading ? <IconLoader2 className="animate-spin" size={32} /> : <IconUpload size={32} />}
                                            <span>{uploading ? 'Uploading...' : 'Click to upload thumbnail'}</span>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="upload-overlay">
                                            <IconLoader2 className="animate-spin" size={24} />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="thumb-input"
                                    hidden
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                    disabled={uploading}
                                />
                                {formData.thumbnail_url && !uploading && (
                                    <button
                                        type="button"
                                        className="change-thumb-btn"
                                        onClick={() => document.getElementById('thumb-input')?.click()}
                                    >
                                        Change Image
                                    </button>
                                )}
                                <small>Recommended size: 1200x800px (Max 5MB)</small>
                            </div>
                            <hr />
                            <button type="submit" className="save-btn" disabled={saving}>
                                <IconDeviceFloppy size={20} />
                                {saving ? 'Saving...' : (isEdit ? 'Update Class' : 'Create Class')}
                            </button>
                        </section>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
