'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { IconCheck, IconChevronLeft, IconChevronRight, IconCalendar, IconClock, IconUpload, IconX } from '@tabler/icons-react';
import './page.css';
import LottieLoader from '@/components/ui/LottieLoader';
import { toast } from 'react-hot-toast';

interface TattooDesign {
    id: string;
    name: string;
    description: string;
    base_price: number;
    estimated_duration: number;
    image_url: string;
}

interface TimeSlot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    current_bookings: number;
    max_bookings: number;
}

export default function BookTattooPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading, openAuthModal } = useAuth();
    const designId = params.designId as string;

    const [design, setDesign] = useState<TattooDesign | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Date & Time
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [flexibleBooking, setFlexibleBooking] = useState(false);
    const [customDateTime, setCustomDateTime] = useState({ date: '', time: '' });

    // Step 2: Customization
    const [notes, setNotes] = useState('');
    const [referenceImages, setReferenceImages] = useState<string[]>([]);
    const [userMobile, setUserMobile] = useState('');

    // Step 3: Payment
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'counter'>('online');

    const [submitting, setSubmitting] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    // Format time to 12-hour format
    const formatTime12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        // Don't redirect while auth is still loading
        if (authLoading) return;

        if (!user) {
            openAuthModal('signin');
            router.push('/tattoos');
            return;
        }
        fetchDesign();
    }, [user, authLoading]);

    useEffect(() => {
        if (currentStep === 1 && selectedDate) {
            fetchSlots();
        }
    }, [selectedDate, currentStep]);

    const fetchDesign = async () => {
        try {
            const response = await fetch(`/api/tattoos/${designId}`);
            const data = await response.json();
            setDesign(data);
        } catch (error) {
            console.error('Error fetching design:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await fetch(`/api/tattoos/${designId}/slots?date=${selectedDate}`);
            const data = await response.json();
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            let filteredSlots = data;
            if (selectedDate === today) {
                const currentTime = now.getHours() * 60 + now.getMinutes();
                filteredSlots = data.filter((slot: TimeSlot) => {
                    const [hours, minutes] = slot.start_time.split(':');
                    const slotTime = parseInt(hours) * 60 + parseInt(minutes);
                    return slotTime > currentTime;
                });
            }

            setSlots(filteredSlots);
            if (filteredSlots.length === 0 && data.length > 0) {
                // If there were slots but all are past
                setFlexibleBooking(false);
            } else if (data.length === 0) {
                setFlexibleBooking(true);
            } else {
                setFlexibleBooking(false);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setReferenceImages(prev => prev.filter((_, i) => i !== index));
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async () => {
        if (!user || !design) return;

        setSubmitting(true);
        try {
            const bookingData = {
                design_id: designId,
                booking_type: 'tattoo',
                slot_id: flexibleBooking ? null : selectedSlot,
                booking_date: flexibleBooking ? customDateTime.date : selectedDate,
                booking_time: flexibleBooking ? customDateTime.time : slots.find(s => s.id === selectedSlot)?.start_time,
                custom_notes: notes,
                reference_images: referenceImages,
                payment_method: paymentMethod,
                final_price: design.base_price,
                user_mobile: userMobile
            };

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error('Failed to create booking');

            // If Pay Now is selected, initiate Razorpay payment
            if (paymentMethod === 'online') {
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Razorpay SDK failed to load. Please try again.');
                    setSubmitting(false);
                    return;
                }

                // Create Razorpay order
                const orderRes = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paintingId: designId,
                        amount: design.base_price
                    })
                });

                const orderData = await orderRes.json();
                if (orderData.error) throw new Error(orderData.error);

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RtwhZZFSvgR3el',
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Dimensionless",
                    description: `Tattoo Booking - ${design.name}`,
                    order_id: orderData.orderId,
                    handler: async function (razorpayResponse: any) {
                        // Verify payment and update booking
                        const verifyRes = await fetch('/api/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...razorpayResponse,
                                paintingId: designId,
                                buyerId: user.id,
                                bookingId: result.id
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success('Booking confirmed successfully!');
                            router.push(`/tattoos/booking-confirmation/${result.id}`);
                        } else {
                            toast.error('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: user.email || "",
                        email: user.email || ""
                    },
                    theme: {
                        color: "#5b4fe8"
                    }
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
                setSubmitting(false);
            } else {
                // Pay at Counter - redirect directly
                router.push(`/tattoos/booking-confirmation/${result.id}`);
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error('Failed to create booking. Please try again.');
        } finally {
            if (paymentMethod !== 'online') {
                setSubmitting(false);
            }
        }
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return flexibleBooking ? (customDateTime.date && customDateTime.time) : selectedSlot;
        }
        if (currentStep === 2) {
            return userMobile && userMobile.length === 10;
        }
        return true;
    };

    if (loading) {
        return (
            <AppLayout>
                <LottieLoader />
            </AppLayout>
        );
    }

    if (!design) {
        return (
            <AppLayout>
                <div className="error-state">Design not found</div>
            </AppLayout>
        );
    }

    const steps = [
        { number: 1, title: 'Date & Time' },
        { number: 2, title: 'Customization' },
        { number: 3, title: 'Payment' },
        { number: 4, title: 'Confirm' }
    ];

    return (
        <AppLayout>
            <div className="booking-page">
                <div className="booking-header">
                    <h1>Book Your Tattoo</h1>
                    <p>{design.name}</p>
                </div>

                {/* Progress Indicator */}
                <div className="progress-steps">
                    {steps.map(step => (
                        <div key={step.number} className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                            <div className="step-number">
                                {currentStep > step.number ? <IconCheck size={16} /> : step.number}
                            </div>
                            <div className="step-title">{step.title}</div>
                        </div>
                    ))}
                </div>

                <div className="booking-content">
                    {/* Design Summary Sidebar */}
                    <div className="design-summary">
                        <div className="design-image-container" onClick={() => setShowImageModal(true)}>
                            <img src={design.image_url || '/painting.png'} alt={design.name} />
                            <div className="image-overlay">
                                <span>Click to view full image</span>
                            </div>
                        </div>
                        <h3>{design.name}</h3>
                        <p>{design.description}</p>
                        <div className="price-info">
                            <span className="label">Base Price</span>
                            <span className="price">₹{design.base_price.toLocaleString()}</span>
                        </div>
                        <div className="duration-info">
                            <IconClock size={16} />
                            <span>{design.estimated_duration} minutes</span>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="step-content">
                        {/* Step 1: Date & Time Selection */}
                        {currentStep === 1 && (
                            <div className="step-container">
                                <h2>Select Date & Time</h2>

                                <div className="date-picker">
                                    <label>Select Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {!flexibleBooking && slots.length > 0 ? (
                                    <div className="slots-grid">
                                        {slots.map(slot => {
                                            const isFull = !slot.is_available || slot.current_bookings >= slot.max_bookings;
                                            const isSelected = selectedSlot === slot.id;

                                            return (
                                                <button
                                                    key={slot.id}
                                                    className={`slot-btn ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`}
                                                    onClick={() => !isFull && setSelectedSlot(slot.id)}
                                                    disabled={isFull}
                                                >
                                                    <div className="slot-time">{formatTime12Hour(slot.start_time)} - {formatTime12Hour(slot.end_time)}</div>
                                                    <div className="slot-status">
                                                        {isFull ? (
                                                            <span className="full-label">Fully Booked</span>
                                                        ) : (
                                                            <span className="available-label">
                                                                {slot.max_bookings - slot.current_bookings} remaining
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flexible-booking">
                                        <p>No pre-configured slots available. Request a custom time:</p>
                                        <div className="custom-datetime">
                                            <input
                                                type="date"
                                                value={customDateTime.date}
                                                onChange={(e) => setCustomDateTime({ ...customDateTime, date: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <input
                                                type="time"
                                                value={customDateTime.time}
                                                onChange={(e) => setCustomDateTime({ ...customDateTime, time: e.target.value })}
                                            />
                                        </div>
                                        <small>Your request will require admin approval</small>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Customization */}
                        {currentStep === 2 && (
                            <div className="step-container">
                                <h2>Customize Your Booking</h2>

                                <div className="form-group">
                                    <label>Mobile Number *</label>
                                    <input
                                        type="tel"
                                        value={userMobile}
                                        onChange={(e) => setUserMobile(e.target.value)}
                                        placeholder="Enter your 10-digit mobile number"
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                    />
                                    <small>We'll use this to contact you about your appointment</small>
                                </div>

                                <div className="form-group">
                                    <label>Custom Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any specific requirements, placement preferences, or modifications..."
                                        rows={4}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reference Images (Optional)</label>
                                    <div className="image-upload-area">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="upload-label">
                                            <IconUpload size={32} />
                                            <span>Click to upload reference images</span>
                                        </label>
                                    </div>

                                    {referenceImages.length > 0 && (
                                        <div className="image-previews">
                                            {referenceImages.map((img, index) => (
                                                <div key={index} className="image-preview">
                                                    <img src={img} alt={`Reference ${index + 1}`} />
                                                    <button onClick={() => removeImage(index)}>
                                                        <IconX size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment Method */}
                        {currentStep === 3 && (
                            <div className="step-container">
                                <h2>Choose Payment Method</h2>

                                <div className="payment-methods">
                                    <button
                                        className={`payment-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('online')}
                                    >
                                        <div className="payment-header">
                                            <h3>Pay Now</h3>
                                            <div className="radio">{paymentMethod === 'online' && <div className="dot" />}</div>
                                        </div>
                                        <p>Secure online payment via Razorpay</p>
                                        <span className="badge">Instant Confirmation</span>
                                    </button>

                                    <button
                                        className={`payment-card ${paymentMethod === 'counter' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('counter')}
                                    >
                                        <div className="payment-header">
                                            <h3>Pay at Counter</h3>
                                            <div className="radio">{paymentMethod === 'counter' && <div className="dot" />}</div>
                                        </div>
                                        <p>Pay when you arrive for your appointment</p>
                                        <span className="badge">Pending Confirmation</span>
                                    </button>
                                </div>

                                <div className="price-summary">
                                    <div className="summary-row">
                                        <span>Base Price</span>
                                        <span>₹{design.base_price.toLocaleString()}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total Amount</span>
                                        <span>₹{design.base_price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirmation */}
                        {currentStep === 4 && (
                            <div className="step-container">
                                <h2>Confirm Your Booking</h2>

                                <div className="booking-summary">
                                    <div className="summary-section">
                                        <h3>Date & Time</h3>
                                        <p>{flexibleBooking ? customDateTime.date : selectedDate}</p>
                                        <p>
                                            {flexibleBooking
                                                ? customDateTime.time ? formatTime12Hour(customDateTime.time) : 'Custom Time'
                                                : formatTime12Hour(slots.find(s => s.id === selectedSlot)?.start_time || '00:00')}
                                        </p>
                                    </div>

                                    {notes && (
                                        <div className="summary-section">
                                            <h3>Custom Notes</h3>
                                            <p>{notes}</p>
                                        </div>
                                    )}

                                    {referenceImages.length > 0 && (
                                        <div className="summary-section">
                                            <h3>Reference Images</h3>
                                            <p>{referenceImages.length} image(s) uploaded</p>
                                        </div>
                                    )}

                                    <div className="summary-section">
                                        <h3>Payment Method</h3>
                                        <p>{paymentMethod === 'online' ? 'Pay Now (Online)' : 'Pay at Counter'}</p>
                                    </div>

                                    <div className="summary-section">
                                        <h3>Total Amount</h3>
                                        <p className="total-price">₹{design.base_price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="step-navigation">
                            {currentStep > 1 && (
                                <button
                                    className="nav-btn prev"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                >
                                    <IconChevronLeft size={20} />
                                    Previous
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    className="nav-btn next"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={!canProceed()}
                                >
                                    Next
                                    <IconChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    className="nav-btn submit"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Full Screen Modal */}
            {showImageModal && (
                <div className="image-zoom-modal" onClick={() => setShowImageModal(false)}>
                    <div className="modal-close">
                        <IconX size={32} />
                    </div>
                    <div className="modal-image-container" onClick={(e) => e.stopPropagation()}>
                        <img src={design.image_url || '/painting.png'} alt={design.name} />
                        <div className="modal-image-info">
                            <h3>{design.name}</h3>
                            <p>{design.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
