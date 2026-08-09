import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect, projectParticipant } from '../middleware/auth.js';

const router = express.Router();

router.route('/:projectId').get(protect, projectParticipant, getComments).post(protect, projectParticipant, addComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
