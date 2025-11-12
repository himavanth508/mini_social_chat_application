import http from "../http-common";

class AuthService{
    // Ensure auth routes are mounted under /auth on the API URL
    baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '') + '/auth';

    login = (data) => http.post(this.baseUrl + "/login", data);

    googleLogin = (credentialPayload) => http.post(this.baseUrl + "/login", credentialPayload);

    register = (data) => http.post(this.baseUrl + "/register", data);

    logout = () => http.delete(this.baseUrl + "/logout");

    refreshToken = () => http.post(this.baseUrl + "/refresh");
}

export default new AuthService();