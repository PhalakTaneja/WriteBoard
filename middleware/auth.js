import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization &&  req.headers.authorization.startsWith('Bearer')) {
        try{
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            console.log("Token verified, moving to route");
            next();
        } catch (error) {
            console.log("Token verification failed:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    else{
            res.status(401).json({ message: 'No token present hence authorization failed.' });
    }
}

export const admin = (req, res, next) => {
    if(req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
}

export const socketAuth = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err) {
                next(new Error('Authentication error'));
            } else {
                socket.user = decoded;
                next();
            }
        });
    } else {
        next(new Error('Authentication error'));
    }
}