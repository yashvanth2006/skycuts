import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── protect ─────────────────────────────────────────────────────────────────
// Validates JWT and attaches req.user.
// Guarantees: next() is NEVER called unless req.user is a valid, existing User document.
export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token is empty' });
    }

    try {
        // Verify signature and expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Look up the actual user — catches deleted/disabled accounts
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            // Token was valid but the user no longer exists in the database
            return res.status(401).json({ message: 'Not authorized, account no longer exists' });
        }

        req.user = user;
        next();
    } catch (error) {
        // jwt.verify throws JsonWebTokenError, TokenExpiredError, NotBeforeError
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired, please log in again' });
        }
        // Malformed or invalid token
        console.warn(`[Auth] Token verification failed: ${error.message}`);
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

// ─── adminOnly ────────────────────────────────────────────────────────────────
// Must be used after protect. req.user is guaranteed to exist.
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Studio Admins only' });
};

// ─── clientOnly ───────────────────────────────────────────────────────────────
// Must be used after protect. req.user is guaranteed to exist.
export const clientOnly = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Clients only' });
};

// ─── projectParticipant ───────────────────────────────────────────────────────
// Must be used after protect. Allows admin (full access) or the assigned client.
export const projectParticipant = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID required' });
        }

        // Admins have full access to all projects
        if (req.user.role === 'admin') {
            return next();
        }

        const { default: Project } = await import('../models/Project.js');
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Client may only access their own project
        if (project.client.toString() !== req.user._id.toString()) {
            console.warn(`[Auth] Unauthorized project access: user=${req.user._id} project=${projectId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        req.project = project; // Pass project along to avoid re-querying in controller
        next();
    } catch (err) {
        console.error('[Auth] projectParticipant error:', err.message);
        return res.status(500).json({ message: 'Server error verifying project access' });
    }
};