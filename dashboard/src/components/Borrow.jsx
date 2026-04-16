import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';

const Borrow = ({ open, onClose, user }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEq, setSelectedEq] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const navigate = useNavigate();

  const todayDate = new Date();
  const minDate = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (open) {
      fetch('/api/equipment', { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => setEquipmentList(data))
        .catch(err => console.error("Failed to fetch equipment:", err));
    }
  }, [open]);

  const handleClose = () => {
    setSearchQuery('');
    setFilterCategory('');
    setSelectedEq('');
    setDueDate('');
    onClose();
  };

  const filteredEquipmentList = equipmentList.filter(item => {
    const matchSearch = item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = filterCategory ? item.category_name === filterCategory : true;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(equipmentList.map(item => item.category_name).filter(Boolean))];

  const handleSubmit = () => {
    if (!selectedEq) return;

    fetch('/api/borrow', {
      method: 'POST',
      headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userID: user.userID,
        itemID: selectedEq,
        dueDate: dueDate
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }
      return data;
    })
    .then(data => {
      console.log('Borrow Success:', data);
      handleClose();
      navigate('/borrow-status');
    })
    .catch(err => {
      console.error('Borrow Error:', err);
      alert('Error submitting request: ' + err.message);
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle style={{ backgroundColor: '#1e293b', color: 'white' }}>Borrow Equipment</DialogTitle>
      <DialogContent style={{ backgroundColor: '#1e293b', paddingTop: '24px' }}>
        
        <TextField
          label="Student Name"
          value={user?.fullname || ''}
          fullWidth
          disabled
          style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          InputProps={{ style: { color: 'white' } }}
        />

        <TextField
          label="Search Equipment"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          InputProps={{ style: { color: 'white' } }}
        />

        <FormControl fullWidth style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <InputLabel style={{ color: '#94a3b8' }}>Filter by Category</InputLabel>
          <Select
            value={filterCategory}
            label="Filter by Category"
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ color: 'white' }}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <InputLabel style={{ color: '#94a3b8' }}>Select Available Item</InputLabel>
          <Select
            value={selectedEq}
            label="Select Available Item"
            onChange={(e) => setSelectedEq(e.target.value)}
            style={{ color: 'white' }}
          >
            {filteredEquipmentList.map(item => (
              <MenuItem key={item.itemID} value={item.itemID}>
                {item.equipment_name} {item.description ? `(${item.description})` : ''} - {item.available_quantity} available
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          fullWidth
          required
          inputProps={{ min: minDate }}
          style={{ marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
          InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
          InputProps={{ style: { color: 'white' } }}
        />

      </DialogContent>
      <DialogActions style={{ backgroundColor: '#1e293b', padding: '16px 24px' }}>
        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid #334155' }} onClick={handleClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!selectedEq || !dueDate}>Submit Request</button>
      </DialogActions>
    </Dialog>
  );
};

export default Borrow;
