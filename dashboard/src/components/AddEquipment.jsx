import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const AddEquipment = ({ open, onClose, onEquipmentAdded }) => {
  const [equipmentName, setEquipmentName] = useState('');
  const [categoryID, setCategoryID] = useState(1); // 1 = Ball Games, 2 = Racket Sports
  const [description, setDescription] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(10);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!equipmentName) return;

    fetch('/api/equipment', {
      method: 'POST',
      headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipment_name: equipmentName,
        categoryID,
        description,
        total_quantity: totalQuantity
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add equipment');
      
      // Cleanup and close
      setEquipmentName('');
      setDescription('');
      setTotalQuantity(10);
      onEquipmentAdded();
      onClose();
    })
    .catch(err => setError(err.message));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle style={{ backgroundColor: '#1e293b', color: 'white' }}>Add New Equipment</DialogTitle>
      <DialogContent style={{ backgroundColor: '#1e293b', paddingTop: '24px' }}>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <TextField
          label="Equipment Name"
          value={equipmentName}
          onChange={(e) => setEquipmentName(e.target.value)}
          fullWidth
          required
          style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          InputProps={{ style: { color: 'white' } }}
        />

        <FormControl fullWidth style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <InputLabel style={{ color: '#94a3b8' }}>Category</InputLabel>
          <Select
            value={categoryID}
            label="Category"
            onChange={(e) => setCategoryID(e.target.value)}
            style={{ color: 'white' }}
          >
            <MenuItem value={1}>Ball Games</MenuItem>
            <MenuItem value={2}>Racket Sports</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          InputProps={{ style: { color: 'white' } }}
        />

        <TextField
          label="Starting Quantity"
          type="number"
          value={totalQuantity}
          onChange={(e) => setTotalQuantity(parseInt(e.target.value))}
          fullWidth
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          InputProps={{ style: { color: 'white' } }}
        />

      </DialogContent>
      <DialogActions style={{ backgroundColor: '#1e293b', padding: '16px 24px' }}>
        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid #334155' }} onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!equipmentName}>Save Equipment</button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEquipment;
