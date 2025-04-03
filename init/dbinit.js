const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://leoosarah:QDH4wpYoAz0wdnHo@attend.iviwm.mongodb.net/AS?retryWrites=true&w=majority&appName=attend")

mongoose.connection.on("connected", function () {
    console.log("Connected to MongoDB");
    initializeDatabase();
  });
  mongoose.connection.on("error", function (err) {
    console.log("Error connecting to MongoDB", err);
  });

// Define schemas
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

// Add indexes for performance
groupStudentSchema.index({ group: 1, student: 1 }, { unique: true });
groupCourseSchema.index({ group: 1, course: 1, faculty: 1 }, { unique: true });
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

// Function to drop all collections and reset database
async function cleanDatabase() {
  console.log("Cleaning database...");
  
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    try {
      await mongoose.connection.collections[collectionName].drop();
      console.log(`Dropped collection: ${collectionName}`);
    } catch (error) {
      // If collection doesn't exist or other error
      console.log(`Error dropping collection ${collectionName}:`, error.message);
    }
  }
  console.log("Database cleaned successfully");
}

// Function to create sample data
async function createSampleData() {
  console.log("Creating sample data...");
  
  // Create faculties
  const faculty1 = await Faculty.create({
    name: "Dr. John Smith",
    email: "john.smith@university.edu",
    employeeId: "FAC001",
    department: "Computer Science",
    password: "password123"
  });
  
  const faculty2 = await Faculty.create({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    employeeId: "FAC002",
    department: "Mathematics",
    password: "password123"
  });
  
  // Create students
  const student1 = await Student.create({
    name: "Alice Brown",
    email: "alice.brown@student.edu",
    rollNumber: "STU001",
    password: "password123"
  });
  
  const student2 = await Student.create({
    name: "Bob Wilson",
    email: "bob.wilson@student.edu",
    rollNumber: "STU002",
    password: "password123"
  });
  
  const student3 = await Student.create({
    name: "Charlie Davis",
    email: "charlie.davis@student.edu",
    rollNumber: "STU003",
    password: "password123"
  });
  
  // Create courses
  const course1 = await Course.create({
    name: "Introduction to Programming",
    code: "CS101",
    description: "Basic programming concepts",
    credits: 3
  });
  
  const course2 = await Course.create({
    name: "Data Structures",
    code: "CS201",
    description: "Advanced data structures and algorithms",
    credits: 4
  });
  
  // Create groups
  const group1 = await Group.create({
    name: "CS-2023",
    year: 2023,
    department: "Computer Science"
  });
  
  // Associate students with group
  await GroupStudent.create({
    group: group1._id,
    student: student1._id
  });
  
  await GroupStudent.create({
    group: group1._id,
    student: student2._id
  });
  
  await GroupStudent.create({
    group: group1._id,
    student: student3._id
  });
  
  // Associate courses with group
  await GroupCourse.create({
    group: group1._id,
    course: course1._id,
    faculty: faculty1._id
  });
  
  await GroupCourse.create({
    group: group1._id,
    course: course2._id,
    faculty: faculty2._id
  });
  
  // Create sessions (past and upcoming)
  const today = new Date();
  
  // Past session (yesterday)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const pastSession = await Session.create({
    course: course1._id,
    faculty: faculty1._id,
    group: group1._id,
    date: yesterday,
    startTime: "09:00",
    endTime: "10:30",
    topic: "Variables and Data Types"
  });
  
  // Create attendance records for past session
  await Attendance.create({
    session: pastSession._id,
    student: student1._id,
    status: "present",
    timestamp: yesterday
  });
  
  await Attendance.create({
    session: pastSession._id,
    student: student2._id,
    status: "present",
    timestamp: yesterday
  });
  
  await Attendance.create({
    session: pastSession._id,
    student: student3._id,
    status: "absent",
    timestamp: yesterday
  });
  
  // Today's session
  const currentSession = await Session.create({
    course: course1._id,
    faculty: faculty1._id,
    group: group1._id,
    date: today,
    startTime: "09:00",
    endTime: "10:30",
    topic: "Control Structures"
  });
  
  // Future session (tomorrow)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await Session.create({
    course: course2._id,
    faculty: faculty2._id,
    group: group1._id,
    date: tomorrow,
    startTime: "11:00",
    endTime: "12:30",
    topic: "Arrays and Linked Lists"
  });
  
  console.log("Sample data created successfully");
}

// Function to display all collections data
async function displayCollections() {
  console.log("\n--- DATABASE CONTENTS ---\n");
  
  console.log("FACULTY:");
  const faculties = await Faculty.find();
  console.table(faculties.map(f => ({
    id: f._id.toString(),
    name: f.name,
    email: f.email,
    employeeId: f.employeeId,
    department: f.department
  })));
  
  console.log("\nSTUDENTS:");
  const students = await Student.find();
  console.table(students.map(s => ({
    id: s._id.toString(),
    name: s.name,
    email: s.email,
    rollNumber: s.rollNumber
  })));
  
  console.log("\nCOURSES:");
  const courses = await Course.find();
  console.table(courses.map(c => ({
    id: c._id.toString(),
    name: c.name,
    code: c.code,
    credits: c.credits
  })));
  
  console.log("\nGROUPS:");
  const groups = await Group.find();
  console.table(groups.map(g => ({
    id: g._id.toString(),
    name: g.name,
    year: g.year,
    department: g.department
  })));
  
  console.log("\nGROUP-STUDENT ASSOCIATIONS:");
  const groupStudents = await GroupStudent.find().populate('group student');
  console.table(groupStudents.map(gs => ({
    id: gs._id.toString(),
    groupName: gs.group.name,
    studentName: gs.student.name,
    rollNumber: gs.student.rollNumber
  })));
  
  console.log("\nGROUP-COURSE ASSOCIATIONS:");
  const groupCourses = await GroupCourse.find().populate('group course faculty');
  console.table(groupCourses.map(gc => ({
    id: gc._id.toString(),
    groupName: gc.group.name,
    courseName: gc.course.name,
    facultyName: gc.faculty.name
  })));
  
  console.log("\nSESSIONS:");
  const sessions = await Session.find().populate('course faculty group');
  console.table(sessions.map(s => ({
    id: s._id.toString(),
    course: s.course.name,
    faculty: s.faculty.name,
    group: s.group.name,
    date: s.date.toLocaleDateString(),
    time: `${s.startTime}-${s.endTime}`,
    topic: s.topic
  })));
  
  console.log("\nATTENDANCE:");
  const attendance = await Attendance.find().populate('session student');
  console.table(attendance.map(a => ({
    id: a._id.toString(),
    sessionTopic: a.session.topic,
    studentName: a.student.name,
    status: a.status,
    timestamp: a.timestamp.toLocaleString()
  })));
  
  console.log("\n--- END OF DATABASE CONTENTS ---\n");
}

// Main function to initialize database
async function initializeDatabase() {
  try {
    //await cleanDatabase();
    await createSampleData();
    await displayCollections();
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
  } finally {
    // If you want to close the connection after initialization
    // mongoose.connection.close();
  }
}

// Export models
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

console.log("Attendance System database models initialized");


