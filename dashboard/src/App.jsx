import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Rentals from './pages/Rentals';
import BorrowStatus from './pages/BorrowStatus';
import AuditLog from './pages/AuditLog';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  // Guard routing logic
  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <div className="app-body">
            <Sidebar userRole={user.role} />
            <main>
              <Routes>
                {user.role === 'staff' ? (
                  <>
                    <Route path="/staff" element={<StaffDashboard />} />
                    <Route path="/rentals" element={<Rentals user={user} />} />
                    <Route path="/audit-logs" element={<AuditLog />} />
                    <Route path="*" element={<Navigate to="/staff" />} />
                  </>
                ) : (
                  <>
                    <Route path="/student" element={<StudentDashboard user={user} />} />
                    <Route path="/borrow-status" element={<BorrowStatus user={user} />} />
                    <Route path="*" element={<Navigate to="/student" />} />
                  </>
                )}
              </Routes>
            </main>
          </div>
        </>
      )}
    </Router>
  );
}

export default App;
