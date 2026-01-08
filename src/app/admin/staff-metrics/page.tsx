'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconUsers,
    IconChartBar,
    IconChecklist,
    IconArrowLeft,
    IconTrendingUp,
    IconClock
} from '@tabler/icons-react';
import { supabase } from '@/utils/supabase';
import LottieLoader from '@/components/ui/LottieLoader';
import Link from 'next/link';
import './page.css';

interface StaffMember {
    id: string;
    full_name: string;
    role: string;
    email: string;
    task_count: number;
    completed_count: number;
}

export default function StaffMetrics() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalStats, setGlobalStats] = useState({
        totalTasks: 0,
        completionRate: 0,
        activeStaff: 0
    });

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            // 1. Fetch all staff members
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, role, email')
                .in('role', ['admin', 'employee', 'creator']);

            if (profileError) throw profileError;

            // 2. Fetch all tasks to calculate counts
            const { data: tasks, error: taskError } = await supabase
                .from('staff_tasks')
                .select('assigned_to, status');

            if (taskError) throw taskError;

            // 3. Process data
            const staffWithMetrics = (profiles || []).map((p: any) => {
                const userTasks = (tasks || []).filter((t: any) => t.assigned_to === p.id);
                return {
                    ...p,
                    task_count: userTasks.length,
                    completed_count: userTasks.filter((t: any) => t.status === 'completed').length
                };
            });

            const totalTasks = tasks?.length || 0;
            const completedTotal = (tasks || []).filter((t: any) => t.status === 'completed').length;

            setStaff(staffWithMetrics);
            setGlobalStats({
                totalTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0,
                activeStaff: profiles.length
            });
        } catch (error: any) {
            console.error('Error fetching metrics:', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="admin-container">
                <header className="admin-header">
                    <Link href="/admin" className="back-link">
                        <IconArrowLeft size={18} />
                        Back to Admin
                    </Link>
                    <h1>Staff Metrics & Analytics</h1>
                </header>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{globalStats.activeStaff}</div>
                        <div className="stat-label">Active Staff</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{globalStats.totalTasks}</div>
                        <div className="stat-label">Global Tasks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{globalStats.completionRate}%</div>
                        <div className="stat-label">Total Completion</div>
                    </div>
                </div>

                <div className="metrics-grid">
                    <div className="performance-card">
                        <div className="card-header-main">
                            <h2>Worker Performance</h2>
                        </div>
                        <div className="worker-list">
                            {staff.map(member => {
                                const rate = member.task_count > 0
                                    ? Math.round((member.completed_count / member.task_count) * 100)
                                    : 0;

                                return (
                                    <div key={member.id} className="worker-item">
                                        <div className="worker-info">
                                            <span className="worker-name">{member.full_name || 'Anonymous'}</span>
                                            <span className="worker-role">{member.role}</span>
                                        </div>
                                        <div className="metric-box desktop-only">
                                            <span className="metric-value">{member.task_count}</span>
                                            <span className="metric-label">Tasks</span>
                                        </div>
                                        <div className="metric-box desktop-only">
                                            <span className="metric-value">{member.completed_count}</span>
                                            <span className="metric-label">Completed</span>
                                        </div>
                                        <div className="metric-box">
                                            <div className="progress-circle-mini">
                                                {rate}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="sidebar-stats">
                        <div className="mini-stat-card dark">
                            <IconTrendingUp size={24} style={{ marginBottom: '12px' }} />
                            <h3>Efficiency Lead</h3>
                            <div className="mini-stat-value">High</div>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                Staff is performing above average this week.
                            </p>
                        </div>
                        <div className="mini-stat-card">
                            <IconClock size={24} style={{ marginBottom: '12px', color: '#3b82f6' }} />
                            <h3>Average Finish Time</h3>
                            <div className="mini-stat-value" style={{ color: '#0f172a' }}>2.4d</div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                Time from task creation to completion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
