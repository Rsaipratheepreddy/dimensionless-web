'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconChevronLeft, IconUserCheck, IconShieldCheck } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import '../page.css';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: 'member' | 'user' | 'creator' | 'employee' | 'admin';
    created_at: string;
    updated_at: string;
}

export default function AdminUsers() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfiles();
        }
    }, [user]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error: any) {
            console.error('Error fetching profiles:', error.message || error);
            toast.error(error.message || 'Error fetching profiles');
        } finally {
            setLoading(false);
        }
    };

    const { confirm } = useModal();

    const toggleRole = async (targetUserId: string, currentRole: string) => {
        if (targetUserId === user?.id) {
            toast.error("You cannot change your own role.");
            return;
        }

        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const confirmed = await confirm({
            title: 'Change User Role',
            message: `Select the new role for this user:`,
            confirmText: 'Update Role',
            type: 'primary'
        });

        // For simplicity in this UI, we'll cycle through roles or we could use a select in the confirm modal
        // Since the confirm modal doesn't easily support a select yet, let's keep it simple or implement a quick toggle
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', targetUserId);

            if (error) throw error;
            toast.success(`User role updated to ${newRole}`);
            fetchProfiles();
        } catch (error: any) {
            console.error('Error updating role:', error.message || error);
            toast.error('Failed to update role.');
        }
    };

    const cycleRole = async (targetUserId: string, currentRole: string) => {
        if (targetUserId === user?.id) {
            toast.error("You cannot change your own role.");
            return;
        }

        const roles: ('member' | 'creator' | 'employee' | 'admin')[] = ['member', 'creator', 'employee', 'admin'];
        // Handle 'user' as 'member' if it exists
        const normalizedRole = currentRole === 'user' ? 'member' : currentRole;
        const currentIndex = roles.indexOf(normalizedRole as any);
        const nextRole = roles[(currentIndex + 1) % roles.length];

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: nextRole })
                .eq('id', targetUserId);

            if (error) throw error;
            toast.success(`User role updated to ${nextRole}`);
            fetchProfiles();
        } catch (error: any) {
            console.error('Error updating role:', error.message || error);
            toast.error('Failed to update role.');
        }
    };

    return (
        <AppLayout>
            <div className="admin-container">
                <div className="admin-header">
                    <a href="/admin" className="back-link">
                        <IconChevronLeft size={16} />
                        Back to Dashboard
                    </a>
                    <h1>User Management</h1>
                </div>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <div className="admin-list-container">
                        {/* Desktop Table View */}
                        <div className="admin-table-wrapper desktop-only">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Current Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profiles.map((profile) => (
                                        <tr key={profile.id}>
                                            <td>
                                                <div className="artist-cell">
                                                    <strong>{profile.full_name || 'Anonymous'}</strong>
                                                    <span>{profile.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-tag ${profile.role}`}>
                                                    {profile.role}
                                                </span>
                                            </td>
                                            <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="action-btn-admin secondary"
                                                    onClick={() => cycleRole(profile.id, profile.role)}
                                                >
                                                    Change Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="admin-cards-wrapper mobile-only">
                            {profiles.map((profile) => (
                                <div key={profile.id} className="admin-mobile-card">
                                    <div className="admin-card-header">
                                        <div className="admin-card-user-info">
                                            <strong>{profile.full_name || 'Anonymous'}</strong>
                                            <span>{profile.email}</span>
                                        </div>
                                        <span className={`status-tag ${profile.role}`}>
                                            {profile.role}
                                        </span>
                                    </div>
                                    <div className="admin-card-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Joined</span>
                                            <span className="detail-value">{new Date(profile.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="admin-card-actions">
                                        <button
                                            className="action-btn-admin secondary"
                                            onClick={() => cycleRole(profile.id, profile.role)}
                                        >
                                            Change Role
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
