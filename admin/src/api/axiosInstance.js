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

// Global error handling
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            // Do not force redirect for auth endpoints so they can handle their own errors
            const isAuthEndpoint = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');
            if (!isAuthEndpoint) {
                localStorage.removeItem('skycuts_user');
                localStorage.removeItem('skycuts_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;
