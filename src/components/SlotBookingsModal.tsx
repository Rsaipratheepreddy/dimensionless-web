'use client';

import { useState, useEffect } from 'react';
import { IconX, IconUser, IconPhone, IconMail, IconCheck, IconX as IconClose } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import { useModal } from '@/contexts/ModalContext';
import './SlotBookingsModal.css';

interface Booking {
    id: string;
    user_mobile: string;
    custom_notes: string;
    status: string;
    payment_status: string;
    final_price: number;
    tattoo_designs: {
        name: string;
        image_url: string;
    };
    profiles: {
        full_name: string;
        email: string;
    };
}

interface SlotBookingsModalProps {
    slotId: string;
    slotTime: string;
    onClose: () => void;
}

export default function SlotBookingsModal({ slotId, slotTime, onClose }: SlotBookingsModalProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useModal();

    useEffect(() => {
        if (slotId) {
            fetchBookings();
        }
    }, [slotId]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/tattoo-slots/${slotId}/bookings`);
            const data = await response.json();
            if (response.ok) {
                setBookings(Array.isArray(data) ? data : []);
            } else {
                toast.error(data.error || 'Failed to load bookings');
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (bookingId: string, newStatus: string) => {
        if (newStatus === 'cancelled') {
            const confirmed = await confirm({
                title: 'Cancel Booking',
                message: 'Are you sure you want to cancel this booking? This will free up the slot.',
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content slot-bookings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Slot Bookings - {slotTime}</h2>
                    <button onClick={onClose} className="close-btn">
                        <IconX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="empty-state">
                            <p>No bookings for this slot yet</p>
                        </div>
                    ) : (
                        <div className="bookings-list">
                            {bookings.map(booking => (
                                <div key={booking.id} className="booking-item">
                                    <div className="booking-header">
                                        <img
                                            src={booking.tattoo_designs?.image_url || '/painting.png'}
                                            alt={booking.tattoo_designs?.name || 'Design'}
                                            className="design-thumb"
                                        />
                                        <div className="booking-info">
                                            <h4>{booking.tattoo_designs?.name || 'Custom Design'}</h4>
                                            <div className="status-badges">
                                                <span className={`badge ${booking.status}`}>
                                                    {booking.status.replace('_', ' ')}
                                                </span>
                                                <span className={`badge ${booking.payment_status}`}>
                                                    {booking.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="customer-details">
                                        <div className="detail-row">
                                            <IconUser size={16} />
                                            <span>{booking.profiles?.full_name || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <IconMail size={16} />
                                            <span>{booking.profiles?.email || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <IconPhone size={16} />
                                            <span>{booking.user_mobile || 'Not provided'}</span>
                                        </div>
                                    </div>

                                    {booking.custom_notes && (
                                        <div className="booking-notes">
                                            <strong>Notes:</strong> {booking.custom_notes}
                                        </div>
                                    )}

                                    <div className="booking-footer">
                                        <span className="price">₹{booking.final_price.toLocaleString()}</span>
                                        <div className="booking-actions">
                                            {(booking.status === 'pending' ||
                                                booking.status === 'pending_verification' ||
                                                booking.status === 'payment_pending') && (
                                                    <>
                                                        <button
                                                            className="action-btn accept"
                                                            onClick={() => updateStatus(booking.id, 'confirmed')}
                                                            title="Confirm Booking"
                                                        >
                                                            <IconCheck size={18} />
                                                            Accept
                                                        </button>
                                                        <button
                                                            className="action-btn reject"
                                                            onClick={() => updateStatus(booking.id, 'cancelled')}
                                                            title="Cancel Booking"
                                                        >
                                                            <IconClose size={18} />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
