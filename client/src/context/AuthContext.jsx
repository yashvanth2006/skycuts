import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, signInWithGoogle as firebaseSignInWithGoogle, getGoogleRedirectResult } from '../firebase.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateAuthState = useCallback((userData, jwtToken) => {
        setCurrentUser(userData);
        setToken(jwtToken);
        localStorage.setItem('skycuts_user', JSON.stringify(userData));
        localStorage.setItem('skycuts_token', jwtToken);
    }, []);

    // ── Sends a Firebase ID token to the backend and gets back a JWT ──────────
    const exchangeFirebaseToken = useCallback(async (idToken) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: idToken }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || 'Google login failed');
        }

        return response.json(); // { _id, name, email, role, token, requiresOnboarding, ... }
    }, []);

    // ── Restore session from localStorage + catch redirect sign-in results ─────
    useEffect(() => {
        let cancelled = false;

        const unsubscribe = onAuthStateChanged(auth, async () => {
            if (cancelled) return;

            // Check if we just came back from a signInWithRedirect flow (Brave fallback)
            const redirectResult = await getGoogleRedirectResult();
            if (redirectResult && !cancelled) {
                try {
                    const data = await exchangeFirebaseToken(redirectResult.idToken);
                    updateAuthState(data, data.token);
                } catch (err) {
                    console.error('Redirect sign-in exchange failed:', err);
                }
                setLoading(false);
                return;
            }

            // Restore from localStorage
            const storedUser = localStorage.getItem('skycuts_user');
            const storedToken = localStorage.getItem('skycuts_token');

            if (storedUser && storedToken) {
                setCurrentUser(JSON.parse(storedUser));
                setToken(storedToken);
            } else {
                setCurrentUser(null);
                setToken(null);
            }

            setLoading(false);
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [exchangeFirebaseToken, updateAuthState]);

    const login = useCallback((userData, jwtToken) => {
        updateAuthState(userData, jwtToken);
    }, [updateAuthState]);

    const signInWithGoogle = useCallback(async () => {
        setLoading(true);
        try {
            const result = await firebaseSignInWithGoogle();

            // null means signInWithRedirect was triggered — page will reload,
            // and the useEffect above will catch the result after reload.
            if (!result) return null;

            const data = await exchangeFirebaseToken(result.idToken);
            login(data, data.token);
            return data;
        } finally {
            setLoading(false);
        }
    }, [login, exchangeFirebaseToken]);

    const completeOnboarding = useCallback(async (name, mobileNumber) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/complete-profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, mobileNumber }),
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.message || 'Profile update failed');
        }

        const data = await res.json();
        login(data, data.token);
        return data;
    }, [login, token]);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.warn('Firebase sign out error:', error);
        }

        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('skycuts_user');
        localStorage.removeItem('skycuts_token');
    }, []);

    return (
        <AuthContext.Provider value={{
            currentUser, user: currentUser, token,
            login, signInWithGoogle, completeOnboarding, logout, loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
