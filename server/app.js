
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
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
app.use(cookieParser());

// MongoDB Connection with database creation
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  initializeDatabase();
})
.catch(err => console.error('MongoDB connection error:', err));

async function initializeDatabase() {
  try {
    // Create collections if they don't exist
    await mongoose.connection.db.createCollection('users');
    await mongoose.connection.db.createCollection('chatrooms');
    console.log('Database collections initialized');
  } catch (err) {
    console.log('Collections already exist or error:', err.message);
  }
}

// User Model
const User = mongoose.model('User', {
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  profile: {
    avatar: String,
    bio: String,
    themePreference: { type: String, default: 'light' }
  },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  chatRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }]
});

// ChatRoom Model
const ChatRoom = mongoose.model('ChatRoom', {
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// JWT Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });
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
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });
    
    res.json({ 
      token, 
      username: user.username,
      profile: user.profile 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Profile Routes
app.get('/api/users/:username', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:username', authenticate, async (req, res) => {
  try {
    const { bio, themePreference } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { 'profile.bio': bio, 'profile.themePreference': themePreference } },
      { new: true }
    ).select('-password -__v');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat Room Routes
app.post('/api/chatrooms', authenticate, async (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    const chatRoom = new ChatRoom({
      name,
      createdBy: req.user.userId,
      isPrivate
    });
    await chatRoom.save();
    
    // Add chat room to user's chatRooms array
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { chatRooms: chatRoom._id }
    });
    
    res.status(201).json(chatRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chatrooms', authenticate, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find()
      .populate('createdBy', 'username profile.avatar')
      .populate('participants', 'username profile.avatar');
    res.json(chatRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    const rooms = Array.from(socket.rooms);
    if (rooms.length > 1) {
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