'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconWallet, IconHistory, IconArrowUpRight, IconCash } from '@tabler/icons-react';
import LottieLoader from '@/components/LottieLoader';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import './page.css';

interface RedemptionRequest {
    id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    created_at: string;
}

export default function WalletPage() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [requests, setRequests] = useState<RedemptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [redeemAmount, setRedeemAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            // Fetch Profile Balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', user?.id)
                .single();

            setBalance(profile?.wallet_balance || 0);

            // Fetch Redemption Requests
            const { data: redemptionData } = await supabase
                .from('redemption_requests')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            setRequests(redemptionData || []);
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(redeemAmount);

        if (amount > balance) {
            toast.error('Insufficient balance.');
            return;
        }

        if (amount < 500) {
            toast.error('Minimum redemption amount is ₹500.');
            return;
        }

        try {
            setSubmitting(true);
            const { error } = await supabase
                .from('redemption_requests')
                .insert([
                    {
                        user_id: user?.id,
                        amount: amount,
                        status: 'pending'
                    }
                ]);

            if (error) throw error;

            toast.success('Redemption request submitted successfully!');
            setIsRedeemModalOpen(false);
            setRedeemAmount('');
            fetchWalletData();
        } catch (error) {
            console.error('Redeem error:', error);
            toast.error('Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="wallet-container">
                <div className="wallet-card">
                    <div className="wallet-info">
                        <div className="wallet-label">
                            <IconWallet size={20} />
                            <span>Total Earnings</span>
                        </div>
                        <h2>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        <button
                            className="redeem-btn"
                            onClick={() => setIsRedeemModalOpen(true)}
                            disabled={balance < 500}
                        >
                            <IconCash size={20} />
                            Redeem Balance
                        </button>
                    </div>
                    <div className="wallet-stats">
                        <div className="stat-item">
                            <span>Pending Payouts</span>
                            <span className="stat-value">₹{requests.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.amount, 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="stat-item">
                            <span>Processed</span>
                            <span className="stat-value">₹{requests.filter(r => r.status === 'processed').reduce((acc, r) => acc + r.amount, 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <div className="history-section">
                    <div className="section-header">
                        <IconHistory size={20} />
                        <h3>Redemption History</h3>
                    </div>

                    {loading ? (
                        <LottieLoader />
                    ) : requests.length === 0 ? (
                        <div className="empty-history">
                            <IconHistory size={48} stroke={1} />
                            <p>No transactions found</p>
                        </div>
                    ) : (
                        <div className="requests-table-container">
                            <table className="requests-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id}>
                                            <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                            <td className="amount-cell">₹{request.amount.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`status-tag ${request.status}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {isRedeemModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Request Payout</h2>
                                <button className="close-modal" onClick={() => setIsRedeemModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleRedeem}>
                                <div className="form-group">
                                    <label>Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={redeemAmount}
                                        onChange={(e) => setRedeemAmount(e.target.value)}
                                        placeholder="Minimum ₹500"
                                        min="500"
                                        max={balance}
                                        required
                                    />
                                    <p className="helper-text">Available balance: ₹{balance.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setIsRedeemModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

