import React, { useEffect, useState } from 'react';
import Header from '../Header';
import http from '../../http-common';
import { useAuth } from '../../contexts/AuthContext';
import uploadService from '../../services/uploadService';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import postsService from '../../services/postsService';
import friendsService from '../../services/friendsService';
import ChatWindow from './ChatWindow';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState([]);
  const [feed, setFeed] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postText, setPostText] = useState('');
  const [files, setFiles] = useState([]);
  const [pending, setPending] = useState([]);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [openChats, setOpenChats] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  const username = localStorage.getItem('username') || 'me';
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // fetch friends and feed
    async function load() {
      try {
        const f = await friendsService.listFriends(username);
        setFriends((f.data && f.data.friends) || []);
      } catch (e) { console.warn('friends load', e); }
      try {
        const p = await postsService.getFeed(username);
        setFeed((p.data && p.data.feed) || []);
      } catch (e) { console.warn('feed load', e); }
      // load pending friend requests
      try {
        const r = await friendsService.listPending(username);
        setPending((r.data && r.data.pending) || []);
      } catch (err) { console.warn('pending load', err); }
    }
  load();

    // connect socket
  // derive socket origin from API_URL (e.g., http://localhost:3000/api -> http://localhost:3000)
  const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  const socketOrigin = apiBase.replace(/\/api$/, '');
  const s = io(socketOrigin, { transports: ['websocket'], withCredentials: true });
    setSocket(s);
    s.on('connect', () => {
      s.emit('join', username);
    });
  s.on('message', (m) => setMessages(prev => [m, ...prev]));

    return () => { s.disconnect(); };
  }, [username]);

  const refreshFriendsAndFeed = async () => {
    try {
      const f = await friendsService.listFriends(username);
      setFriends((f.data && f.data.friends) || []);
    } catch (e) { console.warn('friends load', e); }
    try {
      const p = await postsService.getFeed(username);
      setFeed((p.data && p.data.feed) || []);
    } catch (e) { console.warn('feed load', e); }
    try {
      const r = await friendsService.listPending(username);
      setPending((r.data && r.data.pending) || []);
    } catch (err) { console.warn('pending load', err); }
  };

  const sendMessage = () => {
    if (!msg || !socket) return;
    // For demo: send to first friend if exists
  // if query param chat=friend present use that, otherwise first friend
  const params = new URLSearchParams(location.search);
  const chatTarget = params.get('chat');
  const to = chatTarget || friends[0] || null;
    if (!to) return alert('No friend to message');
    socket.emit('message', { to, from: username, text: msg });
    setMessages(prev => [{ from: username, text: msg, createdAt: new Date() }, ...prev]);
    setMsg('');
  };

  const doSearch = async () => {
    if (!searchQ) return setSearchResults([]);
    try {
      const res = await friendsService.searchUsers(searchQ);
      setSearchResults(res.data.results || []);
    } catch (e) { console.warn('search error', e); }
  };

  const sendFriendRequest = async (to) => {
    try {
      await friendsService.sendRequest(username, to);
      alert('Friend request sent');
    } catch (e) { alert('Request failed'); }
  };

  const acceptFriend = async (fromUser) => {
    try {
      await friendsService.acceptRequest(fromUser, username);
      // refresh lists
      await refreshFriendsAndFeed();
      alert(`Accepted ${fromUser}`);
    } catch (e) { console.warn('accept failed', e); alert('Accept failed'); }
  };

  const createPost = async () => {
    if (!postText) return;
    try {
      // upload files first if present
      let media = [];
      if (files && files.length > 0) {
        const uploaded = await uploadService.uploadFiles(files);
        media = uploaded.map(f => f.url);
      }
      await postsService.createPost({ author: username, text: postText, media });
      setPostText('');
      // reload feed
      const p = await postsService.getFeed(username);
      setFeed((p.data && p.data.feed) || []);
    } catch (e) { console.warn('create post err', e); }
  };

  const openChat = (friend) => {
    if (!friend) return;
    setOpenChats(prev => {
      const filtered = prev.filter(f => f !== friend);
      filtered.push(friend);
      if (filtered.length > 3) filtered.shift();
      return filtered;
    });
  };

  const closeChat = (friend) => {
    setOpenChats(prev => prev.filter(f => f !== friend));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatTarget = params.get('chat');
    if (chatTarget) openChat(chatTarget);
  }, [location.search]);

  const postComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    try {
      await postsService.commentOnPost(postId, { author: username, text });
      const p = await postsService.getFeed(username);
      setFeed((p.data && p.data.feed) || []);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) { console.warn('comment failed', err); }
  };

  return (
    <div>
      <Header />
      <main style={{display:'flex', gap:16, padding:16}}>
        <aside style={{width:260, borderRight:'1px solid #eee', paddingRight:12}}>
          <h3>Friends</h3>
          <ul>
            {friends.map(f => <li key={f}><a href={`/profile/${encodeURIComponent(f)}`}>{f}</a></li>)}
          </ul>
        </aside>
        <section style={{flex:1}}>
          <h2>Feeds from your friends</h2>
          <div style={{marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'#666'}}>See posts from friends below. To create a new post click the button.</div>
              <div><button onClick={() => navigate('/newpost')}>Create Post</button></div>
            </div>
          </div>
          <div>
            {(!feed || feed.length === 0) && (
              <div style={{ padding: 16, color: '#666' }}>No Posts -- only posts from your friends will be shown here</div>
            )}
            {feed.map(post => (
              <article key={post._id} style={{border:'1px solid #eee', padding:12, borderRadius:6, marginBottom:12}}>
                <div style={{fontWeight:700}}>{post.author}</div>
                <div style={{color:'#333'}}>{post.text}</div>
                {post.media && post.media.length>0 && (
                  <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap'}}>
                    {post.media.map((m,i) => {
                      const src = (typeof m === 'string' && (m.startsWith('http://') || m.startsWith('https://'))) ? m : ((process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/api$/, '') + m);
                      return <img key={i} src={src} alt={`media-${i}`} style={{maxWidth:220, maxHeight:160, objectFit:'cover', borderRadius:6}} />;
                    })}
                  </div>
                )}
                {post.comments && post.comments.length > 0 && (
                  <div style={{marginTop:8}}>
                    <strong>Comments</strong>
                    <div>
                      {post.comments.map((c, idx) => (
                        <div key={idx} style={{padding:6, background:'#f7f7f7', borderRadius:4, marginTop:6}}>
                          <small style={{fontWeight:700}}>{c.author}</small>
                          <div>{c.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{marginTop:8}}>
                  <small>{new Date(post.createdAt).toLocaleString()}</small>
                </div>
                <div style={{marginTop:8, display:'flex', gap:8}}>
                  <input value={commentInputs[post._id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))} placeholder="Write a comment..." style={{flex:1}} />
                  <button onClick={() => postComment(post._id)}>Comment</button>
                </div>
              </article>
            ))}
          </div>
          {/* removed central messages listing — chat windows appear at bottom-right */}
        </section>
        <aside style={{width:260, borderLeft:'1px solid #eee', paddingLeft:12}}>
          <h3>Search</h3>
          <div style={{display:'flex', gap:8}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search users" />
            <button onClick={doSearch}>Search</button>
          </div>
          <div style={{marginTop:12}}>
            {searchResults.map(u => (
              <div key={u.username} style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                <div>{u.username}</div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={()=>sendFriendRequest(u.username)}>Add</button>
                  <button onClick={() => openChat(u.username)}>Chat</button>
                </div>
              </div>
            ))}
          </div>
          <hr />
          <h3>Pending Friend Request</h3>
          <div>
            {pending.length === 0 && <div>No pending requests</div>}
            {pending.map((p, idx) => (
              <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                <div>{p.from || (p.members && p.members.find(m => m !== username))}</div>
                <div><button onClick={() => acceptFriend(p.from || (p.members && p.members.find(m => m !== username)))}>Accept</button></div>
              </div>
            ))}
          </div>
          <hr />
          <h3>Friends</h3>
          <p>{friends.length} friends</p>
        </aside>
      </main>
      {/* chat windows container */}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {openChats.map((f, i) => (
          <div key={f} style={{ marginLeft: i === 0 ? 0 : -20 }}>
            <ChatWindow friend={f} socket={socket} onClose={closeChat} />
          </div>
        ))}
      </div>
    </div>
  );
}
