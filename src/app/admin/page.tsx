'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    IconUsers,
    IconShoppingCart,
    IconCash,
    IconArrowLeft,
    IconLogout,
    IconPackage,
    IconBallpen, // Using Ballpen for Tattoo 
    IconCertificate,
    IconSettings,
    IconDatabase,
    IconChevronRight,
    IconChecklist
} from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import Link from 'next/link';
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
        totalVolume: 0,
        activeEmployees: 0,
        totalTasks: 0
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

            // 6. Staff Metrics
            const { count: employeeCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'employee');

            const { count: taskCount } = await supabase
                .from('staff_tasks')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalUsers: userCount || 0,
                activeUsers: activeCount || 0,
                totalPaintings: paintingCount || 0,
                pendingRedemptions: pendingCount || 0,
                totalVolume,
                activeEmployees: employeeCount || 0,
                totalTasks: taskCount || 0
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
                <div className="admin-hero">
                    <div className="hero-content">
                        <h1>Platform Overview</h1>
                        <p>Welcome back, {profile?.full_name || 'Admin'}. Here's what's happening today.</p>
                    </div>
                    <div className="last-sync">
                        <IconDatabase size={16} />
                        Last synced: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card premium">
                                <div className="stat-header">
                                    <div className="stat-icon users">
                                        <IconUsers size={20} />
                                    </div>
                                    <span className="stat-label">Total Users</span>
                                </div>
                                <div className="stat-body">
                                    <p className="stat-value">{stats.totalUsers}</p>
                                    <span className="stat-trend up">+{stats.activeUsers} active</span>
                                </div>
                            </div>

                            <div className="stat-card premium">
                                <div className="stat-header">
                                    <div className="stat-icon paintings">
                                        <IconShoppingCart size={20} />
                                    </div>
                                    <span className="stat-label">Total Artworks</span>
                                </div>
                                <div className="stat-body">
                                    <p className="stat-value">{stats.totalPaintings}</p>
                                    <span className="stat-trend">Standard & Leasing</span>
                                </div>
                            </div>

                            <div className="stat-card premium">
                                <div className="stat-header">
                                    <div className="stat-icon redemptions">
                                        <IconCash size={20} />
                                    </div>
                                    <span className="stat-label">Pending Payouts</span>
                                </div>
                                <div className="stat-body">
                                    <p className="stat-value">{stats.pendingRedemptions}</p>
                                    <span className="stat-trend warning">Action required</span>
                                </div>
                            </div>

                            <div className="stat-card premium">
                                <div className="stat-header">
                                    <div className="stat-icon users" style={{ background: '#fef2f2', color: '#ef4444' }}>
                                        <IconUsers size={20} />
                                    </div>
                                    <span className="stat-label">Staff & Tasks</span>
                                </div>
                                <div className="stat-body">
                                    <p className="stat-value">{stats.activeEmployees}</p>
                                    <span className="stat-trend">{stats.totalTasks} total tasks</span>
                                </div>
                            </div>
                        </div>

                        <div className="admin-grid-layout">
                            <section className="management-card">
                                <div className="card-header">
                                    <IconPackage size={20} />
                                    <h2>Content & Products</h2>
                                </div>
                                <div className="card-actions-list">
                                    <Link href="/admin/cms" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Site CMS</strong>
                                            <span>Manage pages and static content</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/categories" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Categories</strong>
                                            <span>Edit art and event categories</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/leasing" className="admin-action-item highlight">
                                        <div className="action-info">
                                            <strong>Art Leasing</strong>
                                            <span>Manage rental inventory & orders</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                </div>
                            </section>

                            <section className="management-card">
                                <div className="card-header">
                                    <IconBallpen size={20} />
                                    <h2>Services & Booking</h2>
                                </div>
                                <div className="card-actions-list">
                                    <Link href="/admin/tattoos" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Tattoo Designs</strong>
                                            <span>Manage design catalog</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/piercings" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Piercing Designs</strong>
                                            <span>Manage piercing catalog</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/tattoo-slots" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Tattoo Availability</strong>
                                            <span>Set calendar and time slots</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/piercing-slots" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Piercing Availability</strong>
                                            <span>Set piercing time slots</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/bookings" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>All Bookings</strong>
                                            <span>View and manage appointments</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                </div>
                            </section>

                            <section className="management-card">
                                <div className="card-header">
                                    <IconCertificate size={20} />
                                    <h2>Events & Courses</h2>
                                </div>
                                <div className="card-actions-list">
                                    <Link href="/admin/events" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Events</strong>
                                            <span>Exhibitions and workshops</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/classes" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Art Classes</strong>
                                            <span>Manage curriculums and sessions</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                </div>
                            </section>

                            <section className="management-card">
                                <div className="card-header">
                                    <IconUsers size={20} />
                                    <h2>Users & Finance</h2>
                                </div>
                                <div className="card-actions-list">
                                    <Link href="/admin/users" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Users List</strong>
                                            <span>Customer profiles and roles</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/redemptions" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Redemptions</strong>
                                            <span>Artist payout requests</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/tokens" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Tokens</strong>
                                            <span>Manage digital assets & config</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                </div>
                            </section>

                            <section className="management-card">
                                <div className="card-header">
                                    <IconChecklist size={20} />
                                    <h2>Staff & Operations</h2>
                                </div>
                                <div className="card-actions-list">
                                    <Link href="/admin/employee" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Task Board</strong>
                                            <span>Staff-wide daily task overview</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                    <Link href="/admin/staff-metrics" className="admin-action-item">
                                        <div className="action-info">
                                            <strong>Staff Metrics</strong>
                                            <span>Individual performance & logs</span>
                                        </div>
                                        <IconChevronRight size={18} />
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
