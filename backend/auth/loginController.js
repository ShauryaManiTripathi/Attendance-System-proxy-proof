const { Faculty, Student } = require('../schemas');
const { comparePassword, generateToken } = require('./utils');
const zod = require('zod');

// Define validation schema for login
const loginSchema = zod.object({
  email: zod.string().email("Invalid email format").toLowerCase().trim(),
  password: zod.string().min(1, "Password cannot be empty")
});

// Validate login request
const validateLoginRequest = (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body cannot be empty" });
    }
    
    const validatedData = loginSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ 
        error: validatedData.error.errors.map(e => e.message) 
      });
    }
    
    // Use the validated data
    req.body = validatedData.data;
    next();
  } catch (error) {
    console.error("Login validation error:", error);
    return res.status(500).json({ error: "Server error during login validation" });
  }
};

// Login controller for faculty
const facultyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find faculty by email
    const faculty = await Faculty.findOne({ email }).catch(err => {
      console.error("Database error during faculty login:", err);
      throw new Error("Database error during login");
    });
    
    if (!faculty) {
      // Use a generic error message for security
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare passwords
    const isMatch = await comparePassword(password, faculty.password);
    if (!isMatch) {
      // Use a consistent delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(faculty);
    
    // Return user info and token
    return res.status(200).json({
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        employeeId: faculty.employeeId,
        department: faculty.department,
        role: 'faculty'
      },
      token
    });
    
  } catch (error) {
    console.error("Faculty login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

// Login controller for student
const studentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find student by email
    const student = await Student.findOne({ email }).catch(err => {
      console.error("Database error during student login:", err);
      throw new Error("Database error during login");
    });
    
    if (!student) {
      // Use a generic error message for security
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare passwords
    const isMatch = await comparePassword(password, student.password);
    if (!isMatch) {
      // Use a consistent delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(student);
    
    // Return user info and token
    return res.status(200).json({
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        role: 'student'
      },
      token
    });
    
  } catch (error) {
    console.error("Student login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

module.exports = {
  validateLoginRequest,
  facultyLogin,
  studentLogin
};
