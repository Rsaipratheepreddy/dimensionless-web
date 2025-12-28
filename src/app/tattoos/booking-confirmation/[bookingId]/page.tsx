'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { IconCheck, IconCalendar, IconClock, IconCreditCard, IconHome } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/ui/LottieLoader';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    final_price: number;
    payment_method: string;
    payment_status: string;
    status: string;
    custom_notes: string;
    tattoo_designs: {
        name: string;
        image_url: string;
    };
}

export default function BookingConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId as string;

    const [booking, setBooking] = useState<Booking | null>(null);
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
        fetchBooking();
    }, []);

    const fetchBooking = async () => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`);
            const data = await response.json();
            setBooking(data);
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    if (!booking) {
        return (
            <AppLayout>
                <div className="error-state">Booking not found</div>
            </AppLayout>
        );
    }

    const getStatusMessage = () => {
        if (booking.payment_method === 'online' && booking.payment_status === 'pending') {
            return {
                title: 'Payment Pending',
                message: 'Please complete your payment to confirm your booking.',
                type: 'warning'
            };
        }
        if (booking.status === 'pending_verification') {
            return {
                title: 'Booking Received!',
                message: 'Your booking request has been received and is pending admin verification.',
                type: 'info'
            };
        }
        return {
            title: 'Booking Confirmed!',
            message: 'Your tattoo appointment has been successfully booked.',
            type: 'success'
        };
    };

    const status = getStatusMessage();

    return (
        <AppLayout>
            <div className="confirmation-page">
                <div className="confirmation-card">
                    <div className={`status-icon ${status.type}`}>
                        <IconCheck size={48} />
                    </div>

                    <h1>{status.title}</h1>
                    <p className="status-message">{status.message}</p>

                    <div className="booking-reference">
                        <span className="label">Booking Reference</span>
                        <span className="reference-id">{booking.id.slice(0, 8).toUpperCase()}</span>
                    </div>

                    <div className="booking-details">
                        <div className="detail-section">
                            <img
                                src={booking.tattoo_designs.image_url || '/painting.png'}
                                alt={booking.tattoo_designs.name}
                                className="design-image"
                            />
                            <h3>{booking.tattoo_designs.name}</h3>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <IconCalendar size={20} />
                                <div>
                                    <span className="label">Date</span>
                                    <span className="value">{new Date(booking.booking_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <IconClock size={20} />
                                <div>
                                    <span className="label">Time</span>
                                    <span className="value">{formatTime12Hour(booking.booking_time)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-item">
                                <IconCreditCard size={20} />
                                <div>
                                    <span className="label">Payment Method</span>
                                    <span className="value">
                                        {booking.payment_method === 'online' ? 'Pay Now (Online)' : 'Pay at Counter'}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="price-badge">
                                    ₹{booking.final_price.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {booking.custom_notes && (
                            <div className="notes-section">
                                <span className="label">Custom Notes</span>
                                <p>{booking.custom_notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="next-steps">
                        <h3>Next Steps</h3>
                        <ul>
                            {booking.payment_method === 'online' && booking.payment_status === 'pending' && (
                                <li>Complete your payment to confirm the booking</li>
                            )}
                            {booking.status === 'pending_verification' && (
                                <li>Wait for admin verification (you'll receive an email)</li>
                            )}
                            <li>Check your email for booking confirmation</li>
                            <li>Arrive 10 minutes early on your appointment date</li>
                            <li>Bring a valid ID for verification</li>
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="secondary-btn"
                            onClick={() => router.push('/tattoos')}
                        >
                            Browse More Designs
                        </button>
                        <button
                            className="primary-btn"
                            onClick={() => router.push('/')}
                        >
                            <IconHome size={20} />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
