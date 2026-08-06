import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc   Get all comments for a project
// @route  GET /api/comments/:projectId
export const getComments = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await Comment.find({ project: projectId })
        .populate('author', 'name role')
        .sort({ timestamp: 1 });

    res.json(comments);
};

// @desc   Add a comment to a project
// @route  POST /api/comments/:projectId
export const addComment = async (req, res) => {
    const { projectId } = req.params;
    const { timestamp, text } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await Comment.create({
        project: projectId,
        author: req.user._id,
        timestamp: timestamp || 0,
        text,
    });

    const populated = await comment.populate('author', 'name role');

    // Send notification to the other party
    let recipientId = null;
    if (req.user.role === 'admin' && project.client) {
        // Admin commented - notify client
        recipientId = project.client;
    } else if (req.user.role === 'client') {
        // Client commented - notify admin (Yashvanth)
        const admin = await User.findOne({ role: 'admin' });
        if (admin) recipientId = admin._id;
    }

    if (recipientId && recipientId.toString() !== req.user._id.toString()) {
        await createNotification(
            recipientId,
            'new_comment',
            'New Comment Added',
            `${req.user.name} added a comment on "${project.title}"`,
            projectId,
            req.user.role === 'admin' 
                ? `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/project/${projectId}`
                : `${process.env.CLIENT_URL || 'http://localhost:5173'}/profile/project/${projectId}`
        );
    }

    res.status(201).json(populated);
};

// @desc   Delete a comment (author or admin)
// @route  DELETE /api/comments/:commentId
export const deleteComment = async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
};
