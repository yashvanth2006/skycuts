import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('skycuts_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global error handling - do not auto-redirect on 401
// Public APIs can legitimately return 401 for unauthenticated requests
// Protected routes should handle 401 errors individually
api.interceptors.response.use(
    (res) => res,
    (err) => {
        return Promise.reject(err);
    }
);

export default api;
