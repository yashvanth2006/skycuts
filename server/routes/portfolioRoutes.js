import express from 'express';
import {
    getPublicPortfolio,
    getAllPortfolio,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} from '../controllers/portfolioController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public — no auth required
router.get('/public', getPublicPortfolio);

// Admin — all require authentication + admin role
router.get('/', protect, adminOnly, getAllPortfolio);
router.post('/', protect, adminOnly, createPortfolioItem);
router.put('/:id', protect, adminOnly, updatePortfolioItem);
router.delete('/:id', protect, adminOnly, deletePortfolioItem);

export default router;
