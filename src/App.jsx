import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import DailyTest from './components/DailyTest';
import Rewards from './components/Rewards';
import { getDashboardStats } from './api';

function App() {
  const [student, setStudent] = useState(null);

  // Auto-login as demo student for hackathon demo
  useEffect(() => {
    // Simulate fetching "123" details immediately
    import('./api_expanded').then(({ loginStudent }) => {
      loginStudent("123").then(setStudent).catch(console.error);
    });
  }, []);

  if (!student) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading Portal...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout studentName={student.name} />}>
          <Route index element={<Dashboard studentId={student.id} />} />
          <Route path="courses" element={<Courses studentId={student.id} />} />
          <Route path="test" element={<DailyTest studentId={student.id} />} />
          <Route path="rewards" element={<RewardsWrapper studentId={student.id} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper to fetch data for Rewards specifically
const RewardsWrapper = ({ studentId }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    getDashboardStats(studentId).then(res => setData(res.data));
  }, [studentId]);

  if (!data) return <div>Loading...</div>;
  return <Rewards dashboardData={data} />;
};

export default App;
