'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    IconArrowLeft,
    IconLoader2,
    IconCalendar,
    IconBuilding,
    IconBrush
} from '@tabler/icons-react';
import LottieLoader from '@/components/LottieLoader';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { toast } from 'react-hot-toast';
import '../page.css';

interface LeasablePainting {
    id: string;
    title: string;
    description: string;
    artist_name: string;
    artist_avatar_url?: string;
    image_url: string;
    hourly_rate: number;
    daily_rate: number;
    monthly_rate: number;
    yearly_rate: number;
}

export default function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { profile } = useAuth();
    const router = useRouter();
    const [painting, setPainting] = useState<LeasablePainting | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPainting(id);
        }
    }, [id]);

    useEffect(() => {
        if (startDate && endDate && painting) {
            calculatePrice();
        }
    }, [startDate, endDate, painting]);

    const fetchPainting = async (paintingId: string) => {
        try {
            const { data, error } = await supabase
                .from('leasable_paintings')
                .select('*')
                .eq('id', paintingId)
                .single();

            if (error) throw error;
            setPainting(data);
        } catch (error) {
            console.error('Error fetching painting:', error);
            toast.error('Art not found');
            router.push('/art-leasing');
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        if (!painting) return;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs <= 0) {
            setTotalPrice(0);
            return;
        }

        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        const diffMonths = diffDays / 30;
        const diffYears = diffDays / 365;

        let bestPrice = 0;

        // Simple strategy: check each bucket and pick the most logical one
        // or just apply the largest applicable unit.
        // For simplicity, we'll use a hierarchy: Yearly -> Monthly -> Daily -> Hourly
        if (painting.yearly_rate > 0 && diffYears >= 1) {
            bestPrice = diffYears * painting.yearly_rate;
        } else if (painting.monthly_rate > 0 && diffMonths >= 1) {
            bestPrice = diffMonths * painting.monthly_rate;
        } else if (painting.daily_rate > 0 && diffDays >= 1) {
            bestPrice = diffDays * painting.daily_rate;
        } else {
            bestPrice = diffHours * painting.hourly_rate;
        }

        setTotalPrice(Math.round(bestPrice));
    };

    const handleLease = async () => {
        if (!profile) {
            toast.error('Please login to lease art');
            return;
        }
        if (!startDate || !endDate || totalPrice <= 0) {
            toast.error('Please select a valid duration');
            return;
        }

        setBooking(true);
        try {
            const { error } = await supabase.from('lease_orders').insert([{
                user_id: profile.id,
                painting_id: id,
                start_date: startDate,
                end_date: endDate,
                total_price: totalPrice,
                status: 'pending'
            }]);

            if (error) throw error;
            toast.success('Lease request sent! Our team will contact you soon.');
            router.push('/orders');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setBooking(false);
        }
    };

    if (loading) return (
        <AppLayout>
            <LottieLoader />
        </AppLayout>
    );

    if (!painting) return null;

    return (
        <AppLayout>
            <div className="lease-vertical-layout">
                <div className="vertical-content-center">
                    <div className="back-link-simple">
                        <Link href="/art-leasing">
                            <IconArrowLeft size={16} /> Collection
                        </Link>
                    </div>

                    <div className="detail-hero-minimal">
                        <img src={painting.image_url} alt={painting.title} className="hero-img-seamless" />
                    </div>

                    <div className="detail-header-group">
                        <h1>{painting.title}</h1>
                        <div className="artist-profile-row">
                            {painting.artist_avatar_url ? (
                                <img src={painting.artist_avatar_url} className="artist-avatar-sm" alt={painting.artist_name} />
                            ) : (
                                <div className="avatar-placeholder-sm"><IconBrush size={14} /></div>
                            )}
                            <div className="artist-info-stack">
                                <span className="artist-name-bold">{painting.artist_name}</span>
                                <span className="verified-status">Verified Artist</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-narrative">
                        <p>{painting.description}</p>
                    </div>

                    <div className="detail-booking-flow">
                        <div className="booking-intro">
                            <h3>Lease this piece</h3>
                            <div className="rate-indicator-minimal">
                                {painting.monthly_rate > 0 ? `₹${painting.monthly_rate}/month` : `₹${painting.hourly_rate}/hour`}
                            </div>
                        </div>

                        <div className="booking-form-minimal">
                            <div className="date-selection-row">
                                <div className="field-minimal">
                                    <label>Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                                <div className="field-minimal">
                                    <label>End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                            </div>

                            <div className="booking-summary-simple">
                                <div className="total-row-minimal">
                                    <span className="total-label">Subtotal Estimate</span>
                                    <span className="total-amount-bold">₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <button className="btn-lease-primary" onClick={handleLease} disabled={booking || totalPrice <= 0}>
                                    {booking ? (
                                        <IconLoader2 className="animate-spin" size={18} />
                                    ) : 'Inquire for Lease'}
                                </button>
                            </div>
                        </div>

                        <div className="setup-footer-minimal">
                            <IconCalendar size={14} />
                            <span>Professional installation and insurance included.</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
