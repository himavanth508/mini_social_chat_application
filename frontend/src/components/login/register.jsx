import { useState } from 'react';
import AuthService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import './login.css';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setAccessToken, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) return setError('Username and password required');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try{
      const res = await AuthService.register({ username, password });
      const token = res?.data?.accessToken;
      if (token) {
          setAccessToken(token);
          const returnedUser = res?.data?.user;
          if (returnedUser && returnedUser.username) localStorage.setItem('username', returnedUser.username);
          setIsAuthenticated(true);
          navigate('/home', { replace: true });
      } else {
        setError('Registration succeeded but no token returned');
      }
    } catch (err){
      setError(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="chatbook-login-root">
      <div className="login-card">
        <div className="promo">
          <h1>Create account</h1>
          <p>Join Chatbook and start connecting with friends.</p>
        </div>
        <div className="form-side">
          <div className="form-inner">
            <div className="login-title">Create your account</div>
            <div className="login-sub">It only takes a minute</div>
            <form onSubmit={onSubmit}>
              <div className="form-field">
                <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
                <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" />
              </div>
              {error && <div style={{color:'crimson', marginBottom:10}}>{error}</div>}
              <div style={{display:'flex', gap:8}}>
                <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Creating...' : 'Create account'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
