import express from 'express';

const router = express.Router();

router.get('/public', (req, res) => {
    res.status(501).json({ message: 'Not Implemented - Portfolio routes are planned for a future module.' });
});

export default router;
