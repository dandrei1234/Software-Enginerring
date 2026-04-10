import React, { useState, useEffect } from 'react';
import '../pages.css';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/audit-logs', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Failed to fetch audit logs:", err));
  }, []);

  return (
    <div>
      <h2>System Audit Logs</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>User</th>
              <th>Action Type</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No logs found.</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.logID}>
                  <td>{log.logID}</td>
                  <td style={{ fontWeight: 600 }}>{log.fullname || 'System'}</td>
                  <td><span className="status-badge" style={{backgroundColor: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-color)'}}>{log.action_type}</span></td>
                  <td style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.action_details}>
                    {log.action_details}
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
