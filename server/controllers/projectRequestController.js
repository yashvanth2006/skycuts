import ProjectRequest from '../models/ProjectRequest.js';
import Project from '../models/Project.js';

// ─── CLIENT ──────────────────────────────────────────────────────────────────

// @desc  Client submits a project request
// @route POST /api/project-requests
export const submitRequest = async (req, res) => {
    try {
        const { title, type, description, requirements, deadline } = req.body;

        if (!title || !type) {
            return res.status(400).json({ message: 'Title and project type are required' });
        }

        const request = await ProjectRequest.create({
            client: req.user._id,
            title,
            type,
            description,
            requirements,
            deadline: deadline || undefined,
            status: 'pending',
        });

        const populated = await request.populate('client', 'name email mobileNumber');
        res.status(201).json(populated);
    } catch (err) {
        console.error('submitRequest error:', err);
        res.status(500).json({ message: 'Server error submitting request' });
    }
};

// ─── SHARED ──────────────────────────────────────────────────────────────────

// @desc  Get project requests — admin: all, client: own only
// @route GET /api/project-requests
export const getRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === 'admin') {
            requests = await ProjectRequest.find({})
                .populate('client', 'name email mobileNumber')
                .sort({ status: 1, createdAt: -1 });
        } else {
            requests = await ProjectRequest.find({ client: req.user._id })
                .populate('client', 'name email mobileNumber')
                .sort({ createdAt: -1 });
        }
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// @desc  Get authenticated client's own requests only
// @route GET /api/project-requests/my
export const getMyRequests = async (req, res) => {
    try {
        const requests = await ProjectRequest.find({ client: req.user._id })
            .populate('client', 'name email mobileNumber')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// @desc  Get single project request — scoped to owner or admin
// @route GET /api/project-requests/:id
export const getRequestById = async (req, res) => {
    try {
        const request = await ProjectRequest.findById(req.params.id)
            .populate('client', 'name email mobileNumber');

        if (!request) {
            return res.status(404).json({ message: 'Project request not found' });
        }

        if (req.user.role !== 'admin' && request.client._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(request);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching request' });
    }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// @desc  Admin accepts a project request → creates a Project record
// @route PATCH /api/project-requests/:id/accept
export const acceptRequest = async (req, res) => {
    try {
        const request = await ProjectRequest.findById(req.params.id)
            .populate('client', 'name email');

        if (!request) {
            return res.status(404).json({ message: 'Project request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        // Check if a project already exists for this request
        const existingProject = await Project.findOne({ projectRequest: request._id });
        if (existingProject) {
            return res.status(409).json({ message: 'Project already exists for this request' });
        }

        // Mark request as accepted
        request.status = 'accepted';
        request.editor = req.user._id;
        await request.save();

        // Auto-create the Project linked to this request
        const project = await Project.create({
            title: request.title,
            description: request.description,
            client: request.client._id,
            projectRequest: request._id,
            price: 0,
            status: 'awaiting_assets',
        });

        const populatedProject = await project.populate('client', 'name email');

        res.json({
            projectRequest: request,
            project: populatedProject,
        });
    } catch (err) {
        console.error('acceptRequest error:', err);
        res.status(500).json({ message: 'Server error accepting request' });
    }
};

// @desc  Admin rejects a project request
// @route PATCH /api/project-requests/:id/reject
export const rejectRequest = async (req, res) => {
    try {
        const request = await ProjectRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Project request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        request.status = 'rejected';
        await request.save();

        res.json(request);
    } catch (err) {
        res.status(500).json({ message: 'Server error rejecting request' });
    }
};
