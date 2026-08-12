import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
// firebase-admin is a CommonJS package; use subpath imports for ESM compatibility
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// ─── Firebase Admin — initialise once ────────────────────────────────────────
// Subpath imports (firebase-admin/app, firebase-admin/auth) are ESM-compatible.
// No service-account JSON is needed — projectId is sufficient for verifyIdToken.
if (!getApps().length) {
    initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'skycuts-ff449',
    });
}

const firebaseAuth = getAuth();

// ─── Email / Password ────────────────────────────────────────────────────────

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'client' });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export const seedAdmin = async (req, res) => {
    // Block this endpoint in production to prevent accidental exposure
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Seed endpoint is disabled in production' });
    }

    const seedPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!seedPassword) {
        return res.status(500).json({ message: 'ADMIN_SEED_PASSWORD is not set in .env' });
    }

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
        return res.status(400).json({ message: 'Admin account already exists' });
    }

    const adminUser = await User.create({
        name: 'SkyCuts Admin',
        email: 'admin@skycuts.io',
        password: seedPassword,
        role: 'admin',
    });

    res.status(201).json({ message: 'Admin user successfully created!', admin: adminUser });
};

// ─── Google / Firebase Sign-In ───────────────────────────────────────────────
// The client sends a Firebase ID token (result.user.getIdToken()).
// We verify it with Firebase Admin SDK — this handles all the audience/issuer
// checks correctly regardless of which OAuth client Firebase used internally.

export const googleLogin = async (req, res) => {
    const { credential } = req.body; // Firebase ID token from the client

    if (!credential) {
        return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    try {
        // Verify the Firebase ID token using Firebase Admin SDK
        const decodedToken = await firebaseAuth.verifyIdToken(credential);

        const { uid: firebaseUid, email, name } = decodedToken;

        if (!email) {
            return res.status(400).json({ message: 'No email found in Google account' });
        }

        // Find or create the user in our database
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                googleId: firebaseUid,
                email,
                name: name || email.split('@')[0],
                role: 'client',
            });
        } else if (!user.googleId) {
            // Link Google account to an existing email/password account
            user.googleId = firebaseUid;
            await user.save();
        }

        const requiresOnboarding = !user.mobileNumber || !user.name;

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            token: generateToken(user._id),
            requiresOnboarding,
        });
    } catch (err) {
        console.error('Firebase token verification error:', err.message);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

// ─── Profile Completion ───────────────────────────────────────────────────────

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

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            token: generateToken(user._id),
            requiresOnboarding: false,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};