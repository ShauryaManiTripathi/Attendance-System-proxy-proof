const { 
  Course, 
  Group, 
  Session, 
  Student, 
  GroupStudent,
  GroupCourse,
  Attendance 
} = require('../schemas');

// Get dashboard data
const getDashboardData = async (req, res, next) => {
  try {
    const facultyId = req.faculty._id;

    // Get courses taught by this faculty
    const groupCourses = await GroupCourse.find({ faculty: facultyId })
      .populate('course group');
    
    // Get unique groups
    const groups = [...new Set(groupCourses.map(gc => gc.group._id))];
    
    // Get students in these groups
    const studentCount = await GroupStudent.countDocuments({ group: { $in: groups } });
    
    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySessions = await Session.countDocuments({
      faculty: facultyId,
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Get pending tasks (sessions without complete attendance records)
    const pastSessions = await Session.find({
      faculty: facultyId,
      date: { $lt: new Date() }
    });
    
    const pendingTasks = [];
    
    // For each past session, check if it has complete attendance records
    for (const session of pastSessions) {
      // Get all students in the group for this session
      const groupStudents = await GroupStudent.find({ group: session.group });
      const totalStudents = groupStudents.length;
      
      // Get attendance records for this session
      const attendanceRecords = await Attendance.find({ session: session._id });
      
      // If attendance records are fewer than the number of students,
      // this session has incomplete attendance
      if (attendanceRecords.length < totalStudents) {
        pendingTasks.push(session);
      }
    }

    res.json({
      courses: groupCourses.length,
      students: studentCount,
      todaySessions,
      pendingTasks: pendingTasks.length
    });
  } catch (error) {
    next(error);
  }
};

// Get courses taught by faculty
const getCourses = async (req, res, next) => {
  try {
    const facultyId = req.faculty._id;
    
    const groupCourses = await GroupCourse.find({ faculty: facultyId })
      .populate('course group');
    
    const courses = groupCourses.map(gc => ({
      id: gc.course._id,
      name: gc.course.name,
      code: gc.course.code,
      credits: gc.course.credits,
      group: {
        id: gc.group._id,
        name: gc.group.name,
        year: gc.group.year,
        department: gc.group.department
      }
    }));
    
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// Get course by ID
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    
    // Verify the faculty has access to this course
    const groupCourse = await GroupCourse.findOne({ 
      course: id,
      faculty: facultyId
    }).populate('course group');
    
    if (!groupCourse) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }
    
    res.json({
      id: groupCourse.course._id,
      name: groupCourse.course.name,
      code: groupCourse.course.code,
      credits: groupCourse.course.credits,
      description: groupCourse.course.description,
      group: {
        id: groupCourse.group._id,
        name: groupCourse.group.name,
        year: groupCourse.group.year
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all sessions for faculty
const getSessions = async (req, res, next) => {
  try {
    const facultyId = req.faculty._id;
    
    const sessions = await Session.find({ faculty: facultyId })
      .populate('course group')
      .sort({ date: -1, startTime: -1 });
    
    res.json(sessions.map(session => ({
      id: session._id,
      course: {
        id: session.course._id,
        name: session.course.name,
        code: session.course.code
      },
      group: {
        id: session.group._id,
        name: session.group.name
      },
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      topic: session.topic
    })));
  } catch (error) {
    next(error);
  }
};

// Create a new session
const createSession = async (req, res, next) => {
  try {
    const facultyId = req.faculty._id;
    const { courseId, groupId, date, startTime, endTime, topic } = req.body;
    
    // Verify faculty has access to this course and group
    const groupCourse = await GroupCourse.findOne({
      course: courseId,
      group: groupId,
      faculty: facultyId
    });
    
    if (!groupCourse) {
      return res.status(403).json({ error: 'You do not have access to this course or group' });
    }
    
    const session = await Session.create({
      course: courseId,
      faculty: facultyId,
      group: groupId,
      date: new Date(date),
      startTime,
      endTime,
      topic
    });
    
    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session._id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        topic: session.topic
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get session by ID
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    
    const session = await Session.findOne({
      _id: id,
      faculty: facultyId
    }).populate('course group');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    res.json({
      id: session._id,
      course: {
        id: session.course._id,
        name: session.course.name,
        code: session.course.code
      },
      group: {
        id: session.group._id,
        name: session.group.name
      },
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      topic: session.topic
    });
  } catch (error) {
    next(error);
  }
};

// Get session attendance
const getSessionAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    
    // Verify faculty has access to this session
    const session = await Session.findOne({
      _id: id,
      faculty: facultyId
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Get all students in the group
    const groupStudents = await GroupStudent.find({ group: session.group })
      .populate('student');
    
    // Get attendance records for this session
    const attendanceRecords = await Attendance.find({ session: id });
    
    // Create attendance data combining both
    const attendanceData = groupStudents.map(gs => {
      const record = attendanceRecords.find(a => 
        a.student.toString() === gs.student._id.toString()
      );
      
      return {
        student: {
          id: gs.student._id,
          name: gs.student.name,
          rollNumber: gs.student.rollNumber
        },
        status: record ? record.status : 'unmarked',
        timestamp: record ? record.timestamp : null
      };
    });
    
    res.json(attendanceData);
  } catch (error) {
    next(error);
  }
};

// Record attendance for a session
const recordAttendance = async (req, res, next) => {
  try {
    const { id } = req.params; // session id
    const facultyId = req.faculty._id;
    const { attendanceData } = req.body;
    
    // Verify faculty has access to this session
    const session = await Session.findOne({
      _id: id,
      faculty: facultyId
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Process each attendance record
    const results = [];
    
    for (const record of attendanceData) {
      const { studentId, status } = record;
      
      // Check if an attendance record already exists
      let attendance = await Attendance.findOne({ 
        session: id, 
        student: studentId 
      });
      
      if (attendance) {
        // Update existing record
        attendance.status = status;
        attendance.timestamp = new Date();
        await attendance.save();
      } else {
        // Create new record
        attendance = await Attendance.create({
          session: id,
          student: studentId,
          status,
          timestamp: new Date()
        });
      }
      
      results.push({
        studentId,
        status,
        recorded: true
      });
    }
    
    res.json({ 
      message: 'Attendance recorded successfully',
      records: results
    });
  } catch (error) {
    next(error);
  }
};

// Get all students for faculty's groups
const getStudents = async (req, res, next) => {
  try {
    const facultyId = req.faculty._id;
    
    // Get groups associated with faculty
    const groupCourses = await GroupCourse.find({ faculty: facultyId });
    const groupIds = [...new Set(groupCourses.map(gc => gc.group))];
    
    // Get students in these groups
    const groupStudents = await GroupStudent.find({ group: { $in: groupIds } })
      .populate('student group');
    
    const students = groupStudents.map(gs => ({
      id: gs.student._id,
      name: gs.student.name,
      email: gs.student.email,
      rollNumber: gs.student.rollNumber,
      group: {
        id: gs.group._id,
        name: gs.group.name,
        year: gs.group.year
      }
    }));
    
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// Update session
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    const { date, startTime, endTime, topic } = req.body;
    
    // Check if session exists and belongs to this faculty
    const session = await Session.findOne({
      _id: id,
      faculty: facultyId
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Update session details
    if (date) session.date = new Date(date);
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (topic) session.topic = topic;
    
    await session.save();
    
    res.json({
      message: 'Session updated successfully',
      session: {
        id: session._id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        topic: session.topic
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete session
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    
    // Check if session exists and belongs to this faculty
    const session = await Session.findOne({
      _id: id,
      faculty: facultyId
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Delete any attendance records for this session
    await Attendance.deleteMany({ session: id });
    
    // Delete the session
    await Session.deleteOne({ _id: id });
    
    res.json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update student's attendance
const updateStudentAttendance = async (req, res, next) => {
  try {
    const { id: sessionId, studentId } = req.params;
    const { status } = req.body;
    const facultyId = req.faculty._id;
    
    // Validate status
    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Verify faculty has access to this session
    const session = await Session.findOne({
      _id: sessionId,
      faculty: facultyId
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Check if student is in the session's group
    const groupStudent = await GroupStudent.findOne({
      group: session.group,
      student: studentId
    });
    
    if (!groupStudent) {
      return res.status(404).json({ error: 'Student not found in this group' });
    }
    
    // Find or create attendance record
    let attendance = await Attendance.findOne({
      session: sessionId,
      student: studentId
    });
    
    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.timestamp = new Date();
      await attendance.save();
    } else {
      // Create new record
      attendance = await Attendance.create({
        session: sessionId,
        student: studentId,
        status,
        timestamp: new Date()
      });
    }
    
    res.json({
      message: 'Attendance updated successfully',
      attendance: {
        id: attendance._id,
        status: attendance.status,
        timestamp: attendance.timestamp
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get student by ID
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    
    // Get groups where faculty teaches
    const groupCourses = await GroupCourse.find({ faculty: facultyId });
    const groupIds = [...new Set(groupCourses.map(gc => gc.group))];
    
    // Check if student is in any of these groups
    const groupStudent = await GroupStudent.findOne({
      student: id,
      group: { $in: groupIds }
    }).populate('student group');
    
    if (!groupStudent) {
      return res.status(404).json({ error: 'Student not found or access denied' });
    }
    
    res.json({
      id: groupStudent.student._id,
      name: groupStudent.student.name,
      email: groupStudent.student.email,
      rollNumber: groupStudent.student.rollNumber,
      group: {
        id: groupStudent.group._id,
        name: groupStudent.group.name,
        year: groupStudent.group.year
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get student attendance
const getStudentAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const facultyId = req.faculty._id;
    
    // Get groups where faculty teaches
    const groupCourses = await GroupCourse.find({ faculty: facultyId });
    const groupIds = [...new Set(groupCourses.map(gc => gc.group))];
    
    // Check if student is in any of these groups
    const groupStudent = await GroupStudent.findOne({
      student: id,
      group: { $in: groupIds }
    }).populate('student');
    
    if (!groupStudent) {
      return res.status(404).json({ error: 'Student not found or access denied' });
    }
    
    // Get all sessions for faculty's courses in student's group
    const sessions = await Session.find({
      faculty: facultyId,
      group: groupStudent.group
    }).populate('course');
    
    // Get all attendance records for this student
    const sessionIds = sessions.map(s => s._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
      student: id
    });
    
    // Group by course
    const courses = {};
    
    sessions.forEach(session => {
      const courseId = session.course._id.toString();
      
      if (!courses[courseId]) {
        courses[courseId] = {
          id: session.course._id,
          name: session.course.name,
          code: session.course.code,
          sessions: [],
          stats: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            unmarked: 0,
            percentage: '0%'
          }
        };
      }
      
      // Find attendance record for this session
      const attendance = attendanceRecords.find(
        a => a.session.toString() === session._id.toString()
      );
      
      // Add session data
      courses[courseId].sessions.push({
        id: session._id,
        date: session.date,
        time: `${session.startTime} - ${session.endTime}`,
        topic: session.topic,
        status: attendance ? attendance.status : 'unmarked'
      });
      
      // Update course stats
      courses[courseId].stats.total++;
      
      if (attendance) {
        courses[courseId].stats[attendance.status]++;
      } else {
        courses[courseId].stats.unmarked++;
      }
    });
    
    // Calculate attendance percentage for each course
    Object.values(courses).forEach(course => {
      const { total, present, late } = course.stats;
      
      course.stats.percentage = total > 0 
        ? `${Math.round((present + (late * 0.5)) / total * 100)}%` 
        : '0%';
    });
    
    res.json({
      student: {
        id: groupStudent.student._id,
        name: groupStudent.student.name,
        rollNumber: groupStudent.student.rollNumber
      },
      courses: Object.values(courses)
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance reports
const getAttendanceReports = async (req, res, next) => {
  try {
    const facultyId = req.faculty._id;
    
    // Get courses taught by this faculty
    const groupCourses = await GroupCourse.find({ faculty: facultyId })
      .populate('course group');
    
    // Prepare course-wise attendance summary
    const reports = [];
    
    for (const gc of groupCourses) {
      // Get all sessions for this course
      const sessions = await Session.find({
        course: gc.course._id,
        group: gc.group._id,
        faculty: facultyId
      });
      
      if (sessions.length === 0) continue;
      
      // Get all students in the group
      const groupStudents = await GroupStudent.find({ group: gc.group._id })
        .populate('student');
      
      // Get all attendance records for these sessions
      const sessionIds = sessions.map(s => s._id);
      const allAttendance = await Attendance.find({
        session: { $in: sessionIds }
      });
      
      // Calculate attendance rate
      const totalPossibleAttendance = sessions.length * groupStudents.length;
      const presentCount = allAttendance.filter(a => a.status === 'present').length;
      const lateCount = allAttendance.filter(a => a.status === 'late').length;
      
      const attendanceRate = totalPossibleAttendance > 0
        ? Math.round((presentCount + (lateCount * 0.5)) / totalPossibleAttendance * 100)
        : 0;
      
      reports.push({
        course: {
          id: gc.course._id,
          name: gc.course.name,
          code: gc.course.code
        },
        group: {
          id: gc.group._id,
          name: gc.group.name
        },
        stats: {
          sessions: sessions.length,
          students: groupStudents.length,
          attendanceRate: `${attendanceRate}%`
        }
      });
    }
    
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// Download attendance report
const downloadAttendanceReport = async (req, res, next) => {
  try {
    const { courseId, groupId, format = 'json' } = req.query;
    const facultyId = req.faculty._id;
    
    // Validate input
    if (!courseId || !groupId) {
      return res.status(400).json({ error: 'Course ID and Group ID are required' });
    }
    
    // Check if faculty has access to this course and group
    const groupCourse = await GroupCourse.findOne({
      course: courseId,
      group: groupId,
      faculty: facultyId
    }).populate('course group');
    
    if (!groupCourse) {
      return res.status(403).json({ error: 'Access denied to this course or group' });
    }
    
    // Get all sessions for this course
    const sessions = await Session.find({
      course: courseId,
      group: groupId,
      faculty: facultyId
    }).sort({ date: 1 });
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found for this course' });
    }
    
    // Get all students in the group
    const groupStudents = await GroupStudent.find({ group: groupId })
      .populate('student');
    
    // Get all attendance records for these sessions
    const sessionIds = sessions.map(s => s._id);
    const allAttendance = await Attendance.find({
      session: { $in: sessionIds }
    });
    
    // Format as requested
    if (format === 'csv') {
      // CSV format: "Student Name, Roll Number, Session Date, Status"
      let csv = 'Student Name,Roll Number,Session Date,Status\n';
      
      for (const gs of groupStudents) {
        for (const session of sessions) {
          const attendance = allAttendance.find(a => 
            a.student.toString() === gs.student._id.toString() &&
            a.session.toString() === session._id.toString()
          );
          
          const status = attendance ? attendance.status : 'unmarked';
          const date = session.date.toISOString().split('T')[0];
          
          csv += `${gs.student.name},${gs.student.rollNumber},${date},${status}\n`;
        }
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${courseId}.csv`);
      return res.send(csv);
    } else {
      // JSON format
      const report = {
        course: {
          id: groupCourse.course._id,
          name: groupCourse.course.name,
          code: groupCourse.course.code
        },
        group: {
          id: groupCourse.group._id,
          name: groupCourse.group.name
        },
        sessions: sessions.map(s => ({
          id: s._id,
          date: s.date,
          topic: s.topic
        })),
        students: groupStudents.map(gs => {
          const studentAttendance = sessions.map(session => {
            const record = allAttendance.find(a => 
              a.student.toString() === gs.student._id.toString() &&
              a.session.toString() === session._id.toString()
            );
            
            return {
              sessionId: session._id,
              status: record ? record.status : 'unmarked'
            };
          });
          
          return {
            id: gs.student._id,
            name: gs.student.name,
            rollNumber: gs.student.rollNumber,
            attendance: studentAttendance
          };
        })
      };
      
      res.json(report);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getCourses,
  getCourseById,
  getSessions,
  createSession,
  getSessionById,
  getSessionAttendance,
  recordAttendance,
  getStudents,
  updateSession,
  deleteSession,
  updateStudentAttendance,
  getStudentById,
  getStudentAttendance,
  getAttendanceReports,
  downloadAttendanceReport
};
