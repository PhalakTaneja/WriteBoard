import express from 'express';
import httpServer from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();
connectDB();
const app = express();
const server = httpServer.createServer(app);
const io = new Server(server);


app.use(express.static('public'));
const boards = {};

let connectedUsers = [];
io.on('connection', (socket) => {
    //connectedUsers.push(socket.id);
    console.log(`User connected: ${socket.id}`);

    socket.on("joinBoard", ({ boardId, username }) => {
    socket.join(boardId);
    socket.boardId = boardId;
    socket.username = username;

    if (!boards[boardId]) {
      boards[boardId] = [];
    }
    socket.emit("hydrate", boards[boardId]);
  });

  socket.on("clearBoard", () => {
  if (!socket.boardId || !boards[socket.boardId]) {
    console.error("Clear received before board join");
    return;
  }

  boards[socket.boardId] = [];

  io.to(socket.boardId).emit("onClear");
});
  
  socket.on("draw", ({ x, y, type }) => {
    if (!socket.boardId || !boards[socket.boardId]) {
      console.error("Draw received before board join");
      return;
    }

    const event = {
      x,
      y,
      type,
      user: socket.username,
    };
    boards[socket.boardId].push(event);

    socket.to(socket.boardId).emit("onDraw", event);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});

//error handling (just to be safe although not needed)

io.on("connection", (socket) => {
  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});
io.engine.on("connection_error", (err) => {
  console.error("Engine connection error:");
  console.error(err.message);
  console.error(err.context);
});
