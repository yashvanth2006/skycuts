import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    submitRawAssets,
    updateProjectStatus,
    getAllClients,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/clients', protect, adminOnly, getAllClients);
router.route('/').get(protect, getProjects).post(protect, adminOnly, createProject);
router.route('/:id').get(protect, getProjectById);
router.post('/:id/assets', protect, submitRawAssets);
router.patch('/:id/status', protect, adminOnly, updateProjectStatus);

export default router;
