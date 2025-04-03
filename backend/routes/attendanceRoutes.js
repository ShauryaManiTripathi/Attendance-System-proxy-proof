const express = require('express');
const router = express.Router();
const { authenticate, isFaculty, isStudent } = require('../auth');
const attendanceController = require('../controllers/attendanceController');

// Middlewares used:
// - authenticate (for all routes)
// - isFaculty (for faculty-specific routes) 
// - isStudent (for student-specific routes)

// Routes accessible by both faculty and students
router.get('/sessions/:id', authenticate, attendanceController.getSessionDetails);

// Faculty-specific routes
router.post('/mark', authenticate, isFaculty, attendanceController.markAttendance);
router.put('/update/:id', authenticate, isFaculty, attendanceController.updateAttendance);
router.get('/report/course/:courseId', authenticate, isFaculty, attendanceController.getCourseAttendanceReport);
router.get('/report/student/:studentId', authenticate, isFaculty, attendanceController.getStudentAttendanceReport);
router.get('/report/session/:sessionId', authenticate, isFaculty, attendanceController.getSessionAttendanceReport);

// Student-specific routes
router.get('/my-attendance', authenticate, isStudent, attendanceController.getMyAttendance);
router.get('/my-attendance/:courseId', authenticate, isStudent, attendanceController.getMyCourseAttendance);
router.post('/self-mark', authenticate, isStudent, attendanceController.selfMarkAttendance);

module.exports = router;
