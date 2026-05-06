import React, { useState, useEffect } from 'react';
import '../pages.css';

const AccountRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/password-reset-requests', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reset requests:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = (requestID, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this password reset request?`)) return;

    fetch(`/api/password-reset-requests/${requestID}/${action}`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userID: user.userID })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        fetchRequests();
      })
      .catch(err => {
        console.error(`Failed to ${action} request:`, err);
        alert(`Failed to ${action} request`);
      });
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <h3>Password Reset Requests</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
        Students requesting to change their passwords. Verify their identity before approving.
      </p>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Request Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No pending requests.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.requestID}>
                  <td>{req.fullname}</td>
                  <td>{req.email}</td>
                  <td>{new Date(req.request_date).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(req.requestID, 'approve')}
                        style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px', backgroundColor: '#22c55e', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.requestID, 'reject')}
                        style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
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

export default AccountRequests;
