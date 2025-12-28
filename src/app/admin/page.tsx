'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IconUsers, IconShoppingCart, IconCash, IconAlertCircle } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import './page.css';

export default function AdminDashboard() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalPaintings: 0,
        pendingRedemptions: 0,
        totalVolume: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || profile?.role !== 'admin') {
                router.replace('/');
                return;
            }
            fetchStats();
        }
    }, [user, profile, authLoading, router]);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // 1. Total Users
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 2. Total Paintings
            const { count: paintingCount } = await supabase
                .from('paintings')
                .select('*', { count: 'exact', head: true });

            // 3. Pending Redemptions
            const { count: pendingCount } = await supabase
                .from('redemption_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // 4. Total Volume (from completed orders)
            const { data: orders } = await supabase
                .from('orders')
                .select('amount')
                .eq('status', 'completed');

            const totalVolume = orders?.reduce((acc, order) => acc + (order.amount || 0), 0) || 0;

            // 5. Active Users (Proxy: updated in last 24h)
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count: activeCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('updated_at', twentyFourHoursAgo);

            setStats({
                totalUsers: userCount || 0,
                activeUsers: activeCount || 0,
                totalPaintings: paintingCount || 0,
                pendingRedemptions: pendingCount || 0,
                totalVolume
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Admin Command Center</h1>
                    <p>Platform overview and management</p>
                </div>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon users">
                                <IconUsers size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Total Artists</h3>
                                <p>{stats.totalUsers}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon paintings">
                                <IconShoppingCart size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Artworks Listed</h3>
                                <p>{stats.totalPaintings}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon redemptions">
                                <IconCash size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Pending Payouts</h3>
                                <p>{stats.pendingRedemptions}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon users-active">
                                <IconUsers size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Active Users</h3>
                                <p>{stats.activeUsers}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon volume">
                                <IconAlertCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Total Volume</h3>
                                <p>₹{stats.totalVolume.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="admin-quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <a href="/admin/cms" className="action-btn-admin highlight">Manage Site CMS</a>
                        <a href="/admin/events" className="action-btn-admin">Manage Events</a>
                        <a href="/admin/redemptions" className="action-btn-admin">Manage Redemptions</a>
                        <a href="/admin/users" className="action-btn-admin">User Permissions</a>
                        <a href="/admin/leasing" className="action-btn-admin">Leasing Management</a>
                        <a href="/admin/tattoos" className="action-btn-admin">Tattoo Management</a>
                        <a href="/admin/tattoo-slots" className="action-btn-admin">Slot Management</a>
                        <a href="/admin/bookings" className="action-btn-admin">Booking Management</a>
                        <a href="/admin/categories" className="action-btn-admin">Category Management</a>
                        <a href="/buy-art" className="action-btn-admin secondary">View Marketplace</a>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
