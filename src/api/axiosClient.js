import axios from 'axios';

// 1. Read API Base URL from Vite Environment Variable with fallback to Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// 2. Request Interceptor: Attach JWT Bearer Token to outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Handle 401 Unauthorized / Expired Tokens
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If request fails with 401 and is not the login attempt itself:
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        // Clear expired or invalidated credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Notify application state to reset user
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
