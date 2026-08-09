import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
        return res.status(400).json({ message: 'Admin account already exists' });
    }

    const admin = await User.create({
        name: 'SkyCuts Admin',
        email: 'admin@skycuts.io',
        password: 'Admin@123',
        role: 'admin'
    });

    res.status(201).json({ message: 'Admin user successfully created!', admin });
};

export const googleLogin = async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                role: 'client',
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
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
        console.error('Google login error:', err);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

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