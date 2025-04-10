const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler, requestLogger, notFound } = require('./middlewares');
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const { authenticate } = require('./auth');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://leoosarah:QDH4wpYoAz0wdnHo@attend.iviwm.mongodb.net/AS?retryWrites=true&w=majority&appName=attend")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', authenticate, facultyRoutes);
app.use('/api/student', authenticate, studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly' });
});

// Protected test route for testing auth
app.get('/api/protected-route', authenticate, (req, res) => {
  res.json({ message: 'You have access to this protected route', user: req.user });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
