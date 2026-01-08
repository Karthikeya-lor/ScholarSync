import React from 'react';
import { motion } from 'framer-motion';

const Rewards = ({ dashboardData }) => {
    const pieces = dashboardData?.reward?.puzzle_pieces || 0;
    const badges = dashboardData?.reward?.badges_unlocked || [];

    // Grid of 30 pieces for the month
    const totalPieces = 30;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>Rewards & Achievements</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Collect pieces by maintaining your streak!</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Puzzle Board */}
                <div className="glass-card">
                    <h2>Mystery Puzzle</h2>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Collected: {pieces} / {totalPieces} pieces
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '4px',
                        aspectRatio: '1/1',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '1rem',
                        borderRadius: '12px'
                    }}>
                        {[...Array(totalPieces)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                style={{
                                    borderRadius: '4px',
                                    background: i < pieces ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                    border: i < pieces ? 'none' : '1px dashed rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {i < pieces && "🧩"}
                            </motion.div>
                        ))}
                    </div>
                    {pieces >= totalPieces && (
                        <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--success)' }}>
                            <h3>🎉 Puzzle Complete! Reward Unlocked!</h3>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="glass-card">
                    <h2>Your Collection</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                        {badges.length > 0 ? badges.map((badge, idx) => (
                            <div key={idx} style={{
                                padding: '1rem', borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                border: '1px solid var(--border)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                                <div style={{ fontWeight: 600 }}>{badge}</div>
                            </div>
                        )) : (
                            <p style={{ color: 'var(--text-secondary)' }}>No badges yet. Keep studying!</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Rewards;
