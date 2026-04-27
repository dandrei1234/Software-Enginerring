import React, { useState, useEffect } from 'react';
import '../pages.css';
import AddEquipment from '../components/AddEquipment';

const StaffDashboard = () => {
  const [rentals, setRentals] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [editingItemID, setEditingItemID] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(null);

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

  const handleEditQuantity = (itemID, currentQuantity) => {
    setEditingItemID(itemID);
    setEditingQuantity(currentQuantity);
  };

  const handleSaveQuantity = (itemID) => {
    if (editingQuantity === null || editingQuantity < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    fetch(`/api/equipment/${itemID}/quantity`, {
      method: 'PUT',
      headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_quantity: parseInt(editingQuantity) })
    })
    .then(res => res.json())
    .then(data => {
      setEquipments(equipments.map(eq => 
        eq.itemID === itemID ? { ...eq, total_quantity: parseInt(editingQuantity), available_quantity: data.available_quantity } : eq
      ));
      setEditingItemID(null);
      setEditingQuantity(null);
    })
    .catch(err => {
      console.error("Failed to update quantity:", err);
      alert('Failed to update quantity');
    });
  };

  const handleCancelEdit = () => {
    setEditingItemID(null);
    setEditingQuantity(null);
  };

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

      <h3 style={{ marginTop: '32px' }}>Equipment Inventory</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment Name</th>
              <th>Category</th>
              <th>Total Quantity</th>
              <th>Available</th>
              <th>Borrowed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No equipment found. Add equipment to get started.</td>
              </tr>
            ) : (
              equipments.map(eq => {
                const borrowed = (eq.total_quantity || 0) - (eq.available_quantity || 0);
                return (
                  <tr key={eq.itemID}>
                    <td>{eq.equipment_name}</td>
                    <td>{eq.category_name || 'N/A'}</td>
                    <td>
                      {editingItemID === eq.itemID ? (
                        <input
                          type="number"
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(e.target.value)}
                          min="0"
                          style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      ) : (
                        eq.total_quantity || 0
                      )}
                    </td>
                    <td>{eq.available_quantity || 0}</td>
                    <td>{borrowed}</td>
                    <td>
                      {editingItemID === eq.itemID ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleSaveQuantity(eq.itemID)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#22c55e', color: 'white', border: 'none', cursor: 'pointer' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditQuantity(eq.itemID, eq.total_quantity)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
