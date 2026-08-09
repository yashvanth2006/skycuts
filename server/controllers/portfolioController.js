import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';

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
        const { title, description, category, thumbnail, videoUrl, isPublished, order } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const item = await Portfolio.create({
            editor: req.user._id,
            title,
            description,
            category,
            thumbnail,
            videoUrl,
            isPublished: isPublished ?? false,
            order: order ?? 0,
        });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error creating portfolio item' });
    }
};

// @desc  Update a portfolio item (admin)
// @route PUT /api/portfolio/:id
export const updatePortfolioItem = async (req, res) => {
    try {
        const item = await Portfolio.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error updating portfolio item' });
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
