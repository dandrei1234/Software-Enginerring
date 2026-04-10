import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <h1>Sport-Rentals</h1>
      <div className="user-info">
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
