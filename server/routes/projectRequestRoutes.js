import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    res.status(501).json({ message: 'Not Implemented - Project Request routes are planned for a future module.' });
});

router.get('/', (req, res) => {
    res.status(501).json({ message: 'Not Implemented - Project Request routes are planned for a future module.' });
});

router.patch('/:id/accept', (req, res) => {
    res.status(501).json({ message: 'Not Implemented - Project Request routes are planned for a future module.' });
});

router.patch('/:id/reject', (req, res) => {
    res.status(501).json({ message: 'Not Implemented - Project Request routes are planned for a future module.' });
});

export default router;
