'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconSearch, IconFilter, IconCheck, IconX, IconUser, IconMail, IconPhone, IconCalendar, IconClock } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import { useModal } from '@/contexts/ModalContext';
import LottieLoader from '@/components/ui/LottieLoader';
import './page.css';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    final_price: number;
    payment_status: string;
    status: string;
    custom_notes: string;
    user_mobile: string;
    tattoo_designs: {
        name: string;
        image_url: string;
    };
    profiles: {
        full_name: string;
        email: string;
    };
    created_at: string;
}

export default function AdminBookingsPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { confirm } = useModal();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/admin/bookings');
            const data = await response.json();
            if (response.ok) {
                setBookings(Array.isArray(data) ? data : []);
            } else {
                console.error('API Error:', data.error);
                toast.error(data.error || 'Failed to load bookings');
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (bookingId: string, newStatus: string) => {
        if (newStatus === 'cancelled') {
            const confirmed = await confirm({
                title: 'Cancel Booking',
                message: 'Are you sure you want to cancel this booking?',
                confirmText: 'Yes, Cancel',
                type: 'danger'
            });
            if (!confirmed) return;
        }

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Booking ${newStatus === 'confirmed' ? 'accepted' : 'cancelled'} successfully`);
                fetchBookings();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const matchesSearch =
            booking.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.tattoo_designs?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    }) : [];

    const formatTime12Hour = (time24: string) => {
        if (!time24) return 'N/A';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <AppLayout>
            <div className="admin-bookings-page">
                <div className="page-header">
                    <div>
                        <h1>Tattoo Booking Management</h1>
                        <p>Total {bookings.length} bookings to date</p>
                    </div>
                </div>

                <div className="controls-row">
                    <div className="search-box">
                        <IconSearch size={20} />
                        <input
                            type="text"
                            placeholder="Search by customer, email or design..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filters-group">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                        <button className={filter === 'pending_verification' ? 'active' : ''} onClick={() => setFilter('pending_verification')}>Pending</button>
                        <button className={filter === 'confirmed' ? 'active' : ''} onClick={() => setFilter('confirmed')}>Confirmed</button>
                        <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>Cancelled</button>
                    </div>
                </div>

                <div className="bookings-table-container">
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Booking Info</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredBookings || []).map((booking: any) => (
                                <tr key={booking.id}>
                                    <td>
                                        <div className="booking-cell">
                                            <img src={booking.tattoo_designs.image_url || '/painting.png'} alt="" className="design-thumb" />
                                            <div>
                                                <div className="design-name">{booking.tattoo_designs.name}</div>
                                                <div className="datetime">
                                                    <IconCalendar size={14} /> {new Date(booking.booking_date).toLocaleDateString()}
                                                    <IconClock size={14} style={{ marginLeft: 8 }} /> {formatTime12Hour(booking.booking_time)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="name">{booking.profiles.full_name || 'N/A'}</div>
                                            <div className="email"><IconMail size={14} /> {booking.profiles.email}</div>
                                            <div className="phone"><IconPhone size={14} /> {booking.user_mobile || 'No Mobile'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-cell">
                                            <span className={`badge ${booking.status}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                            <span className={`badge ${booking.payment_status}`}>
                                                {booking.payment_status}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="price-cell">₹{booking.final_price.toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            {(booking.status === 'pending_verification' || booking.status === 'payment_pending') && (
                                                <>
                                                    <button className="icon-btn accept" onClick={() => updateStatus(booking.id, 'confirmed')} title="Accept">
                                                        <IconCheck size={20} />
                                                    </button>
                                                    <button className="icon-btn reject" onClick={() => updateStatus(booking.id, 'cancelled')} title="Reject">
                                                        <IconX size={20} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredBookings.length === 0 && (
                        <div className="empty-state">
                            <p>No bookings found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
