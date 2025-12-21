'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { IconPackage, IconLoader2, IconExternalLink } from '@tabler/icons-react';
import AppLayout from '@/components/AppLayout';
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

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
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
                .eq('buyer_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data as unknown as Order[] || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="orders-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>Track your art purchases and history</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <IconLoader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.length === 0 ? (
                            <div className="empty-orders">
                                <IconPackage size={60} />
                                <h3>No orders yet</h3>
                                <p>You haven't purchased any artwork yet.</p>
                                <a href="/buy-art" className="explore-btn">Explore Marketplace</a>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="order-item">
                                    <div className="order-main">
                                        <div className="order-image">
                                            <img src={order.painting?.image_url || '/placeholder-art.png'} alt={order.painting?.title} />
                                        </div>
                                        <div className="order-details">
                                            <h3>{order.painting?.title}</h3>
                                            <p className="order-id">Order ID: {order.id.slice(0, 8)}...</p>
                                            <p className="order-date">Date: {new Date(order.created_at).toLocaleDateString()}</p>
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
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
