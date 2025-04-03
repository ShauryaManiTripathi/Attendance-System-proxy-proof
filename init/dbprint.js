const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb+srv://leoosarah:QDH4wpYoAz0wdnHo@attend.iviwm.mongodb.net/AS?retryWrites=true&w=majority&appName=attend")
  .then(() => {
    console.log("Connected to MongoDB");
    printDatabaseContents();
  })
  .catch(err => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });

// Define schemas (same as in dbinit.js)
const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  password: { type: String, required: true }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  credits: { type: Number, required: true }
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  department: { type: String, required: true }
});

const sessionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  topic: { type: String }
});

const groupStudentSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }
});

const groupCourseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true }
});

const attendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create models
const Faculty = mongoose.model('Faculty', facultySchema);
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Group = mongoose.model('Group', groupSchema);
const Session = mongoose.model('Session', sessionSchema);
const GroupStudent = mongoose.model('GroupStudent', groupStudentSchema);
const GroupCourse = mongoose.model('GroupCourse', groupCourseSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Function to display all collections data with formatting
async function printDatabaseContents() {
  try {
    console.log("\n======================================================================");
    console.log("                      DATABASE CONTENTS REPORT");
    console.log("======================================================================\n");

    // Print Faculty collection
    await printCollection("FACULTY", Faculty, async () => {
      const faculties = await Faculty.find().sort({ name: 1 });
      return faculties.map(f => ({
        ID: f._id.toString().substring(0, 6) + '...',
        Name: f.name,
        Email: f.email,
        'Employee ID': f.employeeId,
        Department: f.department
      }));
    });

    // Print Student collection
    await printCollection("STUDENTS", Student, async () => {
      const students = await Student.find().sort({ name: 1 });
      return students.map(s => ({
        ID: s._id.toString().substring(0, 6) + '...',
        Name: s.name,
        Email: s.email,
        'Roll Number': s.rollNumber
      }));
    });

    // Print Course collection
    await printCollection("COURSES", Course, async () => {
      const courses = await Course.find().sort({ code: 1 });
      return courses.map(c => ({
        ID: c._id.toString().substring(0, 6) + '...',
        Name: c.name,
        Code: c.code,
        Credits: c.credits,
        Description: c.description ? (c.description.length > 30 ? c.description.substring(0, 27) + '...' : c.description) : ''
      }));
    });

    // Print Group collection
    await printCollection("GROUPS", Group, async () => {
      const groups = await Group.find().sort({ name: 1 });
      return groups.map(g => ({
        ID: g._id.toString().substring(0, 6) + '...',
        Name: g.name,
        Year: g.year,
        Department: g.department
      }));
    });

    // Print Group-Student associations
    await printCollection("GROUP-STUDENT ASSOCIATIONS", GroupStudent, async () => {
      const groupStudents = await GroupStudent.find().populate('group student');
      return groupStudents.map(gs => ({
        ID: gs._id.toString().substring(0, 6) + '...',
        'Group Name': gs.group.name,
        'Student Name': gs.student.name,
        'Roll Number': gs.student.rollNumber
      }));
    });

    // Print Group-Course associations
    await printCollection("GROUP-COURSE ASSOCIATIONS", GroupCourse, async () => {
      const groupCourses = await GroupCourse.find().populate('group course faculty');
      return groupCourses.map(gc => ({
        ID: gc._id.toString().substring(0, 6) + '...',
        'Group': gc.group.name,
        'Course': gc.course.name + ' (' + gc.course.code + ')',
        'Faculty': gc.faculty.name
      }));
    });

    // Enhance the Sessions printCollection function
    await printCollection("SESSIONS", Session, async () => {
      const sessions = await Session.find().sort({ date: -1 }).populate('course faculty group');
      
      // For each session, get attendance stats
      const sessionsWithStats = await Promise.all(sessions.map(async s => {
        const attendanceRecords = await Attendance.find({ session: s._id });
        const totalRecords = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
        const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
        const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
        
        // Get total students in the group
        const groupStudents = await GroupStudent.find({ group: s.group._id });
        const totalStudents = groupStudents.length;
        
        return {
          ID: s._id.toString().substring(0, 6) + '...',
          Date: formatDate(s.date),
          Time: `${s.startTime}-${s.endTime}`,
          Course: s.course.code,
          Group: s.group.name,
          Faculty: s.faculty.name.split(' ')[1], // Last name only for space
          Topic: s.topic ? (s.topic.length > 20 ? s.topic.substring(0, 17) + '...' : s.topic) : '',
          'Attendance': totalStudents === 0 ? 'N/A' : 
            `${presentCount}P/${lateCount}L/${absentCount}A (${totalRecords}/${totalStudents})`
        };
      }));
      
      return sessionsWithStats;
    });

    // Print Attendance
    await printCollection("ATTENDANCE RECORDS", Attendance, async () => {
      const attendance = await Attendance.find()
        .populate({
          path: 'session',
          populate: [
            { path: 'course', select: 'name code' },
            { path: 'faculty', select: 'name' },
            { path: 'group', select: 'name' }
          ]
        })
        .populate('student', 'name rollNumber');
      
      return attendance.map(a => ({
        ID: a._id.toString().substring(0, 6) + '...',
        Date: formatDate(a.session.date),
        Session: `${a.session.course.code} (${a.session.startTime}-${a.session.endTime})`,
        Student: `${a.student.name} (${a.student.rollNumber})`,
        Status: a.status.toUpperCase(),
        'Recorded': formatDate(a.timestamp, true)
      }));
    });

    console.log("\n======================================================================");
    console.log("                      END OF DATABASE REPORT");
    console.log("======================================================================\n");
    
    // Close the connection after printing
    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Error printing database contents:", error);
  }
}

// Helper function to print collections with consistent formatting
async function printCollection(title, model, dataFetcherFn) {
  console.log(`\n-- ${title} --`);
  
  try {
    const count = await model.countDocuments();
    
    if (count === 0) {
      console.log(`No records found in ${title} collection.\n`);
      return;
    }
    
    const data = await dataFetcherFn();
    console.table(data);
    console.log(`Total records: ${count}\n`);
    
  } catch (error) {
    console.error(`Error fetching ${title} data:`, error);
  }
}

// Helper function to format dates
function formatDate(date, includeTime = false) {
  if (!date) return 'N/A';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nClosing database connection...');
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
});
