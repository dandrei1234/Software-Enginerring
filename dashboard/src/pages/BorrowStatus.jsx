import React, { useState, useEffect } from 'react';
import '../pages.css';

const BorrowStatus = ({ user }) => {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    if (user && user.userID) {
      fetch(`/api/rentals/${user.userID}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => setRentals(data))
        .catch(err => console.error("Failed to fetch borrow status:", err));
    }
  }, [user]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Returned': return { backgroundColor: '#f1f5f9', color: '#475569' };
      case 'Cancelled':
      case 'Rejected':
      case 'Overdue': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Pending':
      default: return { backgroundColor: '#fef3c7', color: '#d97706' };
    }
  };

  const handleCancel = (rentalID) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;

    fetch(`/api/rentals/${rentalID}/cancel`, {
      method: 'PUT',
      headers: { 
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userID: user.userID })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        setRentals(rentals.map(r => r.rentalID === rentalID ? { ...r, borrow_status: 'Cancelled' } : r));
      }
    })
    .catch(err => console.error("Cancel failed:", err));
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>My Borrow Status</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Equipment</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dates</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>You have no borrow requests yet.</td>
              </tr>
            ) : (
              rentals.map(rental => (
                <tr key={rental.rentalID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.875rem' }}>
                      {rental.equipment_name || 'Legacy Equipment'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                    {user?.fullname || 'Student'}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                    <div style={{ marginBottom: '4px' }}>Borrowed: {new Date(rental.request_date).toLocaleDateString()}</div>
                    <div>Due: {rental.due_date ? new Date(rental.due_date).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    {rental.borrow_status === 'Pending' ? (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', textTransform: 'none' }}>Waiting for Staff</span>
                    ) : (
                      rental.condition_status || 'N/A'
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      ...getStatusStyle(rental.borrow_status),
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {rental.borrow_status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {rental.borrow_status === 'Pending' && (
                      <button 
                        onClick={() => handleCancel(rental.rentalID)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fecaca',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca' }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2' }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BorrowStatus;
