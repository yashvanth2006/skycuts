import express from 'express';
import { loginUser, registerUser, seedEditor, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed-editor', seedEditor);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;