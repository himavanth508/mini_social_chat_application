import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./components/login/login.jsx";
import Register from "./components/login/register.jsx";
import Home from './components/home/Home';
import Profile from './components/profile/Profile';
import NewPost from './components/home/NewPost';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/newpost" element={<NewPost />} />
                    {/* Redirect root to /login by default */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}