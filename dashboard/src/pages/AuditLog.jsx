import React, { useState, useEffect } from 'react';
import '../pages.css';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/audit-logs', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Failed to fetch audit logs:", err));
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.fullname || 'System').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>System Audit Logs</h2>
        <input 
          type="text" 
          placeholder="Search logs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-dark)', color: 'var(--text-light)', width: '250px' }}
        />
      </div>
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
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No logs found.</td>
              </tr>
            ) : (
              filteredLogs.map(log => (
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
