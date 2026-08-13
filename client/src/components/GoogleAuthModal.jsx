import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { X, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PROJECT_TYPES = [
    'Music Video',
    'Short Film',
    'Commercial / Brand Video',
    'Documentary',
    'Wedding Film',
    'Corporate Video',
    'Social Media Content',
    'Other',
];

const inputStyle = (dv) => ({
    width: '100%', padding: '11px 12px', boxSizing: 'border-box',
    background: dv.bg2, color: dv.white,
    border: `1px solid ${dv.border}`, borderRadius: 6,
    outline: 'none', fontSize: 14, fontFamily: "'Inter', system-ui",
});

const labelStyle = (dv) => ({
    display: 'block', color: dv.white, fontSize: 13,
    marginBottom: 6, fontWeight: 500,
});

const errorBox = {
    color: '#f87171', marginBottom: 14, fontSize: 13,
    padding: '8px 12px', background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6,
};

// ── Progress dots ─────────────────────────────────────────────────────────────
function StepDots({ current, total, dv }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                    width: i === current ? 20 : 6, height: 6, borderRadius: 3,
                    background: i === current ? dv.amber : i < current ? dv.blue : dv.gray3,
                    transition: 'all 0.3s ease',
                }} />
            ))}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
// Steps: 'login' → 'onboarding' (if needed) → 'request' → 'submitted'
// If user is already authenticated, opens directly at 'request'.
export default function GoogleAuthModal({ isOpen, onClose }) {
    const { dv, isDark } = useTheme();
    const { user, token, loginWithGoogle, completeOnboarding, loading: authLoading } = useAuth();

    const [step, setStep] = useState('login');

    // Reset step every time the modal opens/closes so stale state is cleared.
    // React to user state changes to determine the correct step.
    useEffect(() => {
        if (isOpen) {
            if (authLoading) return; // Wait for AuthContext to finish loading

            if (user) {
                // If user doesn't have a name or mobile, force onboarding
                if (!user.name || !user.mobileNumber) {
                    setStep('onboarding');
                } else {
                    setStep('request');
                }
            } else {
                setStep('login');
            }
            setError('');
        }
    }, [isOpen, user, authLoading]);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Request form fields
    const [reqTitle, setReqTitle] = useState('');
    const [reqType, setReqType] = useState('');
    const [reqDesc, setReqDesc] = useState('');
    const [reqReqs, setReqReqs] = useState('');
    const [reqDeadline, setReqDeadline] = useState('');
    const [submittedRequest, setSubmittedRequest] = useState(null);

    const STEP_INDEX = { login: 0, onboarding: 1, request: 2, submitted: 3 };

    // ── Handlers ──────────────────────────────────────────────────────────────

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
                setStep('request');
            }
        } catch {
            setError('Google sign-in failed. Please try again.');
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
            setStep('request');
        } catch {
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!reqType) return setError('Please select a project type.');
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/project-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: reqTitle,
                    type: reqType,
                    description: reqDesc,
                    requirements: reqReqs,
                    deadline: reqDeadline || undefined,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Submission failed');
            }
            const data = await res.json();
            setSubmittedRequest(data);
            setStep('submitted');
        } catch (err) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(user ? 'request' : 'login');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const totalDots = 3;
    const currentDot = Math.min(STEP_INDEX[step], totalDots - 1);

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    style={{
                        background: dv.bg1,
                        border: `1px solid ${dv.border}`,
                        borderRadius: 14,
                        padding: '32px 32px 28px',
                        width: '100%',
                        maxWidth: step === 'request' ? 480 : 420,
                        position: 'relative',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        transition: 'max-width 0.3s ease',
                    }}
                >
                    {/* Close */}
                    <button onClick={handleClose} style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'none', border: 'none',
                        color: dv.gray2, cursor: 'pointer', padding: 4,
                    }}>
                        <X size={18} />
                    </button>

                    {/* Progress dots — hidden on submitted */}
                    {step !== 'submitted' && (
                        <StepDots current={currentDot} total={totalDots} dv={dv} />
                    )}

                    {/* ── STEP 1: Google Sign-In ── */}
                    {step === 'login' && (
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: dv.white, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                                Start a Project
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                                Sign in with Google to submit a project request to the editor.
                            </p>
                            {error && <div style={errorBox}>{error}</div>}
                            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}>
                                {loading ? (
                                    <span style={{ color: dv.gray1, fontSize: 14 }}>Signing in...</span>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google sign-in failed.')}
                                        theme={isDark ? 'filled_black' : 'outline'}
                                        size="large"
                                        text="continue_with"
                                        shape="rectangular"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Name + Mobile ── */}
                    {step === 'onboarding' && (
                        <div>
                            <h2 style={{ color: dv.white, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                                Complete Your Profile
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, marginBottom: 22 }}>
                                We just need your name and mobile number.
                            </p>
                            {error && <div style={errorBox}>{error}</div>}
                            <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={labelStyle(dv)}>Full Name</label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                        style={inputStyle(dv)} placeholder="John Doe" />
                                </div>
                                <div>
                                    <label style={labelStyle(dv)}>Mobile Number</label>
                                    <input type="tel" required value={mobile} onChange={e => setMobile(e.target.value)}
                                        style={inputStyle(dv)} placeholder="+1 (555) 000-0000" />
                                </div>
                                <button type="submit" disabled={loading} style={{
                                    width: '100%', padding: '13px', marginTop: 6,
                                    background: dv.blue, color: '#fff',
                                    border: 'none', borderRadius: 6,
                                    fontSize: 14, fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                    {loading ? 'Saving...' : <><span>Continue</span><ChevronRight size={16} /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 3: Project Details ── */}
                    {step === 'request' && (
                        <div>
                            <h2 style={{ color: dv.white, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                                Project Details
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, marginBottom: 22 }}>
                                Describe your project. The editor will review and respond within 24 hours.
                            </p>
                            {error && <div style={errorBox}>{error}</div>}
                            <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={labelStyle(dv)}>Project Title *</label>
                                    <input type="text" required value={reqTitle}
                                        onChange={e => setReqTitle(e.target.value)}
                                        style={inputStyle(dv)}
                                        placeholder="e.g. Brand campaign — summer collection" />
                                </div>
                                <div>
                                    <label style={labelStyle(dv)}>Project Type *</label>
                                    <select required value={reqType}
                                        onChange={e => setReqType(e.target.value)}
                                        style={{ ...inputStyle(dv), cursor: 'pointer' }}>
                                        <option value="" disabled>Select a type...</option>
                                        {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle(dv)}>Description</label>
                                    <textarea rows={3} value={reqDesc}
                                        onChange={e => setReqDesc(e.target.value)}
                                        style={{ ...inputStyle(dv), resize: 'vertical', fontFamily: "'Inter', system-ui" }}
                                        placeholder="Tone, style, target audience, reference videos..." />
                                </div>
                                <div>
                                    <label style={labelStyle(dv)}>Specific Requirements</label>
                                    <textarea rows={2} value={reqReqs}
                                        onChange={e => setReqReqs(e.target.value)}
                                        style={{ ...inputStyle(dv), resize: 'vertical', fontFamily: "'Inter', system-ui" }}
                                        placeholder="Aspect ratios, formats, technical specs..." />
                                </div>
                                <div>
                                    <label style={labelStyle(dv)}>Deadline <span style={{ color: dv.gray2, fontWeight: 400 }}>(optional)</span></label>
                                    <input type="date" value={reqDeadline}
                                        onChange={e => setReqDeadline(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{ ...inputStyle(dv), colorScheme: 'dark' }} />
                                </div>
                                <button type="submit" disabled={loading} style={{
                                    width: '100%', padding: '13px', marginTop: 6,
                                    background: dv.amber, color: '#111',
                                    border: 'none', borderRadius: 6,
                                    fontSize: 14, fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    letterSpacing: '0.02em',
                                }}>
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 4: Confirmation ── */}
                    {step === 'submitted' && (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                                background: 'rgba(47,116,208,0.12)', border: `2px solid ${dv.blue}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <CheckCircle size={32} color={dv.blue} />
                            </div>
                            <h2 style={{ color: dv.white, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                                Request Submitted!
                            </h2>
                            <p style={{ color: dv.gray1, fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
                                Your request is now <strong style={{ color: dv.amber }}>pending review</strong>.
                            </p>
                            <p style={{ color: dv.gray2, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                                The editor will review and respond within 24 hours. Once accepted, your project workspace will appear in your dashboard.
                            </p>
                            {submittedRequest && (
                                <div style={{
                                    textAlign: 'left', padding: '14px 16px', marginBottom: 22,
                                    background: dv.bg2, border: `1px solid ${dv.border}`, borderRadius: 8,
                                }}>
                                    <p style={{ fontSize: 11, color: dv.gray2, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Request</p>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: dv.white, marginBottom: 2 }}>{submittedRequest.title}</p>
                                    <p style={{ fontSize: 13, color: dv.gray1 }}>{submittedRequest.type}</p>
                                </div>
                            )}
                            <button onClick={handleClose} style={{
                                padding: '12px 28px',
                                background: dv.blue, color: '#fff',
                                border: 'none', borderRadius: 6,
                                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            }}>
                                Done
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
