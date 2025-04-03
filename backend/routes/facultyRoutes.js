const express = require('express');
const router = express.Router();
const { isFaculty } = require('../auth');
const facultyController = require('../controllers/facultyController');
const attendanceController = require('../controllers/attendanceController');
const { validateAttendanceData } = require('../middlewares');

// Middlewares used:
// - isFaculty (applied to all routes)
// - validateAttendanceData (only for recording attendance)

// Apply faculty middleware to all routes
router.use(isFaculty);

// Faculty dashboard data
router.get('/dashboard', facultyController.getDashboardData);

// Course management
router.get('/courses', facultyController.getCourses);
router.get('/courses/:id', facultyController.getCourseById);
router.get('/courses/:id/attendance', attendanceController.getCourseAttendanceReport);

// Session management
router.get('/sessions', facultyController.getSessions);
router.post('/sessions', facultyController.createSession);
router.get('/sessions/:id', facultyController.getSessionById);

// Attendance management
router.get('/sessions/:id/attendance', facultyController.getSessionAttendance);
router.post('/sessions/:id/attendance', validateAttendanceData, facultyController.recordAttendance);

// Students
router.get('/students', facultyController.getStudents);

// Report routes - use attendance controller for these
router.get('/students/:id/attendance', attendanceController.getStudentAttendanceReport);
router.get('/sessions/:id/report', attendanceController.getSessionAttendanceReport);

module.exports = router;
