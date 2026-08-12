import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });
        if (!res.ok) throw new Error('Google login failed');
        const data = await res.json();
        login(data, data.token);
        return data; // contains requiresOnboarding flag
    };

    const completeOnboarding = async (name, mobileNumber) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/complete-profile`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, mobileNumber }),
        });
        if (!res.ok) throw new Error('Profile update failed');
        const data = await res.json();
        login(data, data.token);
        return data;
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
