'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
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
import LottieLoader from '@/components/LottieLoader';
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

const ItemSelector = ({ type, onSelect }: { type: 'art' | 'tattoo' | 'leasing', onSelect: (item: any) => void }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        try {
            let query: any;
            if (type === 'art') {
                query = supabase.from('paintings').select('id, title, artist:profiles(full_name), image_url, price');
            } else if (type === 'tattoo') {
                query = supabase.from('tattoo_designs').select('id, name, image_url, base_price');
            } else {
                query = supabase.from('leasable_paintings').select('id, title, artist_name, image_url, monthly_rate');
            }

            const searchCol = type === 'tattoo' ? 'name' : 'title';
            const { data, error } = await query.ilike(searchCol, `%${search}%`).limit(10);
            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchItems, 300);
        return () => clearTimeout(timer);
    }, [search, type]);

    return (
        <div className="item-selector">
            <div className="search-box">
                <IconSearch size={18} />
                <input
                    placeholder={`Search ${type}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="selector-results">
                {loading ? <IconLoader2 className="animate-spin" /> : items.map(item => (
                    <div key={item.id} className="selector-item" onClick={() => onSelect(item)}>
                        <img src={item.image_url} alt="" />
                        <div className="item-info">
                            <span className="title">{type === 'tattoo' ? item.name : item.title}</span>
                            <span className="subtitle">
                                {type === 'art' ? item.artist?.full_name :
                                    type === 'tattoo' ? item.description || 'Tattoo Design' :
                                        item.artist_name}
                            </span>
                        </div>
                        <IconPlus size={16} />
                    </div>
                ))}
            </div>
        </div>
    );
};

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

            // Order according to home screen layout
            const order = ['home_banner', 'trending_art', 'trending_tattoos', 'art_leasing', 'events_banner', 'classes_banner'];
            const sortedData = [...data].sort((a, b) => {
                const aIdx = order.indexOf(a.id);
                const bIdx = order.indexOf(b.id);
                if (aIdx === -1 && bIdx === -1) return 0;
                if (aIdx === -1) return 1;
                if (bIdx === -1) return -1;
                return aIdx - bIdx;
            });

            setConfigs(sortedData);
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

    const handleSelectItem = (configId: string, item: any) => {
        setConfigs(prev => prev.map(c => {
            if (c.id === configId) {
                // Store the item's relevant data or just ID? 
                // Let's store a simplified version that reflects the selected item
                const isTattoo = configId === 'trending_tattoos';
                const isLeasing = configId === 'art_leasing';
                const newItem = {
                    id: item.id,
                    title: isTattoo ? item.name : item.title,
                    image: item.image_url,
                    price: isLeasing ? `₹${item.monthly_rate}/mo` : (isTattoo ? `₹${item.base_price?.toLocaleString()}` : (item.price ? `₹${item.price.toLocaleString()}` : '')),
                    artist: isTattoo ? '' : (isLeasing ? item.artist_name : item.artist?.full_name),
                    selected_from: configId === 'trending_art' ? 'paintings' : (isTattoo ? 'tattoo_designs' : 'leasable_paintings')
                };
                return {
                    ...c,
                    items: [...(c.items || []), newItem]
                };
            }
            return c;
        }));
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

                                {(config.id === 'trending_art' || config.id === 'trending_tattoos' || config.id === 'art_leasing' || config.id === 'home_banner') && (
                                    <div className="items-list-editor">
                                        <div className="items-header">
                                            <h4>{config.id === 'home_banner' ? 'Carousel Slides' : 'Featured Items'}</h4>
                                            {config.id === 'home_banner' && (
                                                <button className="add-item-btn" onClick={() => handleAddItem(config.id)}>
                                                    <IconPlus size={16} /> Add Slide
                                                </button>
                                            )}
                                        </div>

                                        {config.id !== 'home_banner' && (
                                            <div className="item-selection-wrapper">
                                                <label>Select from Existing</label>
                                                <ItemSelector
                                                    type={config.id === 'trending_art' ? 'art' : (config.id === 'trending_tattoos' ? 'tattoo' : 'leasing')}
                                                    onSelect={(item) => handleSelectItem(config.id, item)}
                                                />
                                            </div>
                                        )}
                                        <div className="items-grid">
                                            {config.items && config.items.map((item, idx) => (
                                                <div key={idx} className="item-edit-card">
                                                    <div className="item-edit-header">
                                                        <span>{config.id === 'home_banner' ? `Slide #${idx + 1}` : `Item #${idx + 1}`}</span>
                                                        <button className="delete-item-btn" onClick={() => handleRemoveItem(config.id, idx)}>
                                                            <IconTrash size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="item-edit-fields">
                                                        {config.id === 'home_banner' ? (
                                                            <>
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
                                                            </>
                                                        ) : (
                                                            <div className="selected-item-preview">
                                                                <div className="preview-img">
                                                                    <img src={item.image} alt="" />
                                                                </div>
                                                                <div className="preview-info">
                                                                    <strong>{item.title}</strong>
                                                                    <span>{item.artist}</span>
                                                                    <span className="price-tag">{item.price}</span>
                                                                </div>
                                                            </div>
                                                        )}
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

