import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="app-header">
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <Link to="/home" style={{textDecoration:'none', fontWeight:700}}>ChatBook</Link>
        <nav>
          <Link to="/home" style={{marginRight:12}}>Home</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </div>
      <div>
        <button className="btn secondary" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
