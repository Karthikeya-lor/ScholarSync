import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginStudent } from '../api_expanded';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [rollNo, setRollNo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const student = await loginStudent(rollNo);
            onLogin(student);
            navigate('/');
        } catch (err) {
            setError('Student not found. Try "123" (Demo).');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ width: '400px', textAlign: 'center' }}
            >
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Enter your Roll Number to access the portal.
                </p>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Roll No (e.g., 123)"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'white',
                            fontSize: '1rem',
                            marginBottom: '1rem',
                            boxSizing: 'border-box'
                        }}
                    />
                    {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Access Portal'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
