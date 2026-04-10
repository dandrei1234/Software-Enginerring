import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages.css';
import Borrow from '../components/Borrow';

const StudentDashboard = ({ user }) => {
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.userID) {
      fetch(`/api/rentals/${user.userID}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          const count = data.filter(r => r.borrow_status === 'Overdue').length;
          setOverdueCount(count);
        })
        .catch(err => console.error("Failed to fetch borrow status:", err));
    }
  }, [user]);

  return (
    <div>
      <h2>Student Dashboard</h2>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Need new equipment?</h3>
          <p>Browse our catalog and request items for your activities.</p>
          <button className="btn-primary" onClick={() => setIsBorrowOpen(true)}>
            Borrow Equipment
          </button>
        </div>
        <div className="dashboard-card">
          <h3>My Borrowed Items</h3>
          <p>You have items currently checked out or pending.</p>
          <button className="btn-primary" onClick={() => navigate('/borrow-status')}>View Status</button>
        </div>
        <div className="dashboard-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3>Overdue Items</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ef4444' }}>{overdueCount}</p>
          <p>Please return these items immediately.</p>
        </div>
      </div>

      <Borrow 
        open={isBorrowOpen} 
        onClose={() => setIsBorrowOpen(false)} 
        user={user} 
      />
    </div>
  );
};

export default StudentDashboard;
