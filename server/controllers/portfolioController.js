import fs from 'fs';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import { uploadLargeVideo, uploadMedia } from '../services/cloudinaryService.js';

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// @desc  Get all published portfolio items (public)
// @route GET /api/portfolio/public
export const getPublicPortfolio = async (req, res) => {
    try {
        const items = await Portfolio.find({ isPublished: true })
            .sort({ order: 1, createdAt: -1 })
            .populate('editor', 'name email');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching portfolio' });
    }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// @desc  Get ALL portfolio items (admin — includes unpublished)
// @route GET /api/portfolio
export const getAllPortfolio = async (req, res) => {
    try {
        const items = await Portfolio.find({})
            .sort({ order: 1, createdAt: -1 })
            .populate('editor', 'name email');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching portfolio' });
    }
};

// @desc  Create a portfolio item (admin)
// @route POST /api/portfolio
export const createPortfolioItem = async (req, res) => {
    try {
        const { title, description, category, isPublished, order } = req.body;
        let { thumbnail, videoUrl } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;
        const thumbnailFile = files['thumbnail'] ? files['thumbnail'][0] : null;
        const folder = 'skycuts/portfolio';

        if (videoFile) {
            const cloudResult = await uploadLargeVideo(videoFile.path, folder);
            videoUrl = cloudResult.secure_url;
            fs.unlinkSync(videoFile.path);
        }

        if (thumbnailFile) {
            const cloudResult = await uploadMedia(thumbnailFile.path, folder, 'image');
            thumbnail = cloudResult.secure_url;
            fs.unlinkSync(thumbnailFile.path);
        }

        const item = await Portfolio.create({
            editor: req.user._id,
            title,
            description,
            category,
            thumbnail,
            videoUrl,
            isPublished: isPublished === 'true' || isPublished === true,
            order: order ? Number(order) : 0,
        });
        res.status(201).json(item);
    } catch (err) {
        if (req.files) {
            Object.values(req.files).flat().forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        res.status(500).json({ message: 'Server error creating portfolio item', error: err.message });
    }
};

// @desc  Update a portfolio item (admin)
// @route PUT /api/portfolio/:id
export const updatePortfolioItem = async (req, res) => {
    try {
        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;
        const thumbnailFile = files['thumbnail'] ? files['thumbnail'][0] : null;
        const folder = 'skycuts/portfolio';
        const updateData = { ...req.body };
        
        if (updateData.isPublished === 'true') updateData.isPublished = true;
        if (updateData.isPublished === 'false') updateData.isPublished = false;
        if (updateData.order !== undefined) updateData.order = Number(updateData.order);

        if (videoFile) {
            const cloudResult = await uploadLargeVideo(videoFile.path, folder);
            updateData.videoUrl = cloudResult.secure_url;
            fs.unlinkSync(videoFile.path);
        }

        if (thumbnailFile) {
            const cloudResult = await uploadMedia(thumbnailFile.path, folder, 'image');
            updateData.thumbnail = cloudResult.secure_url;
            fs.unlinkSync(thumbnailFile.path);
        }

        const item = await Portfolio.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
        res.json(item);
    } catch (err) {
        if (req.files) {
            Object.values(req.files).flat().forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        res.status(500).json({ message: 'Server error updating portfolio item', error: err.message });
    }
};

// @desc  Delete a portfolio item (admin)
// @route DELETE /api/portfolio/:id
export const deletePortfolioItem = async (req, res) => {
    try {
        const item = await Portfolio.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
        res.json({ message: 'Portfolio item deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting portfolio item' });
    }
};
