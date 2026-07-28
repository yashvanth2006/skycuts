import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:projectId', protect, getMessages);

export default router;
