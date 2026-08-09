import express from 'express';
import {
    submitRequest,
    getRequests,
    getRequestById,
    acceptRequest,
    rejectRequest,
} from '../controllers/projectRequestController.js';
import { protect, adminOnly, clientOnly } from '../middleware/auth.js';

const router = express.Router();

// Client submits a new request
router.post('/', protect, clientOnly, submitRequest);

// Admin: all requests — Client: own requests only
router.get('/', protect, getRequests);

// Single request (owner or admin)
router.get('/:id', protect, getRequestById);

// Admin actions
router.patch('/:id/accept', protect, adminOnly, acceptRequest);
router.patch('/:id/reject', protect, adminOnly, rejectRequest);

export default router;
