import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PenTool, Trophy, LogOut } from 'lucide-react';

const Layout = ({ studentName }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        window.location.reload(); // Simple logout for hackathon
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
        { path: '/test', label: 'Daily Test', icon: <PenTool size={20} /> },
        { path: '/rewards', label: 'Rewards', icon: <Trophy size={20} /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <nav style={{
                width: '260px',
                borderRight: '1px solid var(--border)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(15, 23, 42, 0.5)'
            }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent)' }}>Build2Break</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>EdTech Portal</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                background: isActive ? 'var(--accent)' : 'transparent',
                                fontWeight: isActive ? 600 : 400,
                                transition: 'all 0.2s'
                            })}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>
                            {studentName?.[0]}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{studentName}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Student</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--danger)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
