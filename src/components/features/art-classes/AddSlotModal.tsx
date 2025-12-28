'use client';

import { useState } from 'react';
import { IconX, IconCalendar, IconClock, IconUsers, IconForms } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';

interface AddSlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddSlotModal({ isOpen, onClose, onSuccess }: AddSlotModalProps) {
    const [bulkMode, setBulkMode] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00',
        max_bookings: 1,
        slot_duration: 60 // in minutes, for bulk mode
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const endpoint = bulkMode ? '/api/admin/tattoo-slots/bulk' : '/api/admin/tattoo-slots';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                if (bulkMode) {
                    toast.success(`Successfully created ${result.count} slots!`);
                } else {
                    toast.success('Slot created successfully!');
                }
                onSuccess();
                onClose();
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    start_time: '10:00',
                    end_time: '11:00',
                    max_bookings: 1,
                    slot_duration: 60
                });
                setBulkMode(false);
            }
        } catch (error) {
            console.error('Error creating slot:', error);
            toast.error('Failed to create slot. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{bulkMode ? 'Create Multiple Slots' : 'Add Time Slot'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IconX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="slot-form">
                    <div className="form-group toggle-group">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={bulkMode}
                                onChange={(e) => setBulkMode(e.target.checked)}
                            />
                            <div className="toggle-custom">
                                <div className="toggle-dot"></div>
                            </div>
                            <span className="toggle-text">Bulk Create (Split time range)</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label><IconCalendar size={16} /> Date *</label>
                        <div className="input-with-icon">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><IconClock size={16} /> Start Time *</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><IconClock size={16} /> End Time *</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {bulkMode && (
                        <div className="form-group">
                            <label>Slot Duration *</label>
                            <select
                                value={formData.slot_duration}
                                onChange={(e) => setFormData({ ...formData, slot_duration: parseInt(e.target.value) })}
                            >
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                            </select>
                            <small>Will create multiple slots based on duration</small>
                        </div>
                    )}

                    <div className="form-group">
                        <label><IconUsers size={16} /> Maximum Bookings *</label>
                        <input
                            type="number"
                            value={formData.max_bookings}
                            onChange={(e) => setFormData({ ...formData, max_bookings: parseInt(e.target.value) })}
                            required
                            min="1"
                            max="10"
                        />
                        <small>How many appointments can be booked in this slot</small>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Slot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
