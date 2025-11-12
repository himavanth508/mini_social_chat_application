import http from '../http-common';

class GoogleService {
  // endpoint dedicated for Google login/exchange on the backend
  baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '') + '/auth/google';

  // Send Google credential payload to backend for verification and token exchange
  googleLogin = (credentialPayload) => http.post(this.baseUrl + '/login', credentialPayload, { withCredentials: true });
}

export default new GoogleService();
