'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
    IconCalendar,
    IconClock,
    IconVideo,
    IconUsers,
    IconCurrencyRupee,
    IconCheck,
    IconClockHour4
} from '@tabler/icons-react';
import './details.css';
import LottieLoader from '@/components/ui/LottieLoader';
import { toast } from 'react-hot-toast';
import Script from 'next/script';

interface Session {
    id: string;
    session_title: string;
    session_date: string;
    session_time: string;
    session_link?: string;
}

interface ArtClassDetails {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    pricing_type: 'free' | 'one_time' | 'subscription';
    price: number;
    category_name: string;
    sessions: Session[];
    is_registered: boolean;
    subscription_duration?: number;
}

export default function ClassDetailsPage() {
    const { user, profile, openAuthModal } = useAuth();
    const router = useRouter();
    const { id } = useParams();
    const [artClass, setArtClass] = useState<ArtClassDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (id && id !== 'undefined') {
            fetchClassDetails();
        } else if (id === 'undefined') {
            setLoading(false);
            toast.error('Invalid class ID');
            router.push('/art-classes');
        }
    }, [id]);

    const fetchClassDetails = async () => {
        if (!id || id === 'undefined') return;
        try {
            const response = await fetch(`/api/art-classes/${id}`);
            const data = await response.json();
            if (response.ok) {
                setArtClass(data);
            } else {
                toast.error('Class not found');
                router.push('/art-classes');
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

        if (artClass?.pricing_type === 'free') {
            registerFree();
        } else {
            // Start payment flow
            startPayment();
        }
    };

    const registerFree = async () => {
        setRegistering(true);
        try {
            const response = await fetch('/api/art-classes/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: id })
            });

            if (response.ok) {
                toast.success('Successfully registered!');
                fetchClassDetails(); // Refresh to show join links
            } else {
                const data = await response.json();
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('Error during registration');
        } finally {
            setRegistering(false);
        }
    };

    const startPayment = async () => {
        if (!user) return;
        setRegistering(true);

        try {
            // 1. Create a pending registration
            const regResponse = await fetch('/api/art-classes/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: id })
            });
            const regData = await regResponse.json();

            if (!regResponse.ok) throw new Error(regData.error || 'Failed to initiate registration');

            // 2. Create Razorpay Order
            const checkoutResponse = await fetch('/api/art-classes/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registrationId: regData.registrationId,
                    amount: regData.price
                })
            });
            const checkoutData = await checkoutResponse.json();

            if (!checkoutResponse.ok) throw new Error(checkoutData.error || 'Failed to create payment order');

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RtwhZZFSvgR3el',
                amount: checkoutData.amount,
                currency: checkoutData.currency,
                name: 'Dimensionless Art',
                description: `Registration for ${artClass?.title}`,
                order_id: checkoutData.orderId,
                handler: async (response: any) => {
                    try {
                        const verifyResponse = await fetch('/api/art-classes/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...response,
                                registrationId: regData.registrationId
                            })
                        });
                        if (verifyResponse.ok) {
                            toast.success('Payment successful! You are now registered.');
                            fetchClassDetails();
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        toast.error('Verification error');
                    }
                },
                prefill: {
                    name: profile?.full_name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#5b4fe8',
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Payment failed');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <AppLayout><LottieLoader /></AppLayout>;
    if (!artClass) return <AppLayout><div className="error-state">Class not found</div></AppLayout>;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            full: date.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })
        };
    };

    const formatTime12h = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <AppLayout>
            <div className="class-details-page">
                <div className="details-grid">
                    <div className="details-main">
                        <div className="class-header">
                            <span className="cat-tag">{artClass.category_name}</span>
                            <h1>{artClass.title}</h1>
                            <div className="stats-line">
                                <div className="stat-item">
                                    <IconCalendar size={18} />
                                    {artClass.sessions.length} Lessons
                                </div>
                                <div className="stat-item">
                                    <IconUsers size={18} />
                                    Live Sessions
                                </div>
                            </div>
                        </div>

                        <div className="class-hero-img">
                            <img src={artClass.thumbnail_url || '/painting.png'} alt={artClass.title} />
                        </div>

                        <section className="about-section">
                            <h2>About This Class</h2>
                            <p className="description">{artClass.description}</p>
                        </section>

                        <section className="sessions-section">
                            <h2>Session Schedule</h2>
                            <div className="sessions-timeline">
                                {artClass.sessions.map((session, index) => {
                                    const dateInfo = formatDate(session.session_date);
                                    return (
                                        <div key={session.id} className="session-card">
                                            <div className="session-date-box">
                                                <span className="day">{dateInfo.day}</span>
                                                <span className="month">{dateInfo.month}</span>
                                            </div>
                                            <div className="session-info">
                                                <h4>{session.session_title || `Session ${index + 1}`}</h4>
                                                <div className="time">
                                                    <IconClockHour4 size={16} />
                                                    {formatTime12h(session.session_time)}
                                                </div>
                                            </div>
                                            {artClass.is_registered && session.session_link && (
                                                <a
                                                    href={session.session_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="join-link-btn"
                                                >
                                                    <IconVideo size={18} />
                                                    Join Session
                                                </a>
                                            )}
                                            {!artClass.is_registered && (
                                                <div className="join-link-btn disabled" style={{ background: '#eee', color: '#999', cursor: 'not-allowed' }}>
                                                    <IconVideo size={18} />
                                                    Join Link Unlocked on Registration
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <div className="details-sidebar">
                        <div className="registration-card">
                            <div className="pricing-section">
                                <div className="price">
                                    {artClass.pricing_type === 'free' ? 'Free' : `₹${artClass.price.toLocaleString()}`}
                                    {artClass.pricing_type === 'subscription' && <small>/ {artClass.subscription_duration} Days</small>}
                                </div>
                            </div>

                            {artClass.is_registered ? (
                                <div className="register-btn registered">
                                    <IconCheck size={20} />
                                    Already Registered
                                </div>
                            ) : (
                                <button
                                    className="register-btn"
                                    onClick={handleRegister}
                                    disabled={registering}
                                >
                                    {registering ? 'Processing...' : (artClass.pricing_type === 'free' ? 'Register for Free' : 'Buy Now')}
                                </button>
                            )}

                            <div className="info-list">
                                <div className="info-bullet">
                                    <IconCheck size={18} style={{ color: '#10b981' }} />
                                    Access to all live sessions
                                </div>
                                <div className="info-bullet">
                                    <IconCheck size={18} style={{ color: '#10b981' }} />
                                    Digital learning materials
                                </div>
                                <div className="info-bullet">
                                    <IconCheck size={18} style={{ color: '#10b981' }} />
                                    Certificate upon completion
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </AppLayout>
    );
}
