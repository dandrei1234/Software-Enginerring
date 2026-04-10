import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../pages.css';

const Signup = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate password pattern
    const passwordRequirements = /(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRequirements.test(password)) {
      setError('Password must contain at least one uppercase letter and one number.');
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Register as a new student</p>
        
        <form className="auth-form" onSubmit={handleSignup}>
          {error && <span className="auth-error">{error}</span>}
          
          <input 
            type="text" 
            className="auth-input" 
            placeholder="Full Name" 
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
          <input 
            type="email" 
            className="auth-input" 
            placeholder="Official Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="auth-input" 
            placeholder="Strong Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
            Sign Up
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
