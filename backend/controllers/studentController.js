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
    
    // Get attendance stats
    const studentAttendance = await Attendance.find({
      student: studentId
    }).populate('session');
    
    const totalSessions = await Session.countDocuments({
      group: { $in: groupIds },
      date: { $lt: now }
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

module.exports = {
  getDashboardData,
  getCourses,
  getAttendance,
  getSessions
};
