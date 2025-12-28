'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IconCalendar, IconClock, IconMapPin, IconCheck, IconX, IconClock12 } from '@tabler/icons-react';
import './MyBookings.css';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    payment_status: string;
    payment_method: string;
    final_price: number;
    custom_notes: string;
    tattoo_designs: {
        name: string;
        image_url: string;
        description: string;
    };
}

export default function MyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const formatTime12Hour = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'confirmed';
            case 'completed': return 'completed';
            case 'cancelled': return 'cancelled';
            case 'payment_pending': return 'pending';
            case 'pending_verification': return 'pending';
            default: return 'pending';
        }
    };

    if (loading) {
        return <div className="loading-bookings">Loading your bookings...</div>;
    }

    if (bookings.length === 0) {
        return (
            <div className="empty-bookings">
                <IconClock12 size={64} />
                <h3>No Bookings Yet</h3>
                <p>You haven't booked any tattoo appointments yet.</p>
                <button onClick={() => window.location.href = '/tattoos'} className="browse-btn">
                    Browse Designs
                </button>
            </div>
        );
    }

    return (
        <div className="my-bookings-container">
            <div className="bookings-grid">
                {bookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                        <div className="booking-image">
                            <img src={booking.tattoo_designs.image_url || '/painting.png'} alt={booking.tattoo_designs.name} />
                            <span className={`status-badge ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="booking-content">
                            <h3>{booking.tattoo_designs.name}</h3>
                            <p className="booking-description">{booking.tattoo_designs.description}</p>

                            <div className="booking-details">
                                <div className="detail-item">
                                    <IconCalendar size={18} />
                                    <span>{new Date(booking.booking_date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="detail-item">
                                    <IconClock size={18} />
                                    <span>{formatTime12Hour(booking.booking_time)}</span>
                                </div>
                            </div>

                            {booking.custom_notes && (
                                <div className="booking-notes">
                                    <strong>Notes:</strong> {booking.custom_notes}
                                </div>
                            )}

                            <div className="booking-footer">
                                <div className="payment-info">
                                    <span className="payment-method">
                                        {booking.payment_method === 'online' ? 'Paid Online' : 'Pay at Counter'}
                                    </span>
                                    <span className={`payment-status ${booking.payment_status}`}>
                                        {booking.payment_status === 'completed' ? <IconCheck size={16} /> : <IconClock size={16} />}
                                        {booking.payment_status}
                                    </span>
                                </div>
                                <div className="booking-price">₹{booking.final_price.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
