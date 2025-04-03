const jwt = require('jsonwebtoken');
const { Faculty, Student } = require('../schemas');
const { verifyToken } = require('./utils');
const mongoose = require('mongoose');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify authentication token
const authenticate = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check header format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authentication format' });
    }
    
    // Get token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Token verification failed' });
      }
    }
    
    // Validate decoded token structure
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    
    // Set user information in request object
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Middleware to check if user is a faculty
const isFaculty = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied. Faculty permission required' });
  }
  
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Verify faculty exists
    const faculty = await Faculty.findById(req.user.id).catch(err => {
      console.error('Database error during faculty lookup:', err);
      throw new Error('Database error during authorization');
    });
    
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty account not found' });
    }
    
    // Add faculty info to request for later use
    req.faculty = faculty;
    
    next();
  } catch (error) {
    console.error('Faculty authorization error:', error);
    return res.status(500).json({ error: 'Server error during authorization' });
  }
};

// Middleware to check if user is a student
const isStudent = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student permission required' });
  }
  
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Verify student exists
    const student = await Student.findById(req.user.id).catch(err => {
      console.error('Database error during student lookup:', err);
      throw new Error('Database error during authorization');
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student account not found' });
    }
    
    // Add student info to request for later use
    req.student = student;
    
    next();
  } catch (error) {
    console.error('Student authorization error:', error);
    return res.status(500).json({ error: 'Server error during authorization' });
  }
};

module.exports = {
  authenticate,
  isFaculty,
  isStudent
};
