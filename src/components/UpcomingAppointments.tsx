'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IconCalendar, IconClock, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import './UpcomingAppointments.css';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    payment_status: string;
    final_price: number;
    tattoo_designs: {
        name: string;
        image_url: string;
    };
}

export default function UpcomingAppointments() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            // Filter upcoming bookings
            const upcoming = data.filter((b: any) => {
                const bookingDate = new Date(b.booking_date);
                return bookingDate >= new Date() && b.status !== 'cancelled';
            }).slice(0, 3); // Show max 3
            setBookings(upcoming);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || loading || bookings.length === 0) return null;

    return (
        <div className="upcoming-appointments-widget">
            <div className="widget-header">
                <h2>Upcoming Tattoo Appointments</h2>
                <Link href="/tattoos" className="view-all-link">View All</Link>
            </div>

            <div className="appointments-list">
                {bookings.map(booking => (
                    <div key={booking.id} className="appointment-card">
                        <div className="appointment-image">
                            <img src={booking.tattoo_designs.image_url || '/painting.png'} alt={booking.tattoo_designs.name} />
                        </div>
                        <div className="appointment-details">
                            <h3>{booking.tattoo_designs.name}</h3>
                            <div className="appointment-info">
                                <div className="info-item">
                                    <IconCalendar size={16} />
                                    <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                                </div>
                                <div className="info-item">
                                    <IconClock size={16} />
                                    <span>{booking.booking_time}</span>
                                </div>
                            </div>
                            <div className="appointment-status">
                                <span className={`status-badge ${booking.status}`}>
                                    {booking.status.replace('_', ' ')}
                                </span>
                                <span className="price">₹{booking.final_price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
