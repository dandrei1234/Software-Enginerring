import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  return (
    <aside className="sidebar">
      {userRole === 'staff' && (
        <>
          <NavLink to="/staff" className={({ isActive }) => (isActive ? 'active' : '')}>
            Staff Dashboard
          </NavLink>
          <NavLink to="/rentals" className={({ isActive }) => (isActive ? 'active' : '')}>
            Rentals
          </NavLink>
          <NavLink to="/audit-logs" className={({ isActive }) => (isActive ? 'active' : '')}>
            Audit Logs
          </NavLink>
        </>
      )}

      {userRole === 'student' && (
        <>
          <NavLink to="/student" className={({ isActive }) => (isActive ? 'active' : '')}>
            Student Dashboard
          </NavLink>
          <NavLink to="/borrow-status" className={({ isActive }) => (isActive ? 'active' : '')}>
            Borrow Status
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
