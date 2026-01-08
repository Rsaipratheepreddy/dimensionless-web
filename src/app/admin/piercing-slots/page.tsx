'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus, IconCalendar, IconClock, IconTrash, IconUsers, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/ui/LottieLoader';
import AddSlotModal from '@/components/features/art-classes/AddSlotModal';
import SlotBookingsModal from '@/components/features/admin/SlotBookingsModal';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'react-hot-toast';

interface PiercingSlot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    max_bookings: number;
    current_bookings: number;
    is_available: boolean;
    created_at: string;
}

export default function AdminPiercingSlotsPage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [slots, setSlots] = useState<PiercingSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useModal();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<PiercingSlot | null>(null);

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
            const response = await fetch(`/api/admin/piercing-slots?date=${selectedDate}`);
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
            const response = await fetch(`/api/admin/piercing-slots/${id}`, {
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
            <div className="admin-container">
                <header className="admin-hero">
                    <div className="hero-content">
                        <h1>Piercing Slots</h1>
                        <p>Manage availability for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="admin-actions-group">
                        <div className="date-selector-premium">
                            <IconCalendar size={18} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <button className="add-btn" onClick={() => setShowAddModal(true)}>
                            <IconPlus size={20} />
                            Add Custom Slot
                        </button>
                    </div>
                </header>

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
                        <div className="stat-label">Booked</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {slots.reduce((sum, s) => sum + s.current_bookings, 0)}
                        </div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                </div>

                <div className="slots-grid-premium">
                    {slots.length === 0 ? (
                        <div className="empty-state-premium">
                            <IconClock size={48} />
                            <h3>No slots found</h3>
                            <p>Default slots should automatically appear if configured, or create one manually.</p>
                            <button onClick={() => setShowAddModal(true)}>Create Manual Slot</button>
                        </div>
                    ) : (
                        slots.map(slot => (
                            <div
                                key={slot.id}
                                className={`slot-card-premium ${!slot.is_available ? 'booked' : ''} ${slot.current_bookings > 0 ? 'has-bookings' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                            >
                                <div className="slot-card-header">
                                    <div className="time-badge">
                                        <IconClock size={16} />
                                        <span>{formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}</span>
                                    </div>
                                    <button
                                        className="delete-action-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSlot(slot.id);
                                        }}
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                                <div className="slot-card-body">
                                    <div className="booking-info">
                                        <IconUsers size={16} />
                                        <span>{slot.current_bookings} / {slot.max_bookings}</span>
                                    </div>
                                    <span className={`status-pill ${slot.is_available ? 'available' : 'full'}`}>
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
