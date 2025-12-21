'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconChevronLeft, IconLoader2, IconUserCheck, IconShieldCheck } from '@tabler/icons-react';
import AppLayout from '@/components/AppLayout';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';
import '../page.css';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: 'user' | 'admin';
    created_at: string;
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
        } catch (error) {
            console.error('Error fetching profiles:', error);
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
            message: `Are you sure you want to change this user's role to ${newRole}?`,
            confirmText: 'Change Role',
            type: 'primary'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', targetUserId);

            if (error) throw error;
            toast.success(`User role updated to ${newRole}`);
            fetchProfiles();
        } catch (error) {
            console.error('Error updating role:', error);
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
                    <div className="loading-state">
                        <IconLoader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="admin-table-container">
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
                                                onClick={() => toggleRole(profile.id, profile.role)}
                                            >
                                                Change to {profile.role === 'admin' ? 'User' : 'Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
