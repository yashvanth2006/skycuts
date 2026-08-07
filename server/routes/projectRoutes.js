import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    submitRawAssets,
    updateProjectStatus,
    getAllClients,
    createProjectRequest,
    archiveProject,
    restoreProject,
    getArchivedProjects,
    getProjectAnalytics,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route for project requests (no auth required)
router.post('/request', createProjectRequest);

router.get('/clients', protect, adminOnly, getAllClients);
router.get('/archived', protect, adminOnly, getArchivedProjects);
router.get('/analytics', protect, adminOnly, getProjectAnalytics);
router.route('/').get(protect, getProjects).post(protect, adminOnly, createProject);
router.route('/:id').get(protect, getProjectById);
router.post('/:id/assets', protect, submitRawAssets);
router.patch('/:id/status', protect, adminOnly, updateProjectStatus);
router.patch('/:id/archive', protect, adminOnly, archiveProject);
router.patch('/:id/restore', protect, adminOnly, restoreProject);

export default router;
