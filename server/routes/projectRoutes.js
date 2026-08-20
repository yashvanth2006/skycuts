import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    submitRawAssets,
    deleteRawAssets,
    updateProjectStatus,
    updateProjectPrice,
    getAllClients,
} from '../controllers/projectController.js';
import { protect, adminOnly, projectParticipant } from '../middleware/auth.js';

const router = express.Router();

router.get('/clients', protect, adminOnly, getAllClients);
router.route('/').get(protect, getProjects).post(protect, adminOnly, createProject);
router.route('/:id').get(protect, projectParticipant, getProjectById);
router.post('/:id/assets', protect, projectParticipant, submitRawAssets);
router.delete('/:id/assets', protect, projectParticipant, deleteRawAssets);
router.patch('/:id/status', protect, adminOnly, updateProjectStatus);
router.patch('/:id/price', protect, adminOnly, updateProjectPrice);

export default router;
