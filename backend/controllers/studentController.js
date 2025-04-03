const { 
  Course, 
  GroupStudent, 
  GroupCourse, 
  Session,
  Attendance 
} = require('../schemas');

// Get dashboard data
const getDashboardData = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Get courses for these groups
    const groupCourses = await GroupCourse.find({
      group: { $in: groupIds }
    }).populate('course faculty');
    
    // Get upcoming sessions
    const now = new Date();
    const upcomingSessions = await Session.find({
      group: { $in: groupIds },
      date: { $gte: now }
    }).sort({ date: 1, startTime: 1 })
      .limit(5)
      .populate('course faculty');
    
    // Get attendance stats for past sessions
    const pastSessions = await Session.find({
      group: { $in: groupIds },
      date: { $lt: now }
    });
    
    const pastSessionIds = pastSessions.map(session => session._id);
    const totalSessions = pastSessionIds.length;
    
    // Get attendance records for the student
    const studentAttendance = await Attendance.find({
      student: studentId,
      session: { $in: pastSessionIds }
    });
    
    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    const absentCount = studentAttendance.filter(a => a.status === 'absent').length;
    const lateCount = studentAttendance.filter(a => a.status === 'late').length;
    
    const attendanceRate = totalSessions > 0 
      ? Math.round((presentCount + (lateCount * 0.5)) / totalSessions * 100) 
      : 100;
    
    res.json({
      courses: groupCourses.length,
      upcomingSessions: upcomingSessions.length,
      attendanceRate: `${attendanceRate}%`,
      missedSessions: absentCount,
      todaySessions: upcomingSessions.filter(s => 
        s.date.toDateString() === new Date().toDateString()
      ).map(s => ({
        id: s._id,
        course: s.course.name,
        faculty: s.faculty.name,
        time: `${s.startTime} - ${s.endTime}`,
        topic: s.topic
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get courses for student
const getCourses = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Get courses for these groups
    const groupCourses = await GroupCourse.find({
      group: { $in: groupIds }
    }).populate('course faculty group');
    
    const courses = groupCourses.map(gc => ({
      id: gc.course._id,
      name: gc.course.name,
      code: gc.course.code,
      credits: gc.course.credits,
      faculty: {
        id: gc.faculty._id,
        name: gc.faculty.name
      },
      group: {
        id: gc.group._id,
        name: gc.group.name
      }
    }));
    
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// Get course details for student
const getCourseDetails = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const courseId = req.params.id;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Check if course belongs to student's groups
    const groupCourse = await GroupCourse.find({
      course: courseId,
      group: { $in: groupIds }
    }).populate('course faculty group');
    
    if (!groupCourse.length) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }
    
    // Get all sessions for this course
    const sessions = await Session.find({
      course: courseId,
      group: { $in: groupIds }
    }).sort({ date: -1 });
    
    // Get attendance for these sessions
    const sessionIds = sessions.map(session => session._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
      student: studentId
    });
    
    // Calculate attendance stats
    const totalSessions = sessions.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const unmarkedCount = totalSessions - (presentCount + absentCount + lateCount);
    
    const attendancePercentage = totalSessions > 0 
      ? Math.round((presentCount + (lateCount * 0.5)) / totalSessions * 100) 
      : 100;
    
    res.json({
      course: {
        id: groupCourse[0].course._id,
        name: groupCourse[0].course.name,
        code: groupCourse[0].course.code,
        credits: groupCourse[0].course.credits,
        description: groupCourse[0].course.description
      },
      faculty: {
        id: groupCourse[0].faculty._id,
        name: groupCourse[0].faculty.name
      },
      group: {
        id: groupCourse[0].group._id,
        name: groupCourse[0].group.name
      },
      attendance: {
        totalSessions,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        unmarked: unmarkedCount,
        attendancePercentage: `${attendancePercentage}%`
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance records for student
const getAttendance = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      student: studentId
    }).populate({
      path: 'session',
      populate: {
        path: 'course faculty',
        select: 'name code'
      }
    });
    
    const attendanceData = attendanceRecords.map(record => ({
      id: record._id,
      date: record.session.date,
      course: {
        id: record.session.course._id,
        name: record.session.course.name,
        code: record.session.course.code
      },
      faculty: {
        id: record.session.faculty._id,
        name: record.session.faculty.name
      },
      time: `${record.session.startTime} - ${record.session.endTime}`,
      topic: record.session.topic,
      status: record.status
    }));
    
    res.json(attendanceData);
  } catch (error) {
    next(error);
  }
};

// Get attendance records for a specific course
const getCourseAttendance = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const courseId = req.params.courseId;
    
    // Check if student has access to this course
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    const courseAccess = await GroupCourse.findOne({
      course: courseId,
      group: { $in: groupIds }
    });
    
    if (!courseAccess) {
      return res.status(403).json({ error: 'Access denied to this course' });
    }
    
    // Get sessions for this course
    const sessions = await Session.find({
      course: courseId,
      group: { $in: groupIds }
    }).populate('faculty')
      .sort({ date: -1 });
    
    // Get attendance records
    const sessionIds = sessions.map(s => s._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
      student: studentId
    });
    
    // Map sessions with attendance
    const sessionAttendance = sessions.map(session => {
      const attendance = attendanceRecords.find(
        a => a.session.toString() === session._id.toString()
      );
      
      return {
        id: session._id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        topic: session.topic,
        faculty: {
          id: session.faculty._id,
          name: session.faculty.name
        },
        status: attendance ? attendance.status : 'unmarked',
        timestamp: attendance ? attendance.timestamp : null
      };
    });
    
    res.json(sessionAttendance);
  } catch (error) {
    next(error);
  }
};

// Mark own attendance (for student)
const markAttendance = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const { sessionId } = req.body;
    
    // Check if session exists
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if student belongs to the session's group
    const isStudentInGroup = await GroupStudent.findOne({
      student: studentId,
      group: session.group
    });
    
    if (!isStudentInGroup) {
      return res.status(403).json({ error: 'You do not belong to this session group' });
    }
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      session: sessionId,
      student: studentId
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        error: 'Attendance already marked',
        status: existingAttendance.status
      });
    }
    
    // Get session time to determine if student is present or late
    const sessionDate = new Date(session.date);
    const sessionDateStr = sessionDate.toISOString().split('T')[0];
    
    // Convert session times to Date objects
    const startTime = new Date(`${sessionDateStr}T${session.startTime}:00`);
    
    // Add 15 min buffer
    const lateBuffer = new Date(startTime);
    lateBuffer.setMinutes(lateBuffer.getMinutes() + 15);
    
    // Determine attendance status
    const now = new Date();
    const status = now <= lateBuffer ? 'present' : 'late';
    
    // Create attendance record
    const attendance = await Attendance.create({
      session: sessionId,
      student: studentId,
      status,
      timestamp: now
    });
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      status,
      timestamp: attendance.timestamp
    });
  } catch (error) {
    next(error);
  }
};

// Get sessions for student
const getSessions = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Get all sessions for these groups
    const sessions = await Session.find({
      group: { $in: groupIds }
    }).populate('course faculty group')
      .sort({ date: -1, startTime: -1 });
    
    // Get attendance status for each session
    const sessionsWithAttendance = await Promise.all(sessions.map(async (session) => {
      const attendance = await Attendance.findOne({
        session: session._id,
        student: studentId
      });
      
      return {
        id: session._id,
        date: session.date,
        course: {
          id: session.course._id,
          name: session.course.name,
          code: session.course.code
        },
        faculty: {
          id: session.faculty._id,
          name: session.faculty.name
        },
        time: `${session.startTime} - ${session.endTime}`,
        topic: session.topic,
        attendanceStatus: attendance ? attendance.status : 'unmarked'
      };
    }));
    
    res.json(sessionsWithAttendance);
  } catch (error) {
    next(error);
  }
};

// Get session details
const getSessionDetails = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const sessionId = req.params.id;
    
    // Check if session exists and student has access
    const session = await Session.findById(sessionId)
      .populate('course faculty group');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if student belongs to this group
    const isStudentInGroup = await GroupStudent.findOne({
      student: studentId,
      group: session.group._id
    });
    
    if (!isStudentInGroup) {
      return res.status(403).json({ error: 'Access denied to this session' });
    }
    
    // Get attendance for this session
    const attendance = await Attendance.findOne({
      session: sessionId,
      student: studentId
    });
    
    res.json({
      id: session._id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      topic: session.topic,
      course: {
        id: session.course._id,
        name: session.course.name,
        code: session.course.code
      },
      faculty: {
        id: session.faculty._id,
        name: session.faculty.name
      },
      group: {
        id: session.group._id,
        name: session.group.name
      },
      attendance: attendance ? {
        status: attendance.status,
        timestamp: attendance.timestamp
      } : {
        status: 'unmarked',
        timestamp: null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming sessions
const getUpcomingSessions = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Get upcoming sessions (from now onwards)
    const now = new Date();
    const upcomingSessions = await Session.find({
      group: { $in: groupIds },
      date: { $gte: now }
    }).populate('course faculty group')
      .sort({ date: 1, startTime: 1 })
      .limit(10);
    
    res.json(upcomingSessions.map(session => ({
      id: session._id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      topic: session.topic,
      course: {
        id: session.course._id,
        name: session.course.name,
        code: session.course.code
      },
      faculty: {
        id: session.faculty._id,
        name: session.faculty.name
      },
      group: {
        id: session.group._id,
        name: session.group.name
      }
    })));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getCourses,
  getCourseDetails,
  getAttendance,
  getCourseAttendance,
  markAttendance,
  getSessions,
  getSessionDetails,
  getUpcomingSessions
};
