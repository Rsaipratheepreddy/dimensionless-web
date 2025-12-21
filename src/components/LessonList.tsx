'use client';
import './LessonList.css';
import { IconArrowUpRight } from '@tabler/icons-react';

const LessonList: React.FC = () => {
    const lessons = [
        {
            mentor: "Padhang Satrio",
            avatar: "/founder1.png",
            type: "UI/UX DESIGN",
            desc: "Understand Of UI/UX Design",
            date: "2/16/2004",
            color: "#6366f1"
        },
        {
            mentor: "Bayu Saito",
            avatar: "/founder2.png",
            type: "BRANDING",
            desc: "Advanced Branding Strategy",
            date: "3/20/2004",
            color: "#ec4899"
        }
    ];

    return (
        <section className="lesson-section">
            <div className="section-header">
                <h2 className="section-title">Your Lesson</h2>
                <a href="#" className="see-all">See all</a>
            </div>

            <div className="lesson-table-container">
                <table className="lesson-table">
                    <thead>
                        <tr>
                            <th>MENTOR</th>
                            <th>TYPE</th>
                            <th>DESC</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map((lesson, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="mentor-cell">
                                        <img src={lesson.avatar} alt={lesson.mentor} className="table-avatar" />
                                        <div className="mentor-table-info">
                                            <span className="mentor-table-name">{lesson.mentor}</span>
                                            <span className="mentor-table-date">{lesson.date}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="type-badge" style={{ backgroundColor: lesson.color + '15', color: lesson.color }}>
                                        {lesson.type}
                                    </span>
                                </td>
                                <td>
                                    <span className="desc-text">{lesson.desc}</span>
                                </td>
                                <td>
                                    <button className="action-btn">
                                        <IconArrowUpRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default LessonList;
