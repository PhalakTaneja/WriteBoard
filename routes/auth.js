import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({username});
        if(userExists) return res.status(400).json({ message: 'Username already exists' });
        const user = await User.create({ username, password });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(user && !(await user.matchPassword(password))) {
            return res.status(404).json({ message: 'Redacted for obvious reasons' });
        }
        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log("Password match?:", isMatch ? "Yes!" : "No");
        }
        if(user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            }); 
        }else{
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch(error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/delete', protect, async (req, res) => {
    console.log("Delete request received for user ID:", req.user._id);
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await User.deleteOne({ _id: req.user._id });

        res.status(200).json({ message: 'Account successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;