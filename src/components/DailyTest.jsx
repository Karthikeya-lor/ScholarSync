import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDailyTest, submitTest } from '../api_expanded';

const DailyTest = ({ studentId }) => {
    const [test, setTest] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTest();
    }, []);

    const loadTest = async () => {
        try {
            const data = await getDailyTest();
            setTest(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption === null) return;

        const correct = selectedOption === test.correct_option;
        setIsCorrect(correct);
        setSubmitted(true);

        try {
            // Submit as Learning Event to update Streak
            await submitTest({
                student_id: studentId,
                date: new Date().toISOString().split('T')[0],
                activity_type: "test",
                topic: "Daily Quiz",
                score: correct ? 100 : 0,
                time_spent: 5, // constant 5 mins for daily test
                attempt_number: 1
            });
        } catch (e) {
            console.error("Failed to submit result", e);
        }
    };

    if (loading) return <div>Loading Test...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>Daily Knowledge Check</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Keep your streak alive! Complete this test before midnight.</p>
            </header>

            <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {!submitted ? (
                    <>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                            <span style={{ color: 'var(--accent)' }}>Q:</span> {test.question}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {test.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedOption(idx)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: selectedOption === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                                        background: selectedOption === idx ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                        color: 'var(--text-primary)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn"
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            style={{ width: '100%', opacity: selectedOption === null ? 0.5 : 1 }}
                        >
                            Submit Answer
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            style={{ fontSize: '4rem', marginBottom: '1rem' }}
                        >
                            {isCorrect ? '🎉' : '📚'}
                        </motion.div>
                        <h2>{isCorrect ? 'Excellent Work!' : 'Keep Learning!'}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            {isCorrect ? 'Your streak has been updated.' : 'Good attempt. Review the topic and try again tomorrow.'}
                        </p>
                        <button className="btn" onClick={() => window.location.href = '/'}>
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DailyTest;
