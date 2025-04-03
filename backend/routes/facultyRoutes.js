const express = require('express');
const router = express.Router();
const { isFaculty } = require('../auth');
const facultyController = require('../controllers/facultyController');

// Apply faculty middleware to all routes
router.use(isFaculty);

// Faculty dashboard data
router.get('/dashboard', facultyController.getDashboardData);

// Course management
router.get('/courses', facultyController.getCourses);
router.get('/courses/:id', facultyController.getCourseById);

// Session management
router.get('/sessions', facultyController.getSessions);
router.post('/sessions', facultyController.createSession);
router.get('/sessions/:id', facultyController.getSessionById);

// Attendance management
router.get('/sessions/:id/attendance', facultyController.getSessionAttendance);
router.post('/sessions/:id/attendance', facultyController.recordAttendance);

// Students
router.get('/students', facultyController.getStudents);

module.exports = router;
