'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    IconPalette,
    IconBuildingMonument,
    IconUsers,
    IconCalendar,
    IconMapPin,
    IconTicket,
    IconHeart,
    IconUser,
    IconChevronLeft,
    IconChevronRight
} from '@tabler/icons-react';
import Image from 'next/image';
import './UpcomingSection.css';

interface EventItem {
    id: string;
    title: string;
    dateStr: string;
    dateObj: Date;
    category: 'art-class' | 'exhibition' | 'meetup';
    description: string;
    image?: string;
    price?: string;
    duration?: number; // hours
}

// Calendar Setup
const UpcomingSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('all');
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 380; // Card width (340) + gap (16) approx
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    // ... events array ...

    const events: EventItem[] = [
        {
            id: '1',
            title: 'Oil Painting Masterclass',
            dateStr: 'Dec 24, 10:00 AM',
            dateObj: new Date(2024, 11, 24, 10, 0),
            category: 'art-class',
            description: 'Advanced oil painting techniques.',
            price: '₹1200',
            duration: 2
        },
        {
            id: '2',
            title: 'Modern Art Exhibition',
            dateStr: 'Dec 26, 11:00 AM',
            dateObj: new Date(2024, 11, 26, 11, 0),
            category: 'exhibition',
            description: 'Showcasing contemporary works.',
            price: 'Free',
            duration: 4
        },
        {
            id: '3',
            title: 'Artist Meetup: Bangalore',
            dateStr: 'Dec 28, 04:00 PM',
            dateObj: new Date(2024, 11, 28, 16, 0),
            category: 'meetup',
            description: 'Connect with fellow creators.',
            price: 'Free',
            duration: 1.5
        },
    ];


    return (
        <section id="upcoming-events" className="upcoming-section">
            <div className="section-header-row">
                <h2 className="section-title">Upcoming Events</h2>

                <div className="header-controls">
                    <div className="tabs-pill-container">
                        <button
                            className={`pill-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </button>
                        <button
                            className={`pill-tab ${activeTab === 'art-class' ? 'active' : ''}`}
                            onClick={() => setActiveTab('art-class')}
                        >
                            <IconPalette size={16} />
                            Classes
                        </button>
                        <button
                            className={`pill-tab ${activeTab === 'exhibition' ? 'active' : ''}`}
                            onClick={() => setActiveTab('exhibition')}
                        >
                            <IconBuildingMonument size={16} />
                            Exhibitions
                        </button>
                        <button
                            className={`pill-tab ${activeTab === 'meetup' ? 'active' : ''}`}
                            onClick={() => setActiveTab('meetup')}
                        >
                            <IconUsers size={16} />
                            Meetups
                        </button>
                    </div>

                    <div className="carousel-nav-buttons">
                        <button className="nav-btn" onClick={() => scroll('left')} aria-label="Scroll left">
                            <IconChevronLeft size={20} />
                        </button>
                        <button className="nav-btn" onClick={() => scroll('right')} aria-label="Scroll right">
                            <IconChevronRight size={20} />
                        </button>
                    </div>

                    <button
                        className="calendar-entry-btn"
                        onClick={() => router.push('/calendar')}
                    >
                        <IconCalendar size={18} />
                        <span>View Calendar</span>
                    </button>
                </div>
            </div>

            <div className="events-carousel-container">
                <div className="events-carousel" ref={scrollContainerRef}>
                    {events.filter(e => activeTab === 'all' || e.category === activeTab).map(event => (
                        <div key={event.id} className="event-card">
                            <div className="card-image-wrapper">
                                <Image
                                    src="/painting.png"
                                    alt={event.title}
                                    fill
                                    className="card-img"
                                />
                                <div className="date-badge">
                                    <span className="date-day">{event.dateObj.getDate()}</span>
                                    <span className="date-month">{event.dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                </div>
                                <button className="like-btn">
                                    <IconHeart size={18} />
                                </button>
                                <div className="going-avatars">
                                    <div className="avatar-stack">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="mini-avatar">
                                                <Image src={`/founder${i > 2 ? 1 : i}.png`} alt="User" width={24} height={24} />
                                            </div>
                                        ))}
                                        <div className="avatar-count">+1K Going</div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="category-tag">
                                    {event.category === 'art-class' && 'Art Class'}
                                    {event.category === 'exhibition' && 'Exhibition'}
                                    {event.category === 'meetup' && 'Meetup'}
                                </div>
                                <h3 className="card-title">{event.title}</h3>

                                <div className="card-meta-list">
                                    <div className="meta-item">
                                        <IconMapPin size={16} className="meta-icon" />
                                        <span>Central Park, New York City</span>
                                    </div>
                                    <div className="meta-item">
                                        <IconCalendar size={16} className="meta-icon" />
                                        <span>{event.dateStr}</span>
                                    </div>
                                    <div className="meta-item">
                                        <IconTicket size={16} className="meta-icon" />
                                        <span>From {event.price}</span>
                                    </div>
                                    <div className="meta-item">
                                        <IconUser size={16} className="meta-icon" />
                                        <span>By World Fusion Events</span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button className="btn-primary">Buy Tickets</button>
                                    <button className="btn-secondary">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingSection;
