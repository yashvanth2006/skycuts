import express from 'express';
import { loginUser, registerUser, seedEditor, forgotPassword, resetPassword, completeOnboarding, bulkCreateClients } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { strictLimiter, moderateLimiter, bulkLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', strictLimiter, loginUser);
router.post('/register', moderateLimiter, registerUser);
router.post('/seed-editor', seedEditor);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password/:token', strictLimiter, resetPassword);
router.post('/complete-onboarding', protect, completeOnboarding);
router.post('/bulk-create-clients', protect, bulkLimiter, bulkCreateClients);

export default router;