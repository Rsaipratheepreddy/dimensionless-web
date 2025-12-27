'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
    IconSearch,
    IconCalendarEvent,
    IconFilter,
    IconTrophy,
    IconShare,
    IconMapPin,
    IconClock
} from '@tabler/icons-react';
import Link from 'next/link';
import './page.css';
import { toast } from 'react-hot-toast';
import LottieLoader from '@/components/LottieLoader';
import { supabase } from '@/utils/supabase';

interface Event {
    id: string;
    title: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
    location: string;
    price: number;
    type: 'event' | 'competition';
    category_name: string;
    is_online: boolean;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'event' | 'competition'>('all');
    const [selectedPricing, setSelectedPricing] = useState<string>('all');
    const [banner, setBanner] = useState<any>(null);

    useEffect(() => {
        fetchEvents();
        fetchBanner();
    }, [activeTab, selectedPricing]);

    const fetchBanner = async () => {
        try {
            const { data, error } = await supabase.from('home_config').select('*').eq('id', 'events_banner').single();
            if (error) {
                console.warn('Events banner fetch notice:', error.message || error);
                return;
            }
            if (data) setBanner(data);
        } catch (error) {
            console.error('Unexpected error fetching events banner:', error);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('events')
                .select(`
                    *,
                    category:event_categories(name)
                `)
                .eq('status', 'published')
                .order('start_date', { ascending: true });

            if (activeTab !== 'all') {
                query = query.eq('type', activeTab);
            }

            if (selectedPricing === 'free') {
                query = query.eq('price', 0);
            } else if (selectedPricing === 'paid') {
                query = query.gt('price', 0);
            }

            const { data, error } = await query;

            if (error) throw error;

            const formattedData = (data || []).map((e: any) => ({
                ...e,
                category_name: e.category?.name || 'General'
            }));

            setEvents(formattedData);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleShare = (id: string) => {
        const url = `${window.location.origin}/events/${id}`;
        navigator.clipboard.writeText(url);
        toast.success('Invite link copied to clipboard!');
    };

    return (
        <AppLayout>
            <div className="events-discovery-page">
                <header className="events-hero" style={banner?.image_url ? { backgroundImage: `url(${banner.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    <div className="hero-badge">{banner?.title || 'Events & Competitions'}</div>
                    <h1>{banner?.config_data?.hero_title || 'Unite, Compete, and Grow'}</h1>
                    <p>{banner?.description || 'Join the most exciting events and creative competitions in the community.'}</p>
                </header>

                <div className="discovery-controls">
                    <div className="tabs-row">
                        <div className="type-tabs">
                            <button
                                className={activeTab === 'all' ? 'active' : ''}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </button>
                            <button
                                className={activeTab === 'event' ? 'active' : ''}
                                onClick={() => setActiveTab('event')}
                            >
                                Events
                            </button>
                            <button
                                className={activeTab === 'competition' ? 'active' : ''}
                                onClick={() => setActiveTab('competition')}
                            >
                                Competitions
                            </button>
                        </div>

                        <div className="pricing-filters">
                            <button
                                className={selectedPricing === 'all' ? 'active' : ''}
                                onClick={() => setSelectedPricing('all')}
                            >
                                All Prices
                            </button>
                            <button
                                className={selectedPricing === 'free' ? 'active' : ''}
                                onClick={() => setSelectedPricing('free')}
                            >
                                Free
                            </button>
                            <button
                                className={selectedPricing === 'paid' ? 'active' : ''}
                                onClick={() => setSelectedPricing('paid')}
                            >
                                Paid
                            </button>
                        </div>
                    </div>

                    <div className="search-row">
                        <div className="search-input-wrapper">
                            <IconSearch size={22} />
                            <input
                                type="text"
                                placeholder="Search events or competitions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <LottieLoader />
                    </div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.length === 0 ? (
                            <div className="no-results">
                                <IconCalendarEvent size={48} />
                                <p>No events found. Be the first to know when new events are added!</p>
                            </div>
                        ) : (
                            filteredEvents.map(event => (
                                <div className="event-card" key={event.id}>
                                    <div className="event-card-image">
                                        <img src={event.image_url || '/painting.png'} alt={event.title} />
                                        <div className={`event-category-badge ${event.is_online ? 'online' : ''}`}>
                                            {event.type === 'competition' ? 'COMPETITION' : 'EVENT'}
                                            {event.is_online && <span className="online-indicator"> • ONLINE</span>}
                                        </div>
                                    </div>
                                    <div className="event-card-content">
                                        <h3 className="event-title">{event.title}</h3>

                                        <div className="card-content-divider" />

                                        <div className="event-info-row">
                                            <div className="event-date-block">
                                                <span className="date-day">{new Date(event.start_date).getDate()}</span>
                                                <span className="date-month">{new Date(event.start_date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span>
                                            </div>

                                            <div className="event-details-block">
                                                <div className="detail-line">
                                                    <IconMapPin size={18} />
                                                    <span>{event.is_online ? 'Online' : (event.location || 'Location TBA')}</span>
                                                </div>
                                                <div className="detail-line">
                                                    <IconClock size={18} />
                                                    <span>{new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="event-card-footer">
                                        <Link href={`/events/${event.id}`} className="buy-ticket-btn">
                                            Buy Ticket
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
