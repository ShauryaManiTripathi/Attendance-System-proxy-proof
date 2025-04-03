const express = require('express');
const router = express.Router();
const { 
  validateRequestBody, 
  validateFacultySignup, 
  validateStudentSignup, 
  validateLoginRequest,
  facultyLogin,
  studentLogin
} = require('../auth');
const authController = require('../controllers/authController');

// Middlewares used:
// - validateRequestBody
// - validateFacultySignup
// - validateStudentSignup
// - validateLoginRequest
// - facultyLogin
// - studentLogin

// Faculty routes
router.post('/faculty/signup', 
  validateRequestBody,
  validateFacultySignup, 
  authController.facultySignup
);

router.post('/faculty/login', 
  validateRequestBody,
  validateLoginRequest, 
  facultyLogin
);

// Student routes
router.post('/student/signup', 
  validateRequestBody,
  validateStudentSignup, 
  authController.studentSignup
);

router.post('/student/login', 
  validateRequestBody,
  validateLoginRequest, 
  studentLogin
);

module.exports = router;
