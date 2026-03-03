import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import { socketAuth } from './middleware/auth.js';
import Board from './models/board.js';
import boardRoutes from './routes/boardRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/board', boardRoutes);

io.use(socketAuth);
app.get('/', (req, res) => {
  res.send('WriteBoard API is running');
});


const drawBuffer = {}; 
const BUFFER_LIMIT = 40; 

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  socket.on("joinBoard", async (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.user.username} joined board: ${boardId}`);

    try {
      
      let board = await Board.findOne({ roomId: boardId });
      
      if (!board) {
        board = await Board.create({ roomId: boardId, name: "Untitled Board", owner: socket.user.id });
      }
      
      socket.emit("hydrate", board.history);
    } catch (err) {
      console.error("Error loading board:", err);
    }
  });

  socket.on("draw", async (data) => {
    const { boardId } = data;
    
    
    socket.to(boardId).emit("onDraw", data);

    
    if (!drawBuffer[boardId]) drawBuffer[boardId] = [];
    drawBuffer[boardId].push(data);

    
    if (drawBuffer[boardId].length >= BUFFER_LIMIT) {
      
      const strokesToSave = [...drawBuffer[boardId]];
      drawBuffer[boardId] = []; 

      try {
        
        await Board.findOneAndUpdate(
          { roomId: boardId },
          { $push: { history: { $each: strokesToSave } } }
        );
      } catch (err) {
        console.error("Error bulk saving strokes:", err);
      }
    }
  });


  socket.on("clearBoard", async (boardId) => {
    io.to(boardId).emit("onClear");
    drawBuffer[boardId] = [];
    
    try {
      await Board.findOneAndUpdate(
        { roomId: boardId },
        { $set: { history: [] } }
      );
    } catch (err) {
      console.error("Error clearing board:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));