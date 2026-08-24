import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance.js';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser  = localStorage.getItem('skycuts_user');
            const storedToken = localStorage.getItem('skycuts_token');
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch {
            localStorage.removeItem('skycuts_user');
            localStorage.removeItem('skycuts_token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('skycuts_user', JSON.stringify(userData));
        localStorage.setItem('skycuts_token', jwtToken);
    }, []);

    const loginWithGoogle = async (credential) => {
        try {
            const { data } = await api.post('/auth/google', { credential });
            login(data, data.token);
            return data;
        } catch (err) {
            console.error('Google login error:', err);
            throw new Error('Google login failed');
        }
    };

    const completeOnboarding = async (name, mobileNumber) => {
        try {
            const { data } = await api.post('/auth/complete-profile', { name, mobileNumber });
            login(data, data.token);
            return data;
        } catch (err) {
            console.error('Profile update error:', err);
            throw new Error('Profile update failed');
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('skycuts_user');
        localStorage.removeItem('skycuts_token');
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, loginWithGoogle, completeOnboarding, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
