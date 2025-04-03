const express = require('express');
const router = express.Router();
const { isStudent } = require('../auth');
const studentController = require('../controllers/studentController');

// Apply student middleware to all routes
router.use(isStudent);

// Student dashboard data
router.get('/dashboard', studentController.getDashboardData);

// Course information
router.get('/courses', studentController.getCourses);

// Attendance information
router.get('/attendance', studentController.getAttendance);

// Session information
router.get('/sessions', studentController.getSessions);

module.exports = router;
