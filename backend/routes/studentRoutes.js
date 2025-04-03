const express = require('express');
const router = express.Router();
const { isStudent } = require('../auth');
const studentController = require('../controllers/studentController');
const { validateSelfAttendance } = require('../middlewares');

// Apply student middleware to all routes
router.use(isStudent);

// Student dashboard data
router.get('/dashboard', studentController.getDashboardData);

// Course information
router.get('/courses', studentController.getCourses);
router.get('/courses/:id', studentController.getCourseDetails);

// Attendance information
router.get('/attendance', studentController.getAttendance);
router.get('/attendance/course/:courseId', studentController.getCourseAttendance);
router.post('/attendance/mark', validateSelfAttendance, studentController.markAttendance);

// Session information
router.get('/sessions', studentController.getSessions);
router.get('/sessions/:id', studentController.getSessionDetails);
router.get('/sessions/upcoming', studentController.getUpcomingSessions);

module.exports = router;
