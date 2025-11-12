// src/api/http-common.js
import axios from "axios";

// Base URL of your backend API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Create Axios instance
const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies (refresh token)
});

// Helper to get and set access tokens
const getAccessToken = () => localStorage.getItem("accessToken");
const setAccessToken = (token) => localStorage.setItem("accessToken", token);

// Request interceptor → attach JWT to Authorization header
http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle expired tokens (401)
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or already retried → reject
    if (!error.response || originalRequest._retry) return Promise.reject(error);

    // Handle expired access token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If token refresh is already in progress
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Call backend /refresh endpoint (sends refresh cookie automatically)
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data.accessToken;

        setAccessToken(newAccessToken);
        http.defaults.headers["Authorization"] = "Bearer " + newAccessToken;

        processQueue(null, newAccessToken);

        // Retry the failed request
        return http(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken"); // logout cleanup
        window.location.href = "/login"; // redirect to login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // If not 401, just reject normally
    return Promise.reject(error);
  }
);

export default http;
