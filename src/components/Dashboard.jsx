import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';
import { getAnalysis } from '../api_expanded';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, ShieldCheck, TrendingUp, AlertCircle, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = ({ studentId }) => {
    const [data, setData] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stats, analysisData] = await Promise.all([
                    getDashboardStats(studentId),
                    getAnalysis(studentId)
                ]);
                setData(stats.data);
                setAnalysis(analysisData);
            } catch (err) {
                setError("Failed to load dashboard data. Ensure backend is running.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const streak = data?.streak || { current_streak: 0, is_active: false };
    const confidence = data?.confidence_level || 'Low';
    const chartData = data?.daily_progress.map(d => ({
        date: d.date,
        score: d.progress_score,
    })) || [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>Performance Overview</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Good Afternoon, {data?.student?.name || "Student"}</p>
            </header>

            <div className="grid-dashboard">
                {/* Streak Card */}
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TrendingUp size={20} color="var(--accent)" />
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Current Streak</h2>
                    </div>
                    <div className="stat-value">{streak.current_streak} <span style={{ fontSize: '1rem' }}>days</span></div>
                    <div className="stat-label">
                        {streak.is_active ?
                            <span style={{ color: 'var(--success)' }}>Active Today</span> :
                            <span style={{ color: 'var(--text-secondary)' }}>Inactive Today</span>
                        }
                    </div>
                </div>

                {/* Confidence Engine */}
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={20} color="var(--accent)" />
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Confidence</h2>
                    </div>
                    <div className={`confidence-badge conf-${confidence}`} style={{ marginBottom: '1rem' }}>
                        {confidence}
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>{data?.confidence_reason}</p>
                </div>

                {/* AI Analysis */}
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <BrainCircuit size={20} color="var(--accent)" />
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>AI Insights</h2>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--success)' }}>Strong Areas:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                {analysis?.strong_topics.length > 0 ? analysis.strong_topics.map(t => (
                                    <span key={t} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>
                                )) : <span style={{ color: 'var(--text-secondary)' }}>Keep practicing!</span>}
                            </div>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--danger)' }}>Focus Needed:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                {analysis?.weak_topics.length > 0 ? analysis.weak_topics.map(t => (
                                    <span key={t} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>
                                )) : <span style={{ color: 'var(--text-secondary)' }}>Doing great!</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Chart */}
                <div className="glass-card">
                    <h2>Daily Progress</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                            <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie */}
                <div className="glass-card">
                    <h2>Activity Mix</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data?.activity_distribution || []} dataKey="count" nameKey="activity_type" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8">
                                {(data?.activity_distribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
