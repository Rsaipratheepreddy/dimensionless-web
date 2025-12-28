'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconPackage, IconExternalLink } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import AppLayout from '@/components/layout/AppLayout';
import './page.css';

interface Order {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    painting: {
        title: string;
        image_url: string;
        price: number;
    };
}

interface LeaseOrder {
    id: string;
    total_price: number;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
    painting: {
        title: string;
        image_url: string;
    };
}

export default function OrdersPage() {
    const { profile } = useAuth();
    const [purchases, setPurchases] = useState<Order[]>([]);
    const [leases, setLeases] = useState<LeaseOrder[]>([]);
    const [activeTab, setActiveTab] = useState<'purchases' | 'leases'>('purchases');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            if (activeTab === 'purchases') {
                fetchPurchases();
            } else {
                fetchLeases();
            }
        }
    }, [profile, activeTab]);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    amount,
                    status,
                    created_at,
                    painting:painting_id (
                        title,
                        image_url,
                        price
                    )
                `)
                .eq('buyer_id', profile?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPurchases(data as unknown as Order[] || []);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeases = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('lease_orders')
                .select(`
                    id,
                    total_price,
                    status,
                    start_date,
                    end_date,
                    created_at,
                    painting:painting_id (
                        title,
                        image_url
                    )
                `)
                .eq('user_id', profile?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeases(data as unknown as LeaseOrder[] || []);
        } catch (error) {
            console.error('Error fetching leases:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="orders-container">
                <div className="orders-header">
                    <h1>Order History</h1>
                    <p>Manage your art acquisitions and leasing requests</p>
                </div>

                <div className="orders-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        Art Purchases
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'leases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leases')}
                    >
                        Art Leases (Requests)
                    </button>
                </div>

                {loading ? (
                    <LottieLoader />
                ) : (
                    <div className="orders-list">
                        {activeTab === 'purchases' ? (
                            purchases.length === 0 ? (
                                <div className="empty-orders">
                                    <IconPackage size={60} />
                                    <h3>No purchases yet</h3>
                                    <p>Your acquired history will appear here.</p>
                                    <a href="/buy-art" className="explore-btn">Explore Marketplace</a>
                                </div>
                            ) : (
                                purchases.map((order) => (
                                    <div key={order.id} className="order-item">
                                        <div className="order-main">
                                            <div className="order-image">
                                                <img src={order.painting?.image_url || '/placeholder-art.png'} alt={order.painting?.title} />
                                            </div>
                                            <div className="order-details">
                                                <span className="order-tag">COLLECTION ITEM</span>
                                                <h3>{order.painting?.title}</h3>
                                                <p className="order-date">Finalized on {new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-price">₹{order.amount.toLocaleString()}</div>
                                            <div className={`order-status ${order.status}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            leases.length === 0 ? (
                                <div className="empty-orders">
                                    <IconPackage size={60} />
                                    <h3>No lease requests</h3>
                                    <p>Your art leasing requests and terms will appear here.</p>
                                    <a href="/art-leasing" className="explore-btn">Browse Collection</a>
                                </div>
                            ) : (
                                leases.map((lease) => (
                                    <div key={lease.id} className="order-item lease-item">
                                        <div className="order-main">
                                            <div className="order-image">
                                                <img src={lease.painting?.image_url || '/placeholder-art.png'} alt={lease.painting?.title} />
                                            </div>
                                            <div className="order-details">
                                                <span className="order-tag lease">LEASE REQUEST</span>
                                                <h3>{lease.painting?.title}</h3>
                                                <p className="lease-period">
                                                    Duration: {new Date(lease.start_date).toLocaleDateString()} — {new Date(lease.end_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-price">₹{lease.total_price.toLocaleString()}</div>
                                            <div className={`order-status ${lease.status}`}>
                                                {lease.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
