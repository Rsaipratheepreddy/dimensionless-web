'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
    IconArrowLeft,
    IconDownload,
    IconSearch,
    IconUser
} from '@tabler/icons-react';
import './attendees.css';
import LottieLoader from '@/components/ui/LottieLoader';
import { toast } from 'react-hot-toast';

interface Attendee {
    id: string;
    status: 'pending' | 'active' | 'expired';
    type: string;
    amount_paid: number;
    created_at: string;
    user: {
        full_name: string;
        email: string;
        avatar_url: string;
    };
}

export default function AdminAttendeesPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { id } = useParams();

    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [classInfo, setClassInfo] = useState<{ title: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchAttendees();
    }, [id]);

    const fetchAttendees = async () => {
        try {
            // Fetch attendees and class info
            const [attendeesRes, classRes] = await Promise.all([
                fetch(`/api/admin/art-classes/${id}/attendees`),
                fetch(`/api/admin/art-classes/${id}`)
            ]);

            const [attendeesData, classData] = await Promise.all([
                attendeesRes.json(),
                classRes.json()
            ]);

            if (attendeesRes.ok) {
                setAttendees(attendeesData);
            }
            if (classRes.ok) {
                setClassInfo(classData);
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (attendees.length === 0) return toast.error('No attendees to export');

        const headers = ['Name', 'Email', 'Status', 'Type', 'Amount Paid', 'Date Joined'];
        const rows = attendees.map(a => [
            a.user.full_name,
            a.user.email,
            a.status,
            a.type,
            a.amount_paid,
            new Date(a.created_at).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendees_class_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredAttendees = attendees.filter(a => {
        const name = a.user?.full_name?.toLowerCase() || 'unknown user';
        const email = a.user?.email?.toLowerCase() || '';
        const search = searchQuery.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    if (authLoading || loading) return <AppLayout><LottieLoader /></AppLayout>;

    return (
        <AppLayout>
            <div className="admin-attendees-page">
                <div className="attendees-header">
                    <div className="title-area">
                        <button className="back-btn" onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                            <IconArrowLeft size={24} />
                        </button>
                        <h1>{classInfo?.title || 'Class'} Attendees</h1>
                    </div>
                    <button className="export-btn" onClick={handleExport}>
                        <IconDownload size={20} />
                        Export to CSV
                    </button>
                </div>

                <div className="attendees-stats">
                    <div className="stat-card">
                        <span className="label">Total Registered</span>
                        <div className="value">{attendees.length}</div>
                    </div>
                    <div className="stat-card">
                        <span className="label">Active Students</span>
                        <div className="value">{attendees.filter(a => a.status === 'active').length}</div>
                    </div>
                    <div className="stat-card">
                        <span className="label">Total Revenue</span>
                        <div className="value">₹{attendees.reduce((sum, a) => sum + (a.amount_paid || 0), 0).toLocaleString()}</div>
                    </div>
                </div>

                <div className="attendees-table-container">
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ position: 'relative', maxWidth: '400px' }}>
                            <IconSearch size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search attendees..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-main)'
                                }}
                            />
                        </div>
                    </div>
                    <table className="attendees-table">
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>STATUS</th>
                                <th>TYPE</th>
                                <th>AMOUNT</th>
                                <th>JOINED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No attendees found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendees.map(a => (
                                    <tr key={a.id}>
                                        <td>
                                            <div className="user-cell">
                                                <img src={a.user?.avatar_url || '/founder1.png'} alt={a.user?.full_name || 'Unknown'} className="user-avatar" />
                                                <div className="user-info">
                                                    <span className="user-name">{a.user?.full_name || 'Unknown User'}</span>
                                                    <span className="user-email">{a.user?.email || 'No email provided'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${a.status}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                                {a.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="price-cell">
                                            {a.amount_paid > 0 ? `₹${a.amount_paid.toLocaleString()}` : 'Free'}
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout >
    );
}
