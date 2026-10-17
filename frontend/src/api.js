import axios from 'axios';

// Automated Axios instance with direct backend target and JWT Authorization header injection
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse userInfo token from localStorage', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
