import express from 'express';
import httpServer from 'http';
import { Server } from 'socket.io';

const app = express();
const server = httpServer.createServer(app);
const io = new Server(server);


app.use(express.static('public'));

let connectedUsers = [];
io.on('connection', (socket) => {
    connectedUsers.push(socket.id);
    console.log(`User connected: ${socket.id}`);

    socket.on('draw', (data) => {
        connectedUsers.forEach(id => {
            if (id !== socket.id) {
                io.to(id).emit('onDraw', {x: data.x, y: data.y});
            }
        });
    });
    socket.on('mouseDown', (data) => {
        connectedUsers.forEach(id => {
            if (id !== socket.id) { 
                io.to(id).emit('mouseDown', {x: data.x, y: data.y});    
            }
        });
    });
    socket.on('mouseUp', (data) => {
        connectedUsers.forEach(id => {
            if (id !== socket.id) { 
                io.to(id).emit('mouseUp', {x: data.x, y: data.y});    
            }
        });
        //socket.broadcast.emit('mouseUp', data);
    });

    socket.on('disconnect', (reason) => {
        connectedUsers = connectedUsers.filter(id => id !== socket.id);
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(8080, () => {
    console.log(`Server is running on port 8080`);
});