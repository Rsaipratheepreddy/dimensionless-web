'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconChevronLeft, IconLoader2, IconCheck, IconX } from '@tabler/icons-react';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import '../page.css';

interface RedemptionRequest {
    id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
        email: string;
    } | null;
}

export default function AdminRedemptions() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('redemption_requests')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error: any) {
            console.error('Error fetching redemptions:', error.message || error);
            if (error.details) console.error('Error details:', error.details);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: string, userId: string, amount: number) => {
        try {
            // Update request status
            const { error: updateError } = await supabase
                .from('redemption_requests')
                .update({ status })
                .eq('id', id);

            if (updateError) throw updateError;

            // If approved/processed, deduct from profile wallet
            if (status === 'processed') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('wallet_balance')
                    .eq('id', userId)
                    .single();

                await supabase
                    .from('profiles')
                    .update({ wallet_balance: (profile?.wallet_balance || 0) - amount })
                    .eq('id', userId);
            }

            toast.success(`Request marked as ${status}`);
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status.');
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
                    <h1>Manage Redemptions</h1>
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
                                    <th>Artist</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">No redemption requests found.</td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id}>
                                            <td>
                                                <div className="artist-cell">
                                                    <strong>{req.profiles?.full_name}</strong>
                                                    <span>{req.profiles?.email}</span>
                                                </div>
                                            </td>
                                            <td className="amount-cell">₹{req.amount.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`status-tag ${req.status}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {req.status === 'pending' && (
                                                    <div className="action-btns">
                                                        <button
                                                            className="approve-btn"
                                                            onClick={() => handleAction(req.id, 'processed', req.user_id, req.amount)}
                                                        >
                                                            Process
                                                        </button>
                                                        <button
                                                            className="reject-btn"
                                                            onClick={() => handleAction(req.id, 'rejected', req.user_id, req.amount)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

