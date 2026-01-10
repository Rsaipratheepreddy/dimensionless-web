'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
    IconChecklist,
    IconCalendar,
    IconClock,
    IconPlus,
    IconChartBar,
    IconArtboard,
    IconBallpen,
    IconUsers
} from '@tabler/icons-react';
import { supabase } from '@/utils/supabase';
import { toast } from 'react-hot-toast';
import LottieLoader from '@/components/ui/LottieLoader';
import './page.css';

interface QueueItem {
    id: string;
    client_name: string;
    type: 'tattoo' | 'piercing';
    start_time: string;
    design_name?: string;
    design_image?: string;
    status: string;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    status: string;
    assigned_to: string | null;
    due_date?: string;
    created_at?: string;
}

export default function EmployeeDashboard() {
    const { profile, user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [poolTasks, setPoolTasks] = useState<Task[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const });

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchPool();
            fetchQueue();
        }
    }, [user]);

    const fetchQueue = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch Tattoo Bookings
            const { data: tattooData } = await supabase
                .from('tattoo_bookings')
                .select(`
                    id,
                    booking_time,
                    status,
                    profiles:profiles!tattoo_bookings_user_id_fkey (full_name),
                    tattoo_designs (name, image_url)
                `)
                .eq('booking_date', today)
                .in('status', ['confirmed', 'in_progress'])
                .order('booking_time');

            // Fetch Piercing Bookings
            const { data: piercingData } = await supabase
                .from('piercing_bookings')
                .select(`
                    id,
                    booking_time,
                    status,
                    profiles:profiles!piercing_bookings_user_id_fkey (full_name),
                    piercing_designs (name, image_url)
                `)
                .eq('booking_date', today)
                .in('status', ['confirmed', 'in_progress'])
                .order('booking_time');

            const tattooItems: QueueItem[] = (tattooData || []).map((b: any) => ({
                id: b.id,
                client_name: (b.profiles as any)?.full_name || 'Anonymous',
                type: 'tattoo',
                start_time: b.booking_time,
                design_name: (b.tattoo_designs as any)?.name,
                design_image: (b.tattoo_designs as any)?.image_url,
                status: b.status
            }));

            const piercingItems: QueueItem[] = (piercingData || []).map((b: any) => ({
                id: b.id,
                client_name: (b.profiles as any)?.full_name || 'Anonymous',
                type: 'piercing',
                start_time: b.booking_time,
                design_name: (b.piercing_designs as any)?.name,
                design_image: (b.piercing_designs as any)?.image_url,
                status: b.status
            }));

            setQueue([...tattooItems, ...piercingItems].sort((a, b) => a.start_time.localeCompare(b.start_time)));
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const handleUpdateStatus = async (id: string, type: 'tattoo' | 'piercing', newStatus: string) => {
        try {
            const endpoint = type === 'tattoo' ? `/api/bookings/${id}` : `/api/piercings/bookings/${id}`;
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Client marked as ${newStatus.replace('_', ' ')}`);
                fetchQueue();
            }
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const fetchPool = async () => {
        try {
            const { data, error } = await supabase
                .from('staff_tasks')
                .select('*')
                .is('assigned_to', null)
                .order('created_at', { ascending: false });
            if (!error) setPoolTasks(data || []);
        } catch (e) { }
    };

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('staff_tasks')
                .select('*')
                .eq('assigned_to', user?.id)
                .order('due_date', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (error: any) {
            console.error('Error fetching tasks:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (taskId: string) => {
        try {
            const res = await fetch(`/api/admin/staff-tasks/${taskId}/claim`, { method: 'POST' });
            if (res.ok) {
                toast.success('Task claimed!');
                fetchTasks();
                fetchPool();
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/staff-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    priority: newTask.priority,
                    assigned_to: user?.id,
                    status: 'todo'
                })
            });
            if (res.ok) {
                toast.success('Task created!');
                setIsModalOpen(false);
                setNewTask({ title: '', description: '', priority: 'medium' });
                fetchTasks();
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    const todayTasks = tasks.filter(t => t.status !== 'completed');

    return (
        <AppLayout>
            <div className="admin-container">
                <header className="admin-hero">
                    <div className="hero-content">
                        <h1>Staff Queue & Board</h1>
                        <p>Welcome, {profile?.full_name || 'Staff'}. Manage today's clients and tasks.</p>
                    </div>
                    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                        <IconPlus size={20} />
                        New Task
                    </button>
                </header>

                <div className="employee-layout">
                    {/* LEFT COLUMN: LIVE QUEUE */}
                    <div className="queue-section">
                        <div className="section-header">
                            <IconUsers size={20} />
                            <h2>Live Client Queue</h2>
                            <span className="live-indicator">LIVE</span>
                        </div>
                        <div className="queue-list">
                            {queue.length === 0 ? (
                                <div className="empty-state-mini">
                                    <p>No confirmed clients for today.</p>
                                </div>
                            ) : (
                                queue.map(item => (
                                    <div key={item.id} className={`queue-card ${item.status}`}>
                                        <div className="queue-time">{item.start_time}</div>
                                        <div className="queue-main">
                                            <div className="client-info">
                                                <strong>{item.client_name}</strong>
                                                <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.design_name || 'Custom'}</span>
                                            </div>
                                            <div className="queue-actions">
                                                {item.status === 'confirmed' ? (
                                                    <button
                                                        className="start-session-btn"
                                                        onClick={() => handleUpdateStatus(item.id, item.type, 'in_progress')}
                                                    >
                                                        Start Session
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="complete-session-btn"
                                                        onClick={() => handleUpdateStatus(item.id, item.type, 'completed')}
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TASK BOARD */}
                    <div className="task-section">
                        <div className="section-header">
                            <IconChecklist size={20} />
                            <h2>My Task Board</h2>
                        </div>
                        <div className="task-list-mini">
                            {todayTasks.map(task => (
                                <div key={task.id} className={`task-card-mini ${task.priority}`}>
                                    <div className="task-info">
                                        <strong>{task.title}</strong>
                                        <span>{task.priority.toUpperCase()} PRIORITY</span>
                                    </div>
                                    <button className="done-btn" onClick={() => handleClaim(task.id)}>
                                        Done
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="section-header" style={{ marginTop: '32px' }}>
                            <IconClock size={20} />
                            <h2>Open Task Pool</h2>
                        </div>
                        <div className="pool-list-mini">
                            {poolTasks.map(task => (
                                <div key={task.id} className="pool-card-mini">
                                    <strong>{task.title}</strong>
                                    <button className="claim-mini-btn" onClick={() => handleClaim(task.id)}>Claim</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content animate-slide-up" style={{ maxWidth: '500px' }}>
                        <div className="admin-modal-header">
                            <h2>Create Custom Task</h2>
                            <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                                <IconPlus style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask}>
                            <div className="admin-modal-body">
                                <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="admin-form-group">
                                        <label>Task Title</label>
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                            required
                                            placeholder="What needs to be done?"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Description (Optional)</label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                            placeholder="Add details..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
