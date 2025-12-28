'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconSettings,
    IconDeviceFloppy,
    IconLayoutDashboard,
    IconPalette,
    IconArtboard,
    IconBrush,
    IconPlus,
    IconTrash,
    IconExternalLink,
    IconUpload,
    IconLoader2,
    IconSearch
} from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import LottieLoader from '@/components/ui/LottieLoader';
import { supabase } from '@/utils/supabase';
import './page.css';

interface ConfigSection {
    id: string;
    title: string;
    description: string;
    items: any[];
    image_url?: string;
    link_url?: string;
    config_data: any;
}

const ImageUpload = ({ value, onChange, bucket = 'media' }: { value: string, onChange: (url: string) => void, bucket?: string }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `cms/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(publicUrl);
            toast.success('Image uploaded!');
        } catch (error: any) {
            toast.error(error.message || 'Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-upload-wrapper">
            {value ? (
                <div className="image-preview-mini">
                    <img src={value} alt="Preview" />
                    <button onClick={() => onChange('')} className="remove-img-btn"><IconTrash size={14} /></button>
                </div>
            ) : (
                <label className="upload-placeholder-mini">
                    {uploading ? <IconLoader2 className="animate-spin" size={18} /> : <IconUpload size={18} />}
                    <span>Upload Image</span>
                    <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
                </label>
            )}
        </div>
    );
};


const REQD_SECTIONS = [
    {
        id: 'home_banner',
        title: 'Home Carousel',
        description: 'Main banner at the top of the home page',
        items: [],
        config_data: {}
    }
];

export default function CMSPage() {
    const [configs, setConfigs] = useState<ConfigSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || profile?.role !== 'admin') {
                router.replace('/');
                return;
            }
            fetchConfigs();
        }
    }, [user, profile, authLoading, router]);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/cms');
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Merge with defaults so user always has something to configure
            const mergedData = REQD_SECTIONS.map(reqd => {
                const existing = (data || []).find((c: any) => c.id === reqd.id);
                return existing || reqd;
            });

            setConfigs(mergedData as ConfigSection[]);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (config: ConfigSection) => {
        setSaving(config.id);
        try {
            const res = await fetch('/api/admin/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success(`${config.title} updated!`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(null);
        }
    };

    const handleAddItem = (configId: string) => {
        if (configId === 'home_banner') {
            setConfigs(prev => prev.map(c => {
                if (c.id === configId) {
                    return {
                        ...c,
                        items: [...(c.items || []), { title: '', description: '', image: '', link: '' }]
                    };
                }
                return c;
            }));
        }
    };


    const handleRemoveItem = (configId: string, index: number) => {
        setConfigs(prev => prev.map(c => {
            if (c.id === configId) {
                const newItems = [...c.items];
                newItems.splice(index, 1);
                return { ...c, items: newItems };
            }
            return c;
        }));
    };

    const handleItemChange = (configId: string, index: number, field: string, value: string) => {
        setConfigs(prev => prev.map(c => {
            if (c.id === configId) {
                const newItems = [...c.items];
                newItems[index] = { ...newItems[index], [field]: value };
                return { ...c, items: newItems };
            }
            return c;
        }));
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="cms-page">
                <header className="cms-header">
                    <div className="header-info">
                        <h1>Content Management</h1>
                        <p>Configure home page sections, trending items, and banners.</p>
                    </div>
                </header>

                <div className="cms-grid">
                    {configs.map(config => (
                        <section key={config.id} className="cms-section-card">
                            <div className="section-header">
                                <div className="section-title-group">
                                    {config.id === 'home_banner' ? <IconPalette size={24} /> :
                                        config.id === 'trending_art' ? <IconBrush size={24} /> :
                                            config.id === 'trending_tattoos' ? <IconArtboard size={24} /> :
                                                <IconLayoutDashboard size={24} />}
                                    <h3>{config.title}</h3>
                                </div>
                                <button
                                    className="save-btn"
                                    onClick={() => handleUpdate(config)}
                                    disabled={saving === config.id}
                                >
                                    {saving === config.id ? 'Saving...' : <><IconDeviceFloppy size={18} /> Save Changes</>}
                                </button>
                            </div>

                            <div className="section-body">
                                <div className="input-group">
                                    <label>Display Title</label>
                                    <input
                                        type="text"
                                        value={config.title}
                                        onChange={(e) => setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, title: e.target.value } : c))}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Section Description</label>
                                    <textarea
                                        value={config.description}
                                        onChange={(e) => setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, description: e.target.value } : c))}
                                    />
                                </div>

                                {(config.id === 'events_banner' || config.id === 'classes_banner') && (
                                    <div className="banner-config">
                                        <div className="input-group">
                                            <label>Hero Title (Large)</label>
                                            <input
                                                type="text"
                                                value={config.config_data?.hero_title || ''}
                                                onChange={(e) => setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, config_data: { ...(c.config_data || {}), hero_title: e.target.value } } : c))}
                                                placeholder="e.g. Unite, Compete, and Grow"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Banner Image</label>
                                            <ImageUpload
                                                value={config.image_url || ''}
                                                onChange={(url) => setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, image_url: url } : c))}
                                            />
                                        </div>
                                    </div>
                                )}

                                {config.id === 'home_banner' && (
                                    <div className="items-list-editor">
                                        <div className="items-header">
                                            <h4>Carousel Slides</h4>
                                            <button className="add-item-btn" onClick={() => handleAddItem(config.id)}>
                                                <IconPlus size={16} /> Add Slide
                                            </button>
                                        </div>

                                        <div className="items-grid">
                                            {config.items && config.items.map((item, idx) => (
                                                <div key={idx} className="item-edit-card">
                                                    <div className="item-edit-header">
                                                        <span>Slide #{idx + 1}</span>
                                                        <button className="delete-item-btn" onClick={() => handleRemoveItem(config.id, idx)}>
                                                            <IconTrash size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="item-edit-fields">
                                                        <input
                                                            placeholder="Title"
                                                            value={item.title}
                                                            onChange={(e) => handleItemChange(config.id, idx, 'title', e.target.value)}
                                                        />
                                                        <input
                                                            placeholder="Description"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(config.id, idx, 'description', e.target.value)}
                                                        />
                                                        <input
                                                            placeholder="Target Link (optional)"
                                                            value={item.link}
                                                            onChange={(e) => handleItemChange(config.id, idx, 'link', e.target.value)}
                                                        />
                                                        <div className="item-image-upload">
                                                            <label>Image</label>
                                                            <ImageUpload
                                                                value={item.image || ''}
                                                                onChange={(url) => handleItemChange(config.id, idx, 'image', url)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

