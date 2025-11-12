import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  const setAccessToken = (token) => {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    // Optionally call backend logout to clear refresh cookie
    try {
      fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (e) {}
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      // If access token exists locally, we're authenticated
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        if (!mounted) return;
        setIsAuthenticated(true);
        setInitializing(false);
        // redirect to home if on root or on auth pages
        const p = window.location.pathname;
        if (p === '/' || p === '/login' || p === '/register') navigate('/home', { replace: true });
        return;
      }

      // No access token: try refresh using cookie-based refresh token
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data && data.accessToken) {
            setAccessToken(data.accessToken);
            setIsAuthenticated(true);
            setInitializing(false);
            navigate('/home', { replace: true });
            return;
          }
        }
      } catch (err) {
        // ignore — user not authenticated
      }

      if (!mounted) return;
      setIsAuthenticated(false);
      setInitializing(false);
      // leave user on public auth routes; otherwise redirect to login
      const publicPaths = ['/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) navigate('/login', { replace: true });
    }

    init();

    return () => { mounted = false; };
  }, [navigate]);

  const value = {
    isAuthenticated,
    initializing,
    setAccessToken: (t) => setAccessToken(t),
    logout,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
