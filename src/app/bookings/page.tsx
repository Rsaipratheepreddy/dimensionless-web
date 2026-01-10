'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { IconCalendar, IconClock, IconMapPin, IconBallpen, IconDiamond } from '@tabler/icons-react';
import LottieLoader from '@/components/ui/LottieLoader';
import Link from 'next/link';
import './page.css';

interface Booking {
    id: string;
    booking_date: string;
    start_time: string;
    status: string;
    type: 'tattoo' | 'piercing';
    tattoo_design?: {
        title: string;
        image_url: string;
    };
    piercing?: {
        name: string;
        image_url: string;
    };
}

export default function UserBookingsPage() {
    const { user, profile } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);

            // Fetch Tattoo Bookings
            const { data: tattooData, error: tattooError } = await supabase
                .from('tattoo_bookings')
                .select(`
                    id,
                    booking_date,
                    start_time,
                    status,
                    tattoo_design:design_id (title, image_url)
                `)
                .eq('user_id', user?.id)
                .order('booking_date', { ascending: false });

            // Fetch Piercing Bookings (if table exists)
            const { data: piercingData } = await supabase
                .from('piercing_bookings')
                .select(`
                    id,
                    booking_date,
                    start_time,
                    status,
                    piercing:piercing_id (name, image_url)
                `)
                .eq('user_id', user?.id)
                .order('booking_date', { ascending: false });

            const formattedTattoos = (tattooData || []).map((b: any) => ({ ...b, type: 'tattoo' }));
            const formattedPiercings = (piercingData || []).map((b: any) => ({ ...b, type: 'piercing' }));

            // @ts-ignore - union types
            setBookings([...formattedTattoos, ...formattedPiercings].sort((a, b) =>
                new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
            ));

        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    return (
        <AppLayout>
            <div className="user-bookings-container">
                <header className="bookings-header">
                    <h1>My Appointments</h1>
                    <p>Track your upcoming and past tattoo or piercing sessions</p>
                </header>

                {loading ? (
                    <LottieLoader />
                ) : bookings.length === 0 ? (
                    <div className="empty-bookings">
                        <IconCalendar size={64} stroke={1} />
                        <h3>No bookings found</h3>
                        <p>Ready for your next piece of art? Book a slot today.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <Link href="/tattoos" className="book-now-btn">
                                <IconBallpen size={18} />
                                Browse Tattoos
                            </Link>
                            <Link href="/piercings" className="book-now-btn" style={{ background: '#1a1a1a' }}>
                                <IconDiamond size={18} />
                                View Piercings
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="booking-user-card">
                                <div className="booking-main-info">
                                    <img
                                        src={booking.type === 'tattoo' ? booking.tattoo_design?.image_url : booking.piercing?.image_url || '/placeholder-art.png'}
                                        alt=""
                                        className="booking-design-preview"
                                    />
                                    <div className="booking-text-details">
                                        <h3>{booking.type === 'tattoo' ? booking.tattoo_design?.title : booking.piercing?.name || 'Session'}</h3>
                                        <div className="booking-date-time">
                                            <div className="info-item">
                                                <IconCalendar size={16} />
                                                <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="info-item">
                                                <IconClock size={16} />
                                                <span>{formatTime(booking.start_time)}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className={`badge-mini ${booking.type}`}>
                                                    {booking.type === 'tattoo' ? <IconBallpen size={12} /> : <IconDiamond size={12} />}
                                                    {booking.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="booking-actions">
                                    <span className={`booking-status-badge ${booking.status?.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
