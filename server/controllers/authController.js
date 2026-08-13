import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Email / Password Login ──────────────────────────────────────────────────
export const loginUser = async (req, res) => {
    // Early guard: reject if credentials are missing before any DB/bcrypt work
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    try {
        const user = await User.findOne({ email });

        // Use constant-time comparison path regardless of outcome.
        // matchPassword() safely returns false for Google-only users (no password hash).
        const isMatch = user ? await user.matchPassword(password) : false;

        if (user && isMatch) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        // Generic message — do NOT reveal whether email exists or account uses Google-only
        return res.status(401).json({ message: 'Invalid email or password' });
    } catch (err) {
        console.error('loginUser error:', err.message);
        return res.status(500).json({ message: 'Authentication service unavailable. Please try again.' });
    }
};

// ─── Register ────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role: 'client' });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        return res.status(400).json({ message: 'Invalid user data' });
    } catch (err) {
        console.error('registerUser error:', err.message);
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

// ─── Seed Admin (dev only) ───────────────────────────────────────────────────
export const seedAdmin = async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            return res.status(400).json({ message: 'Admin account already exists' });
        }

        const admin = await User.create({
            name: 'SkyCuts Admin',
            email: 'admin@skycuts.io',
            password: process.env.ADMIN_SEED_PASSWORD || 'Admin@123',
            role: 'admin',
        });

        return res.status(201).json({ message: 'Admin user successfully created!', admin });
    } catch (err) {
        console.error('seedAdmin error:', err.message);
        return res.status(500).json({ message: 'Failed to seed admin account' });
    }
};

// ─── Google OAuth Login ──────────────────────────────────────────────────────
// Flow: Google ID token → verify with google-auth-library → find/create User in MongoDB
//       → generate SkyCuts JWT → return same shape as email/password login
export const googleLogin = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential is required' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Google account has no email address' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // New Google user — created without a password (Google-only account)
            user = await User.create({
                googleId,
                email,
                name,
                role: 'client',
            });
        } else if (!user.googleId) {
            // Existing email/password user — link their Google account
            user.googleId = googleId;
            await user.save();
        }

        // Flag if the user still needs onboarding (name or mobile missing)
        const requiresOnboarding = !user.mobileNumber || !user.name;

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            token: generateToken(user._id),
            requiresOnboarding,
        });
    } catch (err) {
        console.error('Google login error:', err.message);
        // Do not expose internal error details
        return res.status(401).json({ message: 'Google authentication failed. Please try again.' });
    }
};

// ─── Complete Profile (Onboarding) ───────────────────────────────────────────
export const completeProfile = async (req, res) => {
    const { name, mobileNumber } = req.body;

    if (!name || !mobileNumber) {
        return res.status(400).json({ message: 'Name and Mobile Number are required' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name;
        user.mobileNumber = mobileNumber;
        await user.save();

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            token: generateToken(user._id),
            requiresOnboarding: false,
        });
    } catch (err) {
        console.error('completeProfile error:', err.message);
        return res.status(500).json({ message: 'Failed to update profile. Please try again.' });
    }
};