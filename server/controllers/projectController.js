import Project from '../models/Project.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWelcomeEmail } from '../utils/emailHelper.js';

// @desc   Create a new project (Admin only)
// @route  POST /api/projects
export const createProject = async (req, res) => {
    const { title, description, clientId, price } = req.body;

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
        return res.status(404).json({ message: 'Client user not found' });
    }

    const project = await Project.create({
        title,
        description,
        client: clientId,
        price: price || 0,
    });

    const populated = await project.populate('client', 'name email');
    res.status(201).json(populated);
};

// @desc   Get all projects — admin sees all, client sees own
// @route  GET /api/projects
export const getProjects = async (req, res) => {
    let projects;
    if (req.user.role === 'admin') {
        projects = await Project.find({}).populate('client', 'name email').sort({ createdAt: -1 });
    } else {
        projects = await Project.find({ client: req.user._id }).populate('client', 'name email').sort({ createdAt: -1 });
    }
    res.json(projects);
};

// @desc   Get single project by ID (scoped)
// @route  GET /api/projects/:id
export const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id).populate('client', 'name email');

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Multi-tenancy: clients can only access their own projects
    if (req.user.role === 'client' && project.client._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
};

// @desc   Client submits raw asset URLs
// @route  POST /api/projects/:id/assets
export const submitRawAssets = async (req, res) => {
    const { assets } = req.body; // [{ url, label }]

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    project.rawAssets.push(...assets);
    if (project.status === 'awaiting_assets') {
        project.status = 'in_progress';
    }
    await project.save();
    res.json(project);
};

// @desc   Admin updates project status (with auto-client onboarding for pending projects)
// @route  PATCH /api/projects/:id/status
export const updateProjectStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'awaiting_assets', 'in_progress', 'in_review', 'paid', 'declined'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const project = await Project.findById(req.params.id).populate('client', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Auto-client onboarding: if accepting a pending project from a non-registered user
    if (status === 'awaiting_assets' && project.status === 'pending' && !project.client) {
        const { requesterName, requesterEmail } = project;
        
        // Check if user was created since the project request
        let existingUser = await User.findOne({ email: requesterEmail });
        
        if (!existingUser) {
            // Generate temporary password
            const tempPassword = `SkyCuts${crypto.randomBytes(4).toString('hex')}`;
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            
            // Create new client account
            existingUser = await User.create({
                name: requesterName,
                email: requesterEmail,
                password: hashedPassword,
                role: 'client',
            });
            
            // Send welcome email with credentials
            await sendWelcomeEmail(requesterEmail, requesterName, tempPassword);
        }
        
        // Link project to the client
        project.client = existingUser._id;
        project.requesterName = '';
        project.requesterEmail = '';
        await project.save();
    }

    project.status = status;
    await project.save();
    
    await project.populate('client', 'name email');
    res.json(project);
};

// @desc   Create a public project request (no auth required)
// @route  POST /api/projects/request
export const createProjectRequest = async (req, res) => {
    const { name, email, title, description, assetLink } = req.body;

    if (!name || !email || !title) {
        return res.status(400).json({ message: 'Name, email, and project title are required' });
    }

    // Check if a user with this email already exists (potential client)
    let existingUser = await User.findOne({ email });
    
    const project = await Project.create({
        title,
        description: description || '',
        client: existingUser?._id || null,
        status: 'pending',
        requesterName: name,
        requesterEmail: email,
        assetLink: assetLink || '',
        price: 0,
    });

    // If we populated client, include it in response
    if (existingUser) {
        await project.populate('client', 'name email');
    }

    res.status(201).json(project);
};

// @desc   Get all client users (Admin only, for project creation dropdown)
// @route  GET /api/projects/clients
export const getAllClients = async (req, res) => {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ name: 1 });
    res.json(clients);
};
