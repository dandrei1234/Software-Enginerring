import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../pages.css';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true', 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      if (data.user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to access your dashboard</p>
        
        <form className="auth-form" onSubmit={handleLogin}>
          {error && <span className="auth-error">{error}</span>}
          
          <input 
            type="text" 
            className="auth-input" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="auth-input" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
            Login
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
