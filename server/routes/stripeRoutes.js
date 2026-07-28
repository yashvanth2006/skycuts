import express from 'express';
import { createCheckoutSession, webhookHandler } from '../controllers/stripeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook MUST use raw body — mounted before express.json() in index.js
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.post('/checkout/:projectId', protect, createCheckoutSession);

export default router;
