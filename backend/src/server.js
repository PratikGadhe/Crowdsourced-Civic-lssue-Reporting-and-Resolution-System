require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/reports', require('./routes/reports'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/engineers', require('./routes/engineers'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/feedback', require('./routes/feedback'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const serverInstance = server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  serverInstance.close(() => {
    console.log('Server closed');
  });
});

process.on('SIGINT', () => {
  serverInstance.close(() => {
    console.log('Server closed');
  });
});