import jwt from jsonwebtoken;
import user from "../models/user.js";

export const protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization &&  req.headers.authorization.startsWith('Bearer')) {
        try{
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized');
        }
        if(!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }
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