const { Faculty, Student } = require('../schemas');
const { hashPassword } = require('./utils');
const zod = require('zod');

// Define validation schemas using zod
const facultySignupSchema = zod.object({
  name: zod.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters").trim(),
  email: zod.string().email("Invalid email format").toLowerCase().trim(),
  employeeId: zod.string().min(4, "Employee ID must be at least 4 characters").max(20, "Employee ID cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Employee ID can only contain alphanumeric characters, hyphens, and underscores"),
  department: zod.string().min(2, "Department must be at least 2 characters").max(50, "Department cannot exceed 50 characters"),
  password: zod.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

const studentSignupSchema = zod.object({
  name: zod.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters").trim(),
  email: zod.string().email("Invalid email format").toLowerCase().trim(),
  rollNumber: zod.string().min(4, "Roll number must be at least 4 characters").max(20, "Roll number cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Roll number can only contain alphanumeric characters, hyphens, and underscores"),
  password: zod.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

// Request body validation middleware
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }
  next();
};

// Middleware for faculty signup validation
const validateFacultySignup = async (req, res, next) => {
  try {
    // Validate request body against schema
    const validatedData = facultySignupSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        error: validatedData.error.errors.map(e => e.message) 
      });
    }
    
    // Use the validated data
    req.body = validatedData.data;
    
    // Check if faculty with same email or employeeId already exists
    const existingFaculty = await Faculty.findOne({
      $or: [
        { email: req.body.email },
        { employeeId: req.body.employeeId }
      ]
    }).catch(err => {
      console.error("Database error during faculty lookup:", err);
      throw new Error("Database error during validation");
    });
    
    if (existingFaculty) {
      if (existingFaculty.email === req.body.email) {
        return res.status(409).json({ error: "Email already in use" });
      } else {
        return res.status(409).json({ error: "Employee ID already in use" });
      }
    }
    
    // Hash password using our utility function
    req.body.password = await hashPassword(req.body.password)
      .catch(err => {
        console.error("Password hashing error:", err);
        throw new Error("Error processing password");
      });
    
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return res.status(400).json({ 
        error: error.errors.map(e => e.message) 
      });
    }
    
    console.error("Signup validation error:", error);
    return res.status(500).json({ error: "Server error during signup validation" });
  }
};

// Middleware for student signup validation
const validateStudentSignup = async (req, res, next) => {
  try {
    // Validate request body against schema
    const validatedData = studentSignupSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        error: validatedData.error.errors.map(e => e.message) 
      });
    }
    
    // Use the validated data
    req.body = validatedData.data;
    
    // Check if student with same email or rollNumber already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: req.body.email },
        { rollNumber: req.body.rollNumber }
      ]
    }).catch(err => {
      console.error("Database error during student lookup:", err);
      throw new Error("Database error during validation");
    });
    
    if (existingStudent) {
      if (existingStudent.email === req.body.email) {
        return res.status(409).json({ error: "Email already in use" });
      } else {
        return res.status(409).json({ error: "Roll number already in use" });
      }
    }
    
    // Hash password using our utility function
    req.body.password = await hashPassword(req.body.password)
      .catch(err => {
        console.error("Password hashing error:", err);
        throw new Error("Error processing password");
      });
    
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return res.status(400).json({ 
        error: error.errors.map(e => e.message) 
      });
    }
    
    console.error("Signup validation error:", error);
    return res.status(500).json({ error: "Server error during signup validation" });
  }
};

module.exports = {
  validateRequestBody,
  validateFacultySignup,
  validateStudentSignup
};
