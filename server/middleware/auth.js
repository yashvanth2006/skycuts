import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload (excluding the password)
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Studio Admins only' });
    }
};

export const clientOnly = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Clients only' });
    }
};

export const projectParticipant = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID required' });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        const { default: Project } = await import('../models/Project.js');
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.project = project; // Pass project along to avoid re-querying
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server Error verifying project access' });
    }
};