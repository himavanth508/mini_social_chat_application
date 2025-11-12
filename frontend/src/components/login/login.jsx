import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/authService';
import GoogleService from '../../services/googleService';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
        const { setAccessToken, setIsAuthenticated } = useAuth();
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const navigate = useNavigate();

        const onGoogleSuccess = async (credentialResponse) => {
                setLoading(true); setError(null);
                        try {
                                // Prefer the dedicated Google service endpoint
                                let res;
                                try {
                                    res = await GoogleService.googleLogin(credentialResponse);
                                } catch (e) {
                                    // fallback to generic auth service endpoint
                                    res = await AuthService.googleLogin(credentialResponse);
                                }
                                const accesstoken = res?.data?.accessToken || credentialResponse?.credential || null;
                    if (accesstoken) {
                        setAccessToken(accesstoken);
                        // store a local username if backend returned it
                        const returnedUser = res?.data?.user;
                        if (returnedUser && returnedUser.username) localStorage.setItem('username', returnedUser.username);
                    }
                                setIsAuthenticated(true);
                                // redirect to home after successful google login
                                try { navigate('/home'); } catch (e) { /* ignore */ }
                        } catch (err) {
                                console.log("error in google auth",err);
                                const fallback = credentialResponse?.credential || null;
                                if (fallback) setAccessToken(fallback);
                                setIsAuthenticated(true);
                        } finally { setLoading(false); }
        };

        const onSubmit = async (e) => {
                e.preventDefault();
                setError(null);
                if (!username || !password) return setError('Please enter username and password');
                setLoading(true);
                try {
                        const res = await AuthService.login({ username, password });
                        const token = res?.data?.accessToken;
                    if (token) {
                        setAccessToken(token);
                        const returnedUser = res?.data?.user;
                        if (returnedUser && returnedUser.username) localStorage.setItem('username', returnedUser.username);
                        setIsAuthenticated(true);
                        navigate('/home');
                        } else {
                                setError('Invalid server response');
                        }
                } catch (err) {
                        setError(err?.response?.data?.message || 'Login failed');
                } finally { setLoading(false); }
        };

        return (
                <div className="chatbook-login-root">
                    <div className="login-card">
                        <div className="promo">
                            <h1>Chatbook</h1>
                            <p>Connect with friends, share updates, and chat in real-time.</p>
                            <div className="decor">
                                <div className="logo-bubble">CB</div>
                            </div>
                        </div>
                        <div className="form-side">
                            <div className="form-inner">
                                <div className="brand"><div className="logo-bubble" style={{width:36,height:36,fontSize:16}}></div><h2>Chatbook</h2></div>
                                <div className="login-title">Welcome back</div>
                                <div className="login-sub">Sign in to continue to Chatbook</div>

                                <form onSubmit={onSubmit}>
                                    <div className="form-field">
                                        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username or email" />
                                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
                                    </div>
                                    {error && <div style={{color:'crimson', marginBottom:10}}>{error}</div>}
                                    <div style={{display:'flex', gap:8}}>
                                        <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Signing in...' : 'Sign in'}</button>
                                        <div style={{marginLeft:'auto', alignSelf:'center'}}><a className="small-link">Forgot?</a></div>
                                    </div>
                                </form>

                                <div className="divider">Or continue with</div>
                                <div style={{display:'flex', gap:12}}>
                                    <div className="google-btn">
                                        <GoogleLogin onSuccess={onGoogleSuccess} onError={() => setError('Google login failed')} />
                                    </div>
                                    <div className="google-btn"> <img className="google-logo" src="/static/google.svg" alt="G"/> Email</div>
                                </div>

                                                <div style={{marginTop:18}}>
                                                    <span>Don't have an account? </span><Link className="small-link" to="/register">Create one</Link>
                                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        )
}

