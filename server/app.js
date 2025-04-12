require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Model
const User = mongoose.model('User', {
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

// JWT Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route example
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', async ({ username, room }) => {
    socket.join(room);
    await User.updateOne({ username }, { $set: { online: true } });
    io.to(room).emit('userStatus', { username, online: true });
    socket.broadcast.to(room).emit('message', {
      user: 'System',
      text: `${username} joined the chat`,
      time: new Date().toISOString()
    });
  });

  socket.on('sendMessage', ({ room, message, username }) => {
    io.to(room).emit('message', {
      user: username,
      text: message,
      time: new Date().toISOString()
    });
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    // Mark user as offline in DB
    const rooms = Array.from(socket.rooms);
    if (rooms.length > 1) { // Skip the default room (socket.id)
      const room = rooms[1];
      const username = socket.handshake.auth.username;
      await User.updateOne({ username }, { $set: { online: false, lastSeen: new Date() } });
      io.to(room).emit('userStatus', { username, online: false });
    }
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});