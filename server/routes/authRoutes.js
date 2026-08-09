import express from 'express';
import { loginUser, registerUser, seedAdmin, googleLogin, completeProfile } from '../controllers/authController.js';
import { protect, clientOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed-admin', seedAdmin);
router.post('/google', googleLogin);
router.post('/complete-profile', protect, clientOnly, completeProfile);

export default router;