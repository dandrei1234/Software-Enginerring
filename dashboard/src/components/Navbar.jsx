import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const Navbar = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Only fetch if there is a logged in user
    if (!user || !user.userID) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/${user.userID}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="SMU Sport Rentals logo" className="navbar-logo" />
        <h1>SMU Sport-Rentals</h1>
      </div>
      <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', position: 'relative' }}
          >
            🔔
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'red', color: 'white', borderRadius: '50%',
                padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '40px', width: '300px',
              background: 'white', border: '1px solid #ddd', borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, color: 'black'
            }}>
              <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' }}>Notifications</div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ flex: 1, paddingRight: '10px', color: '#555' }}>{notif.message}</span>
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1rem', padding: '0 5px' }}
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span>Welcome, {user.fullname}</span>
        <span className="role-badge">{user.role}</span>
        <button
          onClick={onLogout}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
