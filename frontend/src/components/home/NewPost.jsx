import React, { useState } from 'react';
import uploadService from '../../services/uploadService';
import postsService from '../../services/postsService';
import { useNavigate } from 'react-router-dom';

export default function NewPost() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const submit = async () => {
    try {
      let media = [];
      if (files.length > 0) {
        const uploaded = await uploadService.uploadFiles(files);
        media = uploaded.map(f => f.url);
      }
      await postsService.createPost({ author: username, text, media });
      navigate('/home');
    } catch (err) { console.warn('new post err', err); alert('Upload failed'); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Create Post</h2>
      <div>
        <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Upload</button>
      </div>
    </div>
  );
}
