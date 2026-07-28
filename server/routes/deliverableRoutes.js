import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadDeliverable, getDeliverable, getDownloadUrl } from '../controllers/deliverableController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer disk storage — store raw uploads in /uploads/raw/
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
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'video/mp4') cb(null, true);
        else cb(new Error('Only .mp4 files are accepted'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit
});

const router = express.Router();

router.post('/:projectId', protect, adminOnly, upload.single('video'), uploadDeliverable);
router.get('/:projectId', protect, getDeliverable);
router.get('/:projectId/download', protect, getDownloadUrl);

export default router;
