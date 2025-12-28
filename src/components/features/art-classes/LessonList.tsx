'use client';

import { useState, useEffect } from 'react';
import './LessonList.css';
import { IconArrowUpRight, IconVideo } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedImageUrl } from '@/utils/image-optimization';
import Link from 'next/link';

interface Registration {
    id: string;
    art_classes: {
        id: string;
        title: string;
        thumbnail_url: string;
        art_class_categories: {
            name: string;
        }
    };
    next_session?: {
        id: string;
        session_title: string;
        session_date: string;
        session_time: string;
        session_link: string;
    };
}

const LessonList: React.FC = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRegistrations();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchRegistrations = async () => {
        try {
            const response = await fetch('/api/user/registrations');
            const data = await response.json();
            if (response.ok) {
                setRegistrations(data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="lesson-section"><p>Loading your classes...</p></div>;
    if (!user) return null;

    return (
        <section className="lesson-section">
            <div className="section-header">
                <h2 className="section-title">Your Enrolled Classes</h2>
                <Link href="/art-classes" className="see-all">Browse More</Link>
            </div>

            <div className="lesson-table-container">
                <table className="lesson-table">
                    <thead>
                        <tr>
                            <th>CLASS</th>
                            <th>CATEGORY</th>
                            <th>UPCOMING SESSION</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    You haven't enrolled in any art classes yet.
                                </td>
                            </tr>
                        ) : (
                            registrations.map((reg) => (
                                <tr key={reg.id}>
                                    <td>
                                        <div className="mentor-cell">
                                            <img
                                                src={getOptimizedImageUrl(reg.art_classes.thumbnail_url || '/painting.png', { width: 100, format: 'webp' })}
                                                alt={reg.art_classes.title}
                                                className="table-avatar"
                                            />
                                            <div className="mentor-table-info">
                                                <span className="mentor-table-name">{reg.art_classes.title}</span>
                                                {reg.next_session && (
                                                    <span className="mentor-table-date">
                                                        Next: {new Date(reg.next_session.session_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="type-badge">
                                            {reg.art_classes.art_class_categories?.name}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="desc-text">
                                            {reg.next_session ? (
                                                `${reg.next_session.session_title} (${reg.next_session.session_time})`
                                            ) : (
                                                'No upcoming sessions'
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        {reg.next_session?.session_link ? (
                                            <a
                                                href={reg.next_session.session_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="action-btn join"
                                                title="Join Live Session"
                                            >
                                                <IconVideo size={18} />
                                            </a>
                                        ) : (
                                            <Link href={`/art-classes/${reg.art_classes.id}`} className="action-btn">
                                                <IconArrowUpRight size={18} />
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default LessonList;
