import express from 'express';
import { createOrder, verifyPayment, webhookHandler } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order/:projectId', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Webhook endpoint (authentication handled by signature verification in controller)
// Note: raw body parsing is applied in server/index.js before reaching here
router.post('/webhook', webhookHandler);

export default router;
