import express from 'express';
import { loginUser, registerUser, seedEditor, forgotPassword, resetPassword, completeOnboarding, bulkCreateClients } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed-editor', seedEditor);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/complete-onboarding', protect, completeOnboarding);
router.post('/bulk-create-clients', protect, bulkCreateClients);

export default router;