import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function GoogleAuthModal({ isOpen, onClose }) {
    const { dv, isDark } = useTheme();
    const { loginWithGoogle, completeOnboarding } = useAuth();
    
    // States: 'login' | 'onboarding' | 'success'
    const [step, setStep] = useState('login');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            const data = await loginWithGoogle(credentialResponse.credential);
            
            if (data.requiresOnboarding) {
                setName(data.name || '');
                setMobile(data.mobileNumber || '');
                setStep('onboarding');
            } else {
                setStep('success');
            }
        } catch (err) {
            setError('Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await completeOnboarding(name, mobile);
            setStep('success');
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('login');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    style={{
                        background: dv.bg1,
                        border: `1px solid ${dv.border}`,
                        borderRadius: 12,
                        padding: 32,
                        width: '100%',
                        maxWidth: 420,
                        position: 'relative',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                    }}
                >
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            background: 'none', border: 'none',
                            color: dv.gray1, cursor: 'pointer',
                        }}
                    >
                        <X size={20} />
                    </button>

                    {step === 'login' && (
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: dv.white, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                                Start a Project
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, marginBottom: 32 }}>
                                Sign in with Google to create your workspace and submit project requests.
                            </p>
                            
                            {error && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>{error}</div>}
                            
                            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}>
                                {loading ? (
                                    <div style={{ color: dv.white }}>Loading...</div>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google login failed.')}
                                        theme={isDark ? 'filled_black' : 'outline'}
                                        size="large"
                                        text="continue_with"
                                        shape="rectangular"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'onboarding' && (
                        <div>
                            <h2 style={{ color: dv.white, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                                Complete Profile
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, marginBottom: 24 }}>
                                We need a few more details to set up your client workspace.
                            </p>

                            {error && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>{error}</div>}

                            <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', color: dv.white, fontSize: 13, marginBottom: 6 }}>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px',
                                            background: dv.bg2, color: dv.white,
                                            border: `1px solid ${dv.border}`, borderRadius: 6,
                                            outline: 'none', fontSize: 14
                                        }}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: dv.white, fontSize: 13, marginBottom: 6 }}>Mobile Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px',
                                            background: dv.bg2, color: dv.white,
                                            border: `1px solid ${dv.border}`, borderRadius: 6,
                                            outline: 'none', fontSize: 14
                                        }}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '14px', marginTop: 8,
                                        background: dv.blue, color: '#fff',
                                        border: 'none', borderRadius: 6,
                                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Complete Setup'}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <CheckCircle size={48} color={dv.blue} style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ color: dv.white, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                                You're all set!
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, marginBottom: 24 }}>
                                Your account is ready. Project requests will be available in the next module.
                            </p>
                            <button
                                onClick={handleClose}
                                style={{
                                    padding: '12px 24px',
                                    background: dv.bg2, color: dv.white,
                                    border: `1px solid ${dv.border}`, borderRadius: 6,
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
