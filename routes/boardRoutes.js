import express from 'express';
import Board from '../models/board.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.post('/create', protect, async (req, res) => {
    try {
        const { roomId, name } = req.body;
        const boardExists = await Board.findOne({ roomId });
        if(boardExists) {
            return res.status(400).json({ message: 'Room ID already taken.' });
        }
        const board = await Board.create({ roomId: roomId || `room-${Date.now()}`, name: name || 'Untitled Board', owner: req.user._id, history: [] });
        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating a board.' });
    }
});

router.get('/my-boards', protect, async (req, res) => {
    try {
        const boards = await Board.find({ owner: req.user._id });
        res.json(boards);
    }catch (error) {
        res.status(500).json({ message: 'Server error fetching boards.' });
    }
});

router.delete('/delete/:roomId', protect, async (req, res) => {
    try {
        const { roomId } = req.params;
        const board = await Board.findOne({ roomId });
        if(!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }
        if(board.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this board.' });
        }
        await board.deleteOne({ roomId });
        res.status(200).json({ message: `Board '${roomId}' deleted successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting the board.' });
    }
});

export default router;