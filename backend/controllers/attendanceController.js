const { 
  Session, 
  Attendance, 
  Student, 
  Course, 
  GroupStudent, 
  GroupCourse 
} = require('../schemas');

// Get details of a specific session including attendance stats
const getSessionDetails = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    
    const session = await Session.findById(sessionId)
      .populate('course faculty group');
      
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get attendance records for this session
    const attendanceRecords = await Attendance.find({ session: sessionId })
      .populate('student');
      
    // Get all students in this group
    const groupStudents = await GroupStudent.find({ group: session.group })
      .populate('student');
      
    // Calculate stats
    const totalStudents = groupStudents.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const unmarkedCount = totalStudents - (presentCount + absentCount + lateCount);
    
    const attendanceRate = totalStudents > 0 
      ? Math.round((presentCount + (lateCount * 0.5)) / totalStudents * 100) 
      : 0;

    res.json({
      session: {
        id: session._id,
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
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        topic: session.topic
      },
      attendance: {
        total: totalStudents,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        unmarked: unmarkedCount,
        attendanceRate: `${attendanceRate}%`
      },
      records: attendanceRecords.map(record => ({
        id: record._id,
        student: {
          id: record.student._id,
          name: record.student.name,
          rollNumber: record.student.rollNumber
        },
        status: record.status,
        timestamp: record.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Mark attendance for multiple students in a session (faculty)
const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, attendanceData } = req.body;
    
    // Verify faculty has access to this session
    const session = await Session.findOne({
      _id: sessionId,
      faculty: req.faculty._id
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    const results = [];
    
    for (const record of attendanceData) {
      const { studentId, status } = record;
      
      // Check if an attendance record already exists
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

// Update a single attendance record (faculty)
const updateAttendance = async (req, res, next) => {
  try {
    const attendanceId = req.params.id;
    const { status } = req.body;
    
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    // Verify faculty has access to this session
    const session = await Session.findOne({
      _id: attendance.session,
      faculty: req.faculty._id
    });
    
    if (!session) {
      return res.status(403).json({ error: 'Access denied to this attendance record' });
    }
    
    attendance.status = status;
    attendance.timestamp = new Date();
    await attendance.save();
    
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

// Get course attendance report (faculty)
const getCourseAttendanceReport = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const facultyId = req.faculty._id;
    
    // Verify faculty teaches this course
    const groupCourse = await GroupCourse.findOne({
      course: courseId,
      faculty: facultyId
    });
    
    if (!groupCourse) {
      return res.status(403).json({ error: 'Access denied to this course' });
    }
    
    // Get all sessions for this course by this faculty
    const sessions = await Session.find({
      course: courseId,
      faculty: facultyId
    }).sort({ date: -1 });
    
    // Get all students in the group
    const groupStudents = await GroupStudent.find({ group: groupCourse.group })
      .populate('student');
    
    // Get all attendance records for these sessions
    const sessionIds = sessions.map(s => s._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds }
    });
    
    // Create student-wise report
    const studentReports = [];
    
    for (const gs of groupStudents) {
      const studentId = gs.student._id;
      const studentRecords = attendanceRecords.filter(
        record => record.student.toString() === studentId.toString()
      );
      
      const totalSessions = sessions.length;
      const presentCount = studentRecords.filter(r => r.status === 'present').length;
      const absentCount = studentRecords.filter(r => r.status === 'absent').length;
      const lateCount = studentRecords.filter(r => r.status === 'late').length;
      const unmarkedCount = totalSessions - studentRecords.length;
      
      const attendancePercentage = totalSessions > 0 
        ? Math.round((presentCount + (lateCount * 0.5)) / totalSessions * 100) 
        : 0;
      
      studentReports.push({
        student: {
          id: gs.student._id,
          name: gs.student.name,
          rollNumber: gs.student.rollNumber
        },
        stats: {
          totalSessions,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          unmarked: unmarkedCount,
          attendancePercentage: `${attendancePercentage}%`
        }
      });
    }
    
    res.json({
      course: await Course.findById(courseId),
      totalSessions: sessions.length,
      students: studentReports
    });
  } catch (error) {
    next(error);
  }
};

// Get student attendance report for all courses (faculty)
const getStudentAttendanceReport = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const facultyId = req.faculty._id;
    
    // Get courses taught by this faculty
    const facultyCourses = await GroupCourse.find({
      faculty: facultyId
    }).populate('course group');
    
    // Check if the student is in any of the faculty's groups
    const studentInFacultyGroup = await GroupStudent.findOne({
      student: studentId,
      group: { $in: facultyCourses.map(gc => gc.group._id) }
    });
    
    if (!studentInFacultyGroup) {
      return res.status(403).json({ error: 'Access denied to this student' });
    }
    
    // Get student details
    const student = await Student.findById(studentId);
    
    // Get attendance for each course
    const courseReports = [];
    
    for (const fc of facultyCourses) {
      // Check if student is in this group
      const isStudentInGroup = await GroupStudent.findOne({
        student: studentId,
        group: fc.group._id
      });
      
      if (!isStudentInGroup) continue;
      
      // Get sessions for this course
      const sessions = await Session.find({
        course: fc.course._id,
        faculty: facultyId,
        group: fc.group._id
      });
      
      if (sessions.length === 0) continue;
      
      // Get attendance records
      const sessionIds = sessions.map(s => s._id);
      const attendanceRecords = await Attendance.find({
        session: { $in: sessionIds },
        student: studentId
      });
      
      const totalSessions = sessions.length;
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
      const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
      const unmarkedCount = totalSessions - attendanceRecords.length;
      
      const attendancePercentage = totalSessions > 0 
        ? Math.round((presentCount + (lateCount * 0.5)) / totalSessions * 100) 
        : 0;
      
      courseReports.push({
        course: {
          id: fc.course._id,
          name: fc.course.name,
          code: fc.course.code
        },
        stats: {
          totalSessions,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          unmarked: unmarkedCount,
          attendancePercentage: `${attendancePercentage}%`
        }
      });
    }
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email
      },
      courses: courseReports
    });
  } catch (error) {
    next(error);
  }
};

// Get session attendance report (faculty)
const getSessionAttendanceReport = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    const facultyId = req.faculty._id;
    
    // Verify faculty has access to this session
    const session = await Session.findOne({
      _id: sessionId,
      faculty: facultyId
    }).populate('course group');
    
    if (!session) {
      return res.status(403).json({ error: 'Access denied to this session' });
    }
    
    // Get all students in the group
    const groupStudents = await GroupStudent.find({ group: session.group._id })
      .populate('student');
    
    // Get attendance records for this session
    const attendanceRecords = await Attendance.find({ session: sessionId });
    
    // Create the report
    const studentRecords = groupStudents.map(gs => {
      const attendance = attendanceRecords.find(
        a => a.student.toString() === gs.student._id.toString()
      );
      
      return {
        student: {
          id: gs.student._id,
          name: gs.student.name,
          rollNumber: gs.student.rollNumber
        },
        attendance: attendance ? {
          status: attendance.status,
          timestamp: attendance.timestamp
        } : {
          status: 'unmarked',
          timestamp: null
        }
      };
    });
    
    // Calculate stats
    const totalStudents = groupStudents.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const unmarkedCount = totalStudents - attendanceRecords.length;
    
    const attendanceRate = totalStudents > 0 
      ? Math.round((presentCount + (lateCount * 0.5)) / totalStudents * 100) 
      : 0;
    
    res.json({
      session: {
        id: session._id,
        date: session.date,
        topic: session.topic,
        time: `${session.startTime} - ${session.endTime}`,
        course: {
          id: session.course._id,
          name: session.course.name,
          code: session.course.code
        },
        group: {
          id: session.group._id,
          name: session.group.name
        }
      },
      stats: {
        totalStudents,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        unmarked: unmarkedCount,
        attendanceRate: `${attendanceRate}%`
      },
      students: studentRecords
    });
  } catch (error) {
    next(error);
  }
};

// Get my attendance (student)
const getMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Get all sessions for these groups
    const sessions = await Session.find({
      group: { $in: groupIds }
    }).populate('course faculty');
    
    // Get attendance for all sessions
    const sessionIds = sessions.map(s => s._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
      student: studentId
    });
    
    // Group by courses
    const courseMap = {};
    
    sessions.forEach(session => {
      const courseId = session.course._id.toString();
      
      if (!courseMap[courseId]) {
        courseMap[courseId] = {
          course: {
            id: session.course._id,
            name: session.course.name,
            code: session.course.code
          },
          faculty: {
            id: session.faculty._id,
            name: session.faculty.name
          },
          sessions: 0,
          present: 0,
          absent: 0,
          late: 0,
          unmarked: 0
        };
      }
      
      courseMap[courseId].sessions += 1;
      
      // Find attendance for this session
      const attendance = attendanceRecords.find(
        a => a.session.toString() === session._id.toString()
      );
      
      if (attendance) {
        courseMap[courseId][attendance.status] += 1;
      } else {
        courseMap[courseId].unmarked += 1;
      }
    });
    
    // Convert map to array and calculate percentages
    const courseAttendance = Object.values(courseMap).map(item => {
      const attendancePercentage = item.sessions > 0 
        ? Math.round((item.present + (item.late * 0.5)) / item.sessions * 100) 
        : 0;
      
      return {
        ...item,
        attendancePercentage: `${attendancePercentage}%`
      };
    });
    
    res.json(courseAttendance);
  } catch (error) {
    next(error);
  }
};

// Get my attendance for a specific course (student)
const getMyCourseAttendance = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const courseId = req.params.courseId;
    
    // Get student's groups
    const studentGroups = await GroupStudent.find({ student: studentId });
    const groupIds = studentGroups.map(sg => sg.group);
    
    // Get sessions for this course in student's groups
    const sessions = await Session.find({
      course: courseId,
      group: { $in: groupIds }
    }).populate('course faculty')
      .sort({ date: -1 });
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found for this course' });
    }
    
    // Get attendance records
    const sessionIds = sessions.map(s => s._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
      student: studentId
    });
    
    // Create session-wise attendance details
    const sessionAttendance = sessions.map(session => {
      const attendance = attendanceRecords.find(
        a => a.session.toString() === session._id.toString()
      );
      
      return {
        session: {
          id: session._id,
          date: session.date,
          time: `${session.startTime} - ${session.endTime}`,
          topic: session.topic
        },
        attendance: attendance ? {
          status: attendance.status,
          timestamp: attendance.timestamp
        } : {
          status: 'unmarked',
          timestamp: null
        }
      };
    });
    
    // Calculate summary
    const totalSessions = sessions.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const unmarkedCount = totalSessions - attendanceRecords.length;
    
    const attendancePercentage = totalSessions > 0 
      ? Math.round((presentCount + (lateCount * 0.5)) / totalSessions * 100) 
      : 0;
    
    // Get course details
    const course = await Course.findById(courseId);
    
    res.json({
      course: {
        id: course._id,
        name: course.name,
        code: course.code
      },
      summary: {
        totalSessions,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        unmarked: unmarkedCount,
        attendancePercentage: `${attendancePercentage}%`
      },
      sessions: sessionAttendance
    });
  } catch (error) {
    next(error);
  }
};

// Self-mark attendance (student) - Optional feature for location-based attendance
const selfMarkAttendance = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const { sessionId, location } = req.body;
    
    // Check if the session exists and is valid for attendance
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
      return res.status(403).json({ error: 'You do not belong to this session' });
    }
    
    // Check if attendance is already marked
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
    
    // Get session time boundaries
    const sessionDate = new Date(session.date);
    const sessionDateStr = sessionDate.toISOString().split('T')[0];
    
    // Convert session times to Date objects
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const [endHour, endMinute] = session.endTime.split(':').map(Number);
    
    const sessionStart = new Date(`${sessionDateStr}T${session.startTime}:00`);
    const sessionEnd = new Date(`${sessionDateStr}T${session.endTime}:00`);
    
    // Get current time
    const now = new Date();
    
    // Check if current time is within session time or up to 15 minutes after
    const lateThreshold = new Date(sessionStart);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + 15);
    
    const afterSessionEnd = new Date(sessionEnd);
    afterSessionEnd.setMinutes(afterSessionEnd.getMinutes() + 15);
    
    // Determine attendance status based on time
    let status;
    if (now < sessionStart) {
      return res.status(400).json({ error: 'Session has not started yet' });
    } else if (now > afterSessionEnd) {
      return res.status(400).json({ error: 'Session has ended, can no longer mark attendance' });
    } else if (now <= lateThreshold) {
      status = 'present';
    } else {
      status = 'late';
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      session: sessionId,
      student: studentId,
      status,
      timestamp: new Date(),
      location: location || null
    });
    
    res.status(201).json({
      message: 'Attendance marked successfully',
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

module.exports = {
  getSessionDetails,
  markAttendance,
  updateAttendance,
  getCourseAttendanceReport,
  getStudentAttendanceReport,
  getSessionAttendanceReport,
  getMyAttendance,
  getMyCourseAttendance,
  selfMarkAttendance
};
