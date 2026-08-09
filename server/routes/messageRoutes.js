import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import { protect, projectParticipant } from '../middleware/auth.js';

const router = express.Router();

router.get('/:projectId', protect, projectParticipant, getMessages);

export default router;
