import express from 'express';
import { loginUser, registerUser, seedEditor } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed-editor', seedEditor);

export default router;