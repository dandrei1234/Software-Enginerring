import React, { useState, useEffect } from 'react';
import '../pages.css';

const Rentals = ({ user }) => {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    fetch('/api/rentals', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setRentals(data))
      .catch(err => console.error("Failed to fetch rentals:", err));
  }, []);

  const handleUpdateStatus = (rentalID, newStatus) => {
    fetch(`/api/rentals/${rentalID}/status`, {
      method: 'PUT',
      headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, userID: user?.userID })
    })
    .then(res => res.json())
    .then(data => {
      setRentals(rentals.map(r => r.rentalID === rentalID ? { ...r, borrow_status: newStatus } : r));
    })
    .catch(err => console.error("Update failed:", err));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-badge status-available';
      case 'Returned': return 'status-badge' // simple grey wrapper natively rendered without deep styles
      case 'Overdue':
      case 'Rejected': return 'status-badge status-borrowed';
      case 'Pending':
      default: return 'status-badge status-borrowed'; // Using yellow overlay natively
    }
  };

  return (
    <div>
      <h2>Manage Rentals</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Equipment</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Returned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No rentals found.</td>
              </tr>
            ) : (
              rentals.map(rental => (
                <tr key={rental.rentalID}>
                  <td>{rental.rentalID}</td>
                  <td>{rental.student_name}</td>
                  <td>{rental.equipment_name || 'Legacy Item'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{rental.condition_status || 'N/A'}</td>
                  <td>
                    <span 
                      className={getStatusClass(rental.borrow_status)}
                      style={
                        rental.borrow_status === 'Pending' ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308' } : 
                        rental.borrow_status === 'Overdue' ? { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px' } : {}
                      }
                    >
                      {rental.borrow_status}
                    </span>
                  </td>
                  <td>{new Date(rental.request_date).toLocaleDateString()}</td>
                  <td>{rental.due_date ? new Date(rental.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{rental.return_date ? new Date(rental.return_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {rental.borrow_status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleUpdateStatus(rental.rentalID, 'Approved')}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--success-color)', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(rental.rentalID, 'Rejected')}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--danger-color)', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {rental.borrow_status === 'Approved' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleUpdateStatus(rental.rentalID, 'Returned')}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Mark Returned
                        </button>
                      </div>
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

export default Rentals;
