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
    
    // Get pending tasks (sessions without attendance records)
    const sessionsWithoutAttendance = await Session.find({
      faculty: facultyId,
      date: { $lt: new Date() }
    });
    
    // For each session, check if it has complete attendance records
    const pendingTasks = [];
    for (const session of sessionsWithoutAttendance) {
      const groupStudents = await GroupStudent.find({ group: session.group });
      const attendanceRecords = await Attendance.find({ session: session._id });
      
      if (attendanceRecords.length < groupStudents.length) {
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

// Get attendance for a specific session
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
      const record = attendanceRecords.find(a => a.student.toString() === gs.student._id.toString());
      
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
    const { id } = req.params;
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

module.exports = {
  getDashboardData,
  getCourses,
  getCourseById,
  getSessions,
  createSession,
  getSessionById,
  getSessionAttendance,
  recordAttendance,
  getStudents
};
