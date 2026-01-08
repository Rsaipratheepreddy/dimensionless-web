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

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    created_at?: string;
}

export default function EmployeeDashboard() {
    const { profile, user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [poolTasks, setPoolTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const });

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchPool();
        }
    }, [user]);

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
            // Don't toast error here because table might not exist yet
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (taskId: string) => {
        try {
            const res = await fetch(`/api/admin/staff-tasks/${taskId}/claim`, { method: 'POST' });
            if (res.ok) {
                toast.success('Task claimed and added to your board!');
                fetchTasks();
                fetchPool();
            } else {
                toast.error('Failed to claim task');
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
            } else {
                toast.error('Failed to create task');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;

    const todayTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <AppLayout>
            <div className="admin-container">
                <header className="admin-hero">
                    <div className="hero-content">
                        <h1>Staff Dashboard</h1>
                        <p>Welcome back, {profile?.full_name || 'Staff'}. Here's your agenda for today.</p>
                    </div>
                    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                        <IconPlus size={20} />
                        New Task
                    </button>
                </header>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{todayTasks.length}</div>
                        <div className="stat-label">Tasks Pending</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{completedTasks.length}</div>
                        <div className="stat-label">Tasks Done</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">92%</div>
                        <div className="stat-label">Performance</div>
                    </div>
                </div>

                <div className="employee-grid">
                    <div className="task-board">
                        <div className="section-header">
                            <IconChecklist size={20} />
                            <h2>Task Board</h2>
                        </div>
                        <div className="task-list">
                            {todayTasks.length === 0 ? (
                                <div className="empty-tasks">
                                    <p>All caught up! No pending tasks.</p>
                                </div>
                            ) : (
                                todayTasks.map(task => (
                                    <div key={task.id} className={`task-item ${task.priority}`}>
                                        <div className="task-main">
                                            <strong>{task.title}</strong>
                                            <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                                        </div>
                                        <div className={`priority-tag ${task.priority}`}>
                                            {task.priority}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="section-header" style={{ marginTop: '32px' }}>
                            <IconClock size={20} />
                            <h2>Claimable Pipeline</h2>
                        </div>
                        <div className="pool-list">
                            {poolTasks.length === 0 ? (
                                <div className="empty-tasks">
                                    <p>No unassigned tasks in the pipeline.</p>
                                </div>
                            ) : (
                                poolTasks.map(task => (
                                    <div key={task.id} className={`task-item pool ${task.priority}`}>
                                        <div className="task-main">
                                            <strong>{task.title}</strong>
                                            <span>Posted: {new Date(task.created_at || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                        <button className="claim-btn" onClick={() => handleClaim(task.id)}>
                                            Claim Task
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="quick-actions">
                        <div className="section-header">
                            <IconPlus size={20} />
                            <h2>Staff Tools</h2>
                        </div>
                        <div className="actions-grid-small">
                            <a href="/admin/tattoo-slots" className="action-card-mini">
                                <IconBallpen size={24} />
                                <span>Tattoo Slots</span>
                            </a>
                            <a href="/admin/piercing-slots" className="action-card-mini">
                                <IconUsers size={24} />
                                <span>Piercing Slots</span>
                            </a>
                            <a href="/admin/leasing" className="action-card-mini">
                                <IconArtboard size={24} />
                                <span>Manage Art</span>
                            </a>
                            <a href="/admin/classes" className="action-card-mini">
                                <IconCalendar size={24} />
                                <span>Classes</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up">
                        <div className="modal-header">
                            <h2>Create Custom Task</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><IconPlus style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="task-form">
                            <div className="form-group">
                                <label>Task Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                    placeholder="What needs to be done?"
                                />
                            </div>
                            <div className="form-group">
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
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Add details..."
                                />
                            </div>
                            <button type="submit" className="post-submit-btn">Create Task</button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
