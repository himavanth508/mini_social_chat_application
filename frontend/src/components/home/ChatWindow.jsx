import React, { useState, useEffect, useRef } from 'react';
import messagesService from '../../services/messagesService';

export default function ChatWindow({ friend, onClose, socket, onSend }) {
  const [minimized, setMinimized] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([]);
  const ref = useRef();

  useEffect(() => {
    let mounted = true;
    // load conversation history
    async function load() {
      try {
        const me = localStorage.getItem('username');
        const r = await messagesService.getConversation(me, friend);
        if (mounted) setMsgs((r.data && r.data.messages) || []);
      } catch (err) { console.warn('load conv', err); }
    }
    load();

    const handler = (m) => {
      // push incoming messages that relate to this friend
      if (m.from === friend || m.to === friend || m.from === localStorage.getItem('username') && m.to === friend) {
        setMsgs(prev => [...prev, m]);
      }
    };
    if (socket) socket.on('message', handler);
    return () => { mounted = false; if (socket) socket.off('message', handler); };
  }, [friend, socket]);

  const doSend = () => {
    if (!msg) return;
    const m = { from: localStorage.getItem('username'), to: friend, text: msg, createdAt: new Date() };
    if (socket) socket.emit('message', m);
    if (onSend) onSend(m);
    setMsgs(prev => [...prev, m]);
    setMsg('');
  };

  return (
    <div style={{ width: 320, height: 360, border: '1px solid #ccc', borderRadius: 6, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f3f3' }}>
        <div style={{ fontWeight: 700 }}>{friend}</div>
        <div>
          <button onClick={() => setMinimized(!minimized)} style={{ marginRight: 8 }}>{minimized ? '▴' : '▾'}</button>
          <button onClick={() => { if (onClose) onClose(friend); }}>✕</button>
        </div>
      </div>
      {!minimized && (
        <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
          <div style={{ height: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }} ref={ref}>
            {msgs.length === 0 && (
              <div style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>No messages yet. Start the conversation!</div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === localStorage.getItem('username') ? 'flex-end' : 'flex-start', background: m.from === localStorage.getItem('username') ? '#dcf8c6' : '#eee', padding: 6, borderRadius: 6, maxWidth: '85%' }}>
                <small style={{ fontSize: 11 }}>{m.from}</small>
                <div>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)} style={{ flex: 1 }} />
            <button onClick={doSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
