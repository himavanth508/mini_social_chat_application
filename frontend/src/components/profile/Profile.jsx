import React, { useEffect, useState } from 'react';
import Header from '../Header';
import http from '../../http-common';
import uploadService from '../../services/uploadService';
import { useNavigate } from 'react-router-dom';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Profile() {
  const { username: paramUser } = useParams();
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const chatWith = searchParams.get('chat') || null;

  const username = paramUser || localStorage.getItem('username');
  const me = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        // simple user lookup via search endpoint
        const res = await http.get(`/friends/search?q=${encodeURIComponent(username)}`);
        const found = (res.data && res.data.results && res.data.results[0]) || { username };
        setUser(found);
      } catch (err) { console.warn('user lookup', err); setUser({ username }); }
      try {
        const r = await http.get(`/posts/user?username=${encodeURIComponent(username)}`);
        setPosts(r.data.posts || []);
      } catch (err) { console.warn('user posts', err); }
      try {
        const friendsRes = await http.get(`/friends/list?username=${encodeURIComponent(username)}`);
        setUser(prev => ({ ...prev, friends: (friendsRes.data && friendsRes.data.friends) || [] }));
      } catch (err) { console.warn('user friends', err); }
      setLoading(false);
    }
    load();
  }, [username]);

  return (
    <div>
      <Header />
      <main className="container">
        <div style={{ display: 'flex', gap: 16 }}>
          <section style={{ flex: 1 }}>
            <div className="card">
              <h2>{user.username}'s profile</h2>
              {user.picture && <img src={user.picture} alt="avatar" style={{ width: 120, borderRadius: 8 }} />}
            <div style={{ marginTop: 12, display:'flex', gap:8, alignItems:'center' }}>
              {username !== me && (
                <button onClick={() => { if (chatWith) window.location.href = `/home`; else window.location.href = `/home?chat=${username}`; }}>
                  Chat with {username}
                </button>
              )}
              {username === me && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ display:'inline-block', padding:8, background:'#f3f3f3', borderRadius:6, cursor:'pointer' }}>
                    Upload profile photo
                    <input type="file" style={{ display:'none' }} onChange={async (e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      try {
                        const uploaded = await uploadService.uploadFiles([f]);
                        const url = uploaded && uploaded[0] && uploaded[0].url;
                        if (url) {
                          await http.post('/auth/profile', { username: me, picture: url });
                          // reload profile
                          navigate('/profile');
                        }
                      } catch (err) { console.warn('upload profile pic', err); alert('Upload failed'); }
                    }} />
                  </label>
                </div>
              )}
                </div>
                </div>
            <div style={{ marginTop: 24 }}>
              <h3>Posts</h3>
              {loading && <div>Loading...</div>}
              {!loading && posts.length === 0 && <div>No posts yet.</div>}
              {!loading && posts.map(p => (
                <article key={p._id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>{p.author}</div>
                  <div style={{ color: '#333' }}>{p.text}</div>
                  {p.media && p.media.length > 0 && (
                    <div style={{ marginTop: 8, display:'flex', gap:8, flexWrap:'wrap' }}>{p.media.map((m, i) => {
                      const src = (typeof m === 'string' && (m.startsWith('http://') || m.startsWith('https://'))) ? m : ((process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/api$/, '') + m);
                      return <img key={i} src={src} alt={`media-${i}`} style={{maxWidth:220, maxHeight:160, objectFit:'cover', borderRadius:6}} />;
                    })}</div>
                  )}
                  <div style={{ marginTop: 8 }}><small>{new Date(p.createdAt).toLocaleString()}</small></div>
                </article>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <h3>Friends</h3>
              {user.friends && user.friends.length === 0 && <div>No friends yet.</div>}
              {user.friends && user.friends.map((fr, idx) => (
                <div key={idx}><a href={`/profile/${encodeURIComponent(fr)}`}>{fr}</a></div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
