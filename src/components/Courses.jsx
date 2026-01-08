import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCourses } from '../api_expanded';
import { Calendar, User } from 'lucide-react';

const Courses = ({ studentId }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        getCourses(studentId).then(setCourses);
    }, [studentId]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>My Courses</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your learning schedule and faculty interactions.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {courses.map(course => (
                        <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className="glass-card"
                            style={{
                                cursor: 'pointer',
                                borderColor: selectedCourse?.id === course.id ? 'var(--accent)' : 'var(--border)',
                                background: selectedCourse?.id === course.id ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)'
                            }}
                        >
                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{course.title}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                                {course.faculty_name}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Detail */}
                <div className="glass-card" style={{ minHeight: '400px' }}>
                    {selectedCourse ? (
                        <motion.div
                            key={selectedCourse.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedCourse.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{selectedCourse.description}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                                        <User size={20} /> <span style={{ fontWeight: 600 }}>Faculty</span>
                                    </div>
                                    <p style={{ fontSize: '1.2rem', margin: 0 }}>{selectedCourse.faculty_name}</p>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                                        <Calendar size={20} /> <span style={{ fontWeight: 600 }}>Schedule</span>
                                    </div>
                                    {Object.entries(selectedCourse.schedule || {}).map(([day, time]) => (
                                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>{day}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <h3>Course Content</h3>
                                {selectedCourse.content && selectedCourse.content.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                        {selectedCourse.content.map(item => (
                                            <div key={item.id} style={{
                                                padding: '1rem',
                                                borderLeft: `3px solid ${item.content_type === 'quiz' ? 'var(--warning)' : 'var(--success)'}`,
                                                background: `rgba(${item.content_type === 'quiz' ? '245, 158, 11' : '16, 185, 129'}, 0.1)`,
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <strong>{item.title}</strong>
                                                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', opacity: 0.7, textTransform: 'uppercase' }}>{item.content_type}</span>
                                                </div>
                                                {item.details?.due_date && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Due: {item.details.due_date}</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)' }}>No content available yet.</p>
                                )}
                            </div>

                        </motion.div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            Select a course to view details
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Courses;
