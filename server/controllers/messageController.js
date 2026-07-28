import Message from '../models/Message.js';
import Project from '../models/Project.js';

// @desc   Get all messages for a project (auth + scoped)
// @route  GET /api/messages/:projectId
export const getMessages = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ project: projectId })
        .populate('sender', 'name role')
        .sort({ createdAt: 1 });

    res.json(messages);
};
