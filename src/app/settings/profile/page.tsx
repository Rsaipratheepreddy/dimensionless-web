'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IconUser, IconCamera, IconLoader2, IconCheck, IconChevronLeft } from '@tabler/icons-react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import './page.css';

export default function ProfileSettingsPage() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setBio(profile.bio || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await fetch('/api/artworks/upload', { method: 'POST', body: formData });
            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();
            setAvatarUrl(uploadData.url || uploadData.image_url || '');
            toast.success('Avatar uploaded! Save changes to apply.');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName, bio, avatar_url: avatarUrl }),
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="settings-container">
                <div className="settings-header">
                    <Link href="/feed" className="back-link">
                        <IconChevronLeft size={20} />
                        <span>Back to Feed</span>
                    </Link>
                    <h1>Profile Settings</h1>
                    <p>Manage your public identity and bio</p>
                </div>

                <div className="settings-card">
                    <form onSubmit={handleSave} className="profile-form">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <img
                                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=5b4fe8&color=fff`}
                                    alt="Avatar"
                                    className="profile-preview-avatar"
                                />
                                <label className="avatar-upload-label">
                                    {uploading ? <IconLoader2 className="animate-spin" size={20} /> : <IconCamera size={20} />}
                                    <input type="file" onChange={handleAvatarUpload} disabled={uploading} hidden accept="image/*" />
                                </label>
                            </div>
                            <div className="avatar-info">
                                <h3>Profile Photo</h3>
                                <p>JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell the world about yourself..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-profile-btn" disabled={loading}>
                                {loading ? <IconLoader2 className="animate-spin" size={20} /> : <IconCheck size={20} />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
