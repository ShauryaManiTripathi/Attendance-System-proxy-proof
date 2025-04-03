const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passwordUtils = require('./passwordUtils');

// Try to load bcrypt, but gracefully fall back if it fails
let bcrypt;
try {
  bcrypt = require('bcryptjs');
  console.log('bcrypt loaded successfully');
} catch (error) {
  console.warn('bcrypt module failed to load, using fallback password utilities');
  bcrypt = null;
}

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
const generateToken = (user) => {
  try {
    if (!user || !user._id) {
      throw new Error('Invalid user data for token generation');
    }
    
    // Create the payload
    const payload = { 
      id: user._id, 
      role: user.employeeId ? 'faculty' : 'student',
      // Add a unique identifier to prevent token reuse
      jti: crypto.randomBytes(16).toString('hex'),
      // Add issued at timestamp in the payload instead of options
      iat: Math.floor(Date.now() / 1000)
    };
    
    // Sign the token with just the expiration in the options
    return jwt.sign(
      payload, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }
    
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Let the calling function handle different types of JWT errors
    throw error;
  }
};

// Compare password with hashed password
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) {
      throw new Error('Missing password data for comparison');
    }
    
    // Use bcrypt if available, otherwise use fallback
    if (bcrypt) {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } else {
      return await passwordUtils.comparePassword(plainPassword, hashedPassword);
    }
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Password verification failed');
  }
};

// Hash password
const hashPassword = async (plainPassword) => {
  try {
    if (!plainPassword) {
      throw new Error('Missing password data for hashing');
    }
    
    // Use bcrypt if available, otherwise use fallback
    if (bcrypt) {
      const saltRounds = 10;
      return await bcrypt.hash(plainPassword, saltRounds);
    } else {
      return await passwordUtils.hashPassword(plainPassword);
    }
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Password hashing failed');
  }
};

// Generate a secure random reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  comparePassword,
  hashPassword,
  generateResetToken
};
