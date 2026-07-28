import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/:projectId').get(protect, getComments).post(protect, addComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
