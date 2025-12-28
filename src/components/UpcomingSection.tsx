'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    IconCalendar,
    IconClock,
    IconMapPin,
    IconTicket,
    IconSchool,
    IconBrush,
    IconChevronRight,
    IconChevronLeft,
    IconLoader2
} from '@tabler/icons-react';
import Link from 'next/link';
import './UpcomingSection.css';
import { supabase } from '@/utils/supabase';

type TabType = 'tattoos' | 'events' | 'classes';

interface UpcomingItem {
    id: string;
    title: string;
    image: string;
    date: string;
    time?: string;
    location?: string;
    type: string;
    isRegistered: boolean;
    link: string;
}

export default function UpcomingSection() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('events');
    const [loading, setLoading] = useState<{ [key in TabType]: boolean }>({
        tattoos: true,
        events: true,
        classes: true
    });
    const [items, setItems] = useState<{ [key in TabType]: UpcomingItem[] }>({
        tattoos: [],
        events: [],
        classes: []
    });

    const currentItems = items[activeTab] || [];

    const carouselRef = useRef<HTMLDivElement>(null);
    const [showArrows, setShowArrows] = useState({ left: false, right: false });

    const checkScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setShowArrows({
                left: scrollLeft > 10,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const { scrollLeft, clientWidth } = carouselRef.current;
            const scrollAmount = clientWidth * 0.8;
            carouselRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (user) {
            fetchAllData();
        } else {
            setLoading({ tattoos: false, events: false, classes: false });
        }
    }, [user]);

    useEffect(() => {
        if (!loading[activeTab] && currentItems.length > 0) {
            // Wait for render
            setTimeout(checkScroll, 100);
        }
    }, [loading, activeTab, items]);

    // Re-check on window resize
    useEffect(() => {
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const fetchAllData = async () => {
        // Fetch everything in parallel but let them update state independently
        fetchTattoos();
        fetchEvents();
        fetchClasses();
    };

    const fetchTattoos = async () => {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            const filtered = data.filter((b: any) => {
                const bookingDate = new Date(b.booking_date);
                return bookingDate >= new Date() && b.status !== 'cancelled';
            }).map((b: any) => ({
                id: b.id,
                title: b.tattoo_designs?.name || 'Tattoo Session',
                image: b.tattoo_designs?.image_url || '/painting.png',
                date: b.booking_date,
                time: b.booking_time,
                type: 'Booking',
                isRegistered: true,
                link: `/tattoos/${b.tattoo_designs?.id}`
            }));
            setItems(prev => ({ ...prev, tattoos: filtered }));
        } catch (error) {
            console.error('Error fetching tattoos:', error);
        } finally {
            setLoading(prev => ({ ...prev, tattoos: false }));
        }
    };

    const fetchEvents = async () => {
        try {
            // 1. Fetch user's registrations
            const { data: registrations } = await supabase
                .from('event_registrations')
                .select('event_id, events(*)')
                .eq('user_id', user?.id);

            const registeredIds = (registrations || []).map(r => r.event_id).filter(Boolean);
            const registeredItems = (registrations || []).map((r: any) => {
                const event = Array.isArray(r.events) ? r.events[0] : r.events;
                if (!event) return null;
                return {
                    id: event.id,
                    title: event.title,
                    image: event.image_url,
                    date: event.start_date,
                    time: new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: event.location,
                    type: 'Registered',
                    isRegistered: true,
                    link: `/events/${event.id}`
                };
            }).filter(Boolean) as UpcomingItem[];

            // 2. Fetch available upcoming events (excluding already registered)
            let query = supabase
                .from('events')
                .select('*')
                .eq('status', 'published')
                .gte('start_date', new Date().toISOString())
                .limit(5);

            if (registeredIds.length > 0) {
                query = query.not('id', 'in', `(${registeredIds.join(',')})`);
            }

            const { data: availableEvents } = await query;

            const availableItems = (availableEvents || []).map(e => ({
                id: e.id,
                title: e.title,
                image: e.image_url,
                date: e.start_date,
                time: new Date(e.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: e.location,
                type: 'Upcoming',
                isRegistered: false,
                link: `/events/${e.id}`
            }));

            setItems(prev => ({ ...prev, events: [...registeredItems, ...availableItems] }));
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(prev => ({ ...prev, events: false }));
        }
    };

    const fetchClasses = async () => {
        try {
            // 1. Fetch user's enrolled classes
            const response = await fetch('/api/user/registrations');
            const enrolledData = await response.json();

            const enrolledIds = (enrolledData || []).map((r: any) => r.art_classes?.id).filter(Boolean);
            const enrolledItems = (enrolledData || []).map((r: any) => ({
                id: r.art_classes?.id,
                title: r.art_classes?.title,
                image: r.art_classes?.thumbnail_url,
                date: r.next_session?.session_date || '',
                time: r.next_session?.session_time || '',
                type: 'Enrolled',
                isRegistered: true,
                link: `/art-classes/${r.art_classes?.id}`
            }));

            // 2. Fetch available classes
            let query = supabase
                .from('art_classes')
                .select('*')
                .eq('status', 'published')
                .limit(5);

            if (enrolledIds.length > 0) {
                query = query.not('id', 'in', `(${enrolledIds.join(',')})`);
            }

            const { data: availableClasses } = await query;

            const availableItems = (availableClasses || []).map(c => ({
                id: c.id,
                title: c.title,
                image: c.thumbnail_url,
                date: 'Ongoing',
                type: 'Available',
                isRegistered: false,
                link: `/art-classes/${c.id}`
            }));

            setItems(prev => ({ ...prev, classes: [...enrolledItems, ...availableItems] }));
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(prev => ({ ...prev, classes: false }));
        }
    };


    if (!user) return null;

    return (
        <section className="upcoming-section">
            <div className="upcoming-header">
                <h2>Upcoming For You</h2>
                <div className="tab-bar">
                    <button
                        className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        <IconTicket size={18} />
                        Events
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('classes')}
                    >
                        <IconSchool size={18} />
                        Classes
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'tattoos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tattoos')}
                    >
                        <IconBrush size={18} />
                        Tattoos
                    </button>
                </div>
            </div>

            <div className="upcoming-content">
                {loading[activeTab] ? (
                    <div className="loading-placeholder">
                        <IconLoader2 className="animate-spin" size={32} />
                        <p>Updating your {activeTab}...</p>
                    </div>
                ) : currentItems.length === 0 ? (
                    <div className="empty-state">
                        <IconCalendar size={48} />
                        <p>No upcoming {activeTab} found.</p>
                        <Link href={`/${activeTab === 'tattoos' ? 'tattoos' : activeTab === 'events' ? 'events' : 'art-classes'}`} className="explore-btn">
                            Explore {activeTab}
                        </Link>
                    </div>
                ) : (
                    <div className="carousel-container">
                        {showArrows.left && (
                            <button className="nav-btn left" onClick={() => scroll('left')} aria-label="Scroll left">
                                <IconChevronLeft size={20} />
                            </button>
                        )}

                        <div className="upcoming-grid carousel-grid" ref={carouselRef} onScroll={checkScroll}>
                            {currentItems.map(item => (
                                <Link href={item.link} key={`${item.id}-${item.type}`} className={`upcoming-card ${item.isRegistered ? 'registered' : ''}`}>
                                    <div className="card-image">
                                        <img src={item.image || '/painting.png'} alt={item.title} />
                                        <span className={`status-badge ${item.type.toLowerCase()}`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="card-info">
                                        <h3>{item.title}</h3>
                                        <div className="info-meta">
                                            <div className="meta-item">
                                                <IconCalendar size={14} />
                                                <span>{item.date === 'Ongoing' ? 'Ongoing' : new Date(item.date).toLocaleDateString()}</span>
                                            </div>
                                            {item.time && (
                                                <div className="meta-item">
                                                    <IconClock size={14} />
                                                    <span>{item.time}</span>
                                                </div>
                                            )}
                                            {item.location && (
                                                <div className="meta-item">
                                                    <IconMapPin size={14} />
                                                    <span>{item.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-action">
                                            <span>{item.isRegistered ? 'View Details' : 'Book Now'}</span>
                                            <IconChevronRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {showArrows.right && (
                            <button className="nav-btn right" onClick={() => scroll('right')} aria-label="Scroll right">
                                <IconChevronRight size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="section-footer">
                <Link href={`/${activeTab === 'tattoos' ? 'tattoos' : activeTab === 'events' ? 'events' : 'art-classes'}`} className="view-all-link">
                    View All {activeTab}
                    <IconChevronRight size={16} />
                </Link>
            </div>
        </section>
    );
}
