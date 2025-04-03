const Faculty = require('./facultySchema');
const Student = require('./studentSchema');
const Course = require('./courseSchema');
const Group = require('./groupSchema');
const Session = require('./sessionSchema');
const GroupStudent = require('./groupStudentSchema');
const GroupCourse = require('./groupCourseSchema');
const Attendance = require('./attendanceSchema');

module.exports = {
  Faculty,
  Student,
  Course,
  Group,
  Session,
  GroupStudent,
  GroupCourse,
  Attendance
};
