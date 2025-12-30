'use client';

import { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    IconCalendar,
    IconMapPin,
    IconUsers,
    IconShare,
    IconCheck,
    IconTrophy,
    IconLoader2,
    IconArrowLeft
} from '@tabler/icons-react';
import './details.css';
import LottieLoader from '@/components/ui/LottieLoader';
import { toast } from 'react-hot-toast';
import Script from 'next/script';
import Link from 'next/link';

interface EventDetails {
    id: string;
    title: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
    location: string;
    price: number;
    max_capacity: number;
    type: 'event' | 'competition';
    category_name: string;
    is_registered: boolean;
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, profile, openAuthModal } = useAuth();
    const router = useRouter();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const response = await fetch(`/api/events/detail/${id}`);
            const data = await response.json();
            if (response.ok) {
                setEvent(data);
            } else {
                toast.error('Event not found');
                router.push('/events');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            toast.error('Please login to register');
            openAuthModal('signin');
            return;
        }

        setRegistering(true);
        try {
            const response = await fetch('/api/events/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: id })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Registration failed');

            if (data.needsPayment) {
                startPayment(data.registrationId, data.price);
            } else {
                toast.success('Successfully registered!');
                fetchEventDetails();
            }
        } catch (error: any) {
            toast.error(error.message);
            setRegistering(false);
        }
    };

    const startPayment = async (registrationId: string, amount: number) => {
        try {
            const checkoutResponse = await fetch('/api/events/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId, amount })
            });
            const checkoutData = await checkoutResponse.json();

            if (!checkoutResponse.ok) throw new Error(checkoutData.error || 'Checkout failed');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RtwhZZFSvgR3el',
                amount: checkoutData.amount,
                currency: checkoutData.currency,
                name: 'Dimensionless Events',
                description: `Registration for ${event?.title}`,
                order_id: checkoutData.orderId,
                handler: async (response: any) => {
                    const verifyResponse = await fetch('/api/events/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...response, registrationId })
                    });
                    if (verifyResponse.ok) {
                        toast.success('Payment successful!');
                        fetchEventDetails();
                    } else {
                        toast.error('Verification failed');
                    }
                },
                prefill: {
                    name: profile?.full_name || '',
                    email: user?.email || '',
                },
                theme: { color: '#5b4fe8' }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Invite link copied!');
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;
    if (!event) return <AppLayout><div className="error-state">Event not found</div></AppLayout>;

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    return (
        <AppLayout>
            <div className="event-details-page">
                <div className="back-nav">
                    <Link href="/events" className="back-link">
                        <IconArrowLeft size={20} />
                        Back to Discovery
                    </Link>
                </div>

                <div className="details-container">
                    <div className="main-content">
                        <div className="hero-section">
                            <div className="hero-image">
                                <img src={event.image_url || '/painting.png'} alt={event.title} />
                                <div className={`type-ribbon ${event.type}`}>
                                    {event.type === 'competition' ? <IconTrophy size={16} /> : <IconCalendar size={16} />}
                                    {event.type.toUpperCase()}
                                </div>
                            </div>

                            <div className="header-info">
                                <span className="category-label">{event.category_name}</span>
                                <h1>{event.title}</h1>

                                <div className="quick-meta">
                                    <div className="meta-item">
                                        <IconCalendar size={18} />
                                        <span>{startDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="meta-item">
                                        <IconMapPin size={18} />
                                        <span>{event.location}</span>
                                    </div>
                                    {event.max_capacity && (
                                        <div className="meta-item">
                                            <IconUsers size={18} />
                                            <span>{event.max_capacity} Seats Available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="description-section">
                            <h2>About this {event.type}</h2>
                            <div className="rich-text">
                                {event.description}
                            </div>
                        </div>
                    </div>

                    <div className="sticky-sidebar">
                        <div className="pricing-card">
                            <div className="card-top">
                                <div className="price-label">Registration Fee</div>
                                <div className="price-value">
                                    {event.price === 0 ? 'FREE' : `₹${event.price.toLocaleString()}`}
                                </div>
                            </div>

                            <div className="card-actions">
                                {event.is_registered ? (
                                    <div className="status-badge confirmed">
                                        <IconCheck size={20} />
                                        Already Registered
                                    </div>
                                ) : (
                                    <button
                                        className="primary-action-btn"
                                        onClick={handleRegister}
                                        disabled={registering}
                                    >
                                        {registering ? <IconLoader2 className="animate-spin" size={20} /> : (event.price === 0 ? 'Join for Free' : 'Register Now')}
                                    </button>
                                )}

                                <button className="secondary-action-btn" onClick={handleShare}>
                                    <IconShare size={20} />
                                    Invite Friends
                                </button>
                            </div>

                            <div className="card-perks">
                                <div className="perk">
                                    <IconCheck size={16} />
                                    <span>Access to all sessions</span>
                                </div>
                                <div className="perk">
                                    <IconCheck size={16} />
                                    <span>Community interaction</span>
                                </div>
                                {event.type === 'competition' && (
                                    <div className="perk">
                                        <IconCheck size={16} />
                                        <span>Certificate of Participation</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </AppLayout>
    );
}
