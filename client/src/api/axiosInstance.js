import axios from 'axios';

const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) return 'http://localhost:5000/api';
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
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
