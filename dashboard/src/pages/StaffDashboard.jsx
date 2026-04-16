import React, { useState, useEffect } from 'react';
import '../pages.css';
import AddEquipment from '../components/AddEquipment';

const StaffDashboard = () => {
  const [rentals, setRentals] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);

  const fetchDashboardData = () => {
    // Fetch Rentals
    fetch('/api/rentals', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setRentals(data))
      .catch(err => console.error("Failed to fetch rentals:", err));

    // Fetch Equipments
    fetch('/api/equipment', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setEquipments(data))
      .catch(err => console.error("Failed to fetch equipments:", err));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeCount = rentals.filter(r => r.borrow_status !== 'Returned' && r.borrow_status !== 'Rejected').length;
  const pendingCount = rentals.filter(r => r.borrow_status === 'Pending').length;
  const overdueCount = rentals.filter(r => r.borrow_status === 'Overdue').length;
  const totalEquipments = equipments.reduce((sum, current) => sum + (current.available_quantity || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Staff Dashboard</h2>
        <button className="btn-primary" onClick={() => setIsAddEquipmentOpen(true)}>
          + Add Equipment
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Equipment</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-color)' }}>{totalEquipments}</p>
          <p>Total items available in the catalog.</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Active Rentals</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-color)' }}>{activeCount}</p>
          <p>Currently out or pending tracking.</p>
        </div>
        <div className="dashboard-card">
          <h3>Pending Requests</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success-color)' }}>{pendingCount}</p>
          <p>Require your approval to proceed.</p>
        </div>
        <div className="dashboard-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3>Overdue Items</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ef4444' }}>{overdueCount}</p>
          <p>Items not returned on time.</p>
        </div>
      </div>

      <AddEquipment
        open={isAddEquipmentOpen}
        onClose={() => setIsAddEquipmentOpen(false)}
        onEquipmentAdded={fetchDashboardData}
      />
    </div>
  );
};

export default StaffDashboard;
