import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailHelper.js';
import { parseCSV, validateClientData } from '../utils/csvParser.js';

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

export const seedEditor = async (req, res) => {
    const editorExists = await User.findOne({ role: 'admin' });

    if (editorExists) {
        return res.status(400).json({ message: 'Editor account already exists' });
    }

    const editor = await User.create({
        name: 'Yashvanth',
        email: 'yashvanth@skycuts.io',
        password: 'yash2468',
        role: 'admin'
    });

    res.status(201).json({ message: 'Editor user successfully created!', editor });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({ message: 'Password reset email sent' });
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
};

export const completeOnboarding = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.onboardingCompleted = true;
    await user.save();

    res.json({ message: 'Onboarding completed successfully' });
};

export const bulkCreateClients = async (req, res) => {
    const { csvData } = req.body;

    if (!csvData) {
        return res.status(400).json({ message: 'CSV data is required' });
    }

    try {
        const parsedData = parseCSV(csvData);
        const { valid, invalid, errors } = validateClientData(parsedData);

        if (invalid.length > 0) {
            return res.status(400).json({
                message: 'Some rows have validation errors',
                errors,
                invalid,
                validCount: valid.length,
                invalidCount: invalid.length,
            });
        }

        // Check for existing emails
        const emails = valid.map(c => c.email);
        const existingUsers = await User.find({ email: { $in: emails } });
        const existingEmails = new Set(existingUsers.map(u => u.email));

        const toCreate = valid.filter(c => !existingEmails.has(c.email));
        const skipped = valid.filter(c => existingEmails.has(c.email));

        // Create clients
        const created = await User.create(toCreate);

        res.json({
            message: `Created ${created.length} clients successfully`,
            created: created.length,
            skipped: skipped.length,
            skippedEmails: skipped.map(c => c.email),
        });
    } catch (error) {
        console.error('Bulk client creation error:', error);
        res.status(400).json({ message: error.message });
    }
};