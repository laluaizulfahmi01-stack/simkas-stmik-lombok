// src/api/axios.js
import axios from 'axios';

const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const defaultBaseUrl = `http://${host}:5000/api`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('simkas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      localStorage.removeItem('simkas_token');
      localStorage.removeItem('simkas_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
