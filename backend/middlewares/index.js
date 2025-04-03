// This file will export middleware functions

// Example authentication middleware
const authenticate = (req, res, next) => {
  // Authentication logic will go here
  next();
};

// Example error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

module.exports = {
  authenticate,
  errorHandler
};
