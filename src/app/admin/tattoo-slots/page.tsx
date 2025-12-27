'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus, IconCalendar, IconClock, IconTrash, IconUsers, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/LottieLoader';
import AddSlotModal from '@/components/AddSlotModal';
import SlotBookingsModal from '@/components/SlotBookingsModal';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';

interface TattooSlot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    max_bookings: number;
    current_bookings: number;
    is_available: boolean;
    created_at: string;
}

export default function AdminTattooSlotsPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [slots, setSlots] = useState<TattooSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useModal();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TattooSlot | null>(null);

    useEffect(() => {
        if (!authLoading && profile?.role !== 'admin') {
            router.replace('/');
        }
    }, [profile, authLoading, router]);

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const formatTime12Hour = (time24: string) => {
        if (!time24) return 'N/A';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const fetchSlots = async () => {
        try {
            const response = await fetch(`/api/admin/tattoo-slots?date=${selectedDate}`);
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSlot = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Slot',
            message: 'Are you sure you want to delete this slot? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/tattoo-slots/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('Slot deleted successfully');
                fetchSlots();
            } else {
                toast.error('Failed to delete slot');
            }
        } catch (error) {
            console.error('Error deleting slot:', error);
            toast.error('Error deleting slot');
        }
    };

    if (authLoading || loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    const availableSlots = slots.filter(s => s.is_available);
    const bookedSlots = slots.filter(s => !s.is_available);

    return (
        <AppLayout>
            <div className="admin-slots-page">
                <div className="page-header">
                    <div>
                        <h1>Tattoo Slot Management</h1>
                        <p>Manage available time slots for tattoo appointments</p>
                    </div>
                    <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <IconPlus size={20} />
                        Add Slot
                    </button>
                </div>

                <div className="date-selector">
                    <IconCalendar size={20} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">{slots.length}</div>
                        <div className="stat-label">Total Slots</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{availableSlots.length}</div>
                        <div className="stat-label">Available</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{bookedSlots.length}</div>
                        <div className="stat-label">Fully Booked</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {slots.reduce((sum, s) => sum + s.current_bookings, 0)}
                        </div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                </div>

                <div className="slots-grid">
                    {slots.length === 0 ? (
                        <div className="empty-state">
                            <IconClock size={48} />
                            <p>No slots available for this date</p>
                            <button onClick={() => setShowAddModal(true)}>Create First Slot</button>
                        </div>
                    ) : (
                        slots.map(slot => (
                            <div
                                key={slot.id}
                                className={`slot-card ${!slot.is_available ? 'fully-booked' : ''} ${slot.current_bookings > 0 ? 'has-bookings' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                            >
                                <div className="slot-header">
                                    <div className="slot-time">
                                        <IconClock size={18} />
                                        <span>{formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}</span>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSlot(slot.id);
                                        }}
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                                <div className="slot-info">
                                    <div className="booking-count">
                                        <IconUsers size={16} />
                                        <span>{slot.current_bookings} / {slot.max_bookings} booked</span>
                                    </div>
                                    <span className={`status-badge ${slot.is_available ? 'available' : 'full'}`}>
                                        {slot.is_available ? 'Available' : 'Full'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AddSlotModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchSlots}
            />

            {selectedSlot && (
                <SlotBookingsModal
                    slotId={selectedSlot.id}
                    slotTime={`${formatTime12Hour(selectedSlot.start_time)} - ${formatTime12Hour(selectedSlot.end_time)}`}
                    onClose={() => setSelectedSlot(null)}
                />
            )}
        </AppLayout>
    );
}
