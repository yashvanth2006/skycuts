import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    getPublicPortfolio,
    getAllPortfolio,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} from '../controllers/portfolioController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'raw'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit
});

const uploadFields = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

const router = express.Router();

// Public — no auth required
router.get('/public', getPublicPortfolio);

// Admin — all require authentication + admin role
router.get('/', protect, adminOnly, getAllPortfolio);
router.post('/', protect, adminOnly, uploadFields, createPortfolioItem);
router.put('/:id', protect, adminOnly, uploadFields, updatePortfolioItem);
router.delete('/:id', protect, adminOnly, deletePortfolioItem);

export default router;
