import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const uploadFiles = async (files) => {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  const res = await axios.post(`${API_URL}/uploads`, form, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.files || [];
};

export default { uploadFiles };
