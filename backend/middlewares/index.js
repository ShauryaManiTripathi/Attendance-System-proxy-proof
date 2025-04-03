// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: errors });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key error' });
  }

  // JWT errors are handled in auth middleware

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Validate attendance data middleware
const validateAttendanceData = (req, res, next) => {
  const { sessionId, attendanceData } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
    return res.status(400).json({ error: 'Attendance data must be a non-empty array' });
  }
  
  // Validate each attendance record
  for (const record of attendanceData) {
    if (!record.studentId) {
      return res.status(400).json({ error: 'Each record must have a studentId' });
    }
    
    if (!record.status || !['present', 'absent', 'late'].includes(record.status)) {
      return res.status(400).json({ error: 'Status must be present, absent, or late' });
    }
  }
  
  next();
};

// Validate self attendance data middleware
const validateSelfAttendance = (req, res, next) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  next();
};

module.exports = {
  errorHandler,
  requestLogger,
  notFound,
  validateAttendanceData,
  validateSelfAttendance
};
