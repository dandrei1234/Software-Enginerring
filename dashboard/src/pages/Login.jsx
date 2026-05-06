import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../pages.css';

const Login = ({ setUser }) => {
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validate email domain
    if (!email.toLowerCase().endsWith('@smu.edu.ph')) {
      setError('Please use your SMU email address (@smu.edu.ph)');
      return;
    }

    // Validate password pattern
    const passwordRequirements = /(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRequirements.test(newPassword)) {
      setError('Password must contain at least one uppercase letter and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, newPassword, confirmPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      setMessage(data.message);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="SMU Sport Rentals logo" className="auth-logo" />
        
        {view === 'login' ? (
          <>
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
            <div className="auth-switch" style={{ marginTop: '8px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); setError(null); }}>
                Forgot Password?
              </a>
            </div>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>
            <p>Enter your email and new password</p>
            
            <form className="auth-form" onSubmit={handleResetRequest}>
              {error && <span className="auth-error">{error}</span>}
              {message && <span className="auth-success">{message}</span>}
              
              <input 
                type="email" 
                className="auth-input" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '16px' }}
                disabled={isSubmitted}
              >
                {isSubmitted ? 'Request Sent' : 'Reset Password'}
              </button>
            </form>

            <div className="auth-switch" style={{ marginTop: '16px' }}>
              <a href="#" onClick={(e) => { 
                e.preventDefault(); 
                setView('login'); 
                setError(null); 
                setMessage(null); 
                setIsSubmitted(false);
              }}>
                Back to Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
