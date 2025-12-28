'use client';
import { useState } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

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
const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
    // Default view to week for better visibility similar to design ref
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date(2024, 11, 24)); // Set to our dummy data range

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
        {
            id: '4',
            title: 'Digital Art Workshop',
            dateStr: 'Jan 05, 02:00 PM',
            dateObj: new Date(2025, 0, 5, 14, 0),
            category: 'art-class',
            description: 'Digital painting with Procreate.',
            price: '₹800',
            duration: 3
        },
        {
            id: '5',
            title: 'Sculpture Gallery Opening',
            dateStr: 'Jan 10, 06:00 PM',
            dateObj: new Date(2025, 0, 10, 18, 0),
            category: 'exhibition',
            description: 'Kinetic sculpture wing opening.',
            price: 'Invite',
            duration: 3
        },
        {
            id: '6',
            title: 'NFT Creator Talk',
            dateStr: 'Dec 30, 07:00 PM',
            dateObj: new Date(2024, 11, 30, 19, 0),
            category: 'meetup',
            description: 'Strategies for NFT marketing.',
            price: 'Free',
            duration: 1.5
        }
    ];

    // Transform events for react-big-calendar
    const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.dateObj,
        end: new Date(event.dateObj.getTime() + (event.duration || 1) * 60 * 60 * 1000), // Calculate end time
        resource: event
    }));

    interface CalendarEvent {
        id: string;
        title: string;
        start: Date;
        end: Date;
        resource: EventItem;
    }

    const eventStyleGetter = (event: CalendarEvent) => {
        const category = event.resource.category;
        return {
            className: `rbc-event-${category}`
        };
    };

    return (
        <section className="calendar-view-section">
            <div className="scheduler-container">
                <div className="scheduler-header">
                    <h2 className="scheduler-title">Calendar</h2>
                </div>

                <div className="rbc-wrapper-custom">
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        step={60}
                        showMultiDayTimes
                        eventPropGetter={eventStyleGetter}
                    />
                </div>
            </div>
        </section>
    );
};

export default CalendarView;
