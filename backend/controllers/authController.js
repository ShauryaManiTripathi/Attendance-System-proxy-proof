const { Faculty, Student } = require('../schemas');
const { generateToken } = require('../auth/utils');

// Faculty signup handler
const facultySignup = async (req, res, next) => {
  try {
    // At this point, the request body has been validated and the password has been hashed
    const faculty = await Faculty.create(req.body);
    
    // Return user data without password
    const userData = {
      id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      employeeId: faculty.employeeId,
      department: faculty.department,
      role: 'faculty'
    };
    
    return res.status(201).json({
      message: 'Faculty account created successfully',
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

// Student signup handler
const studentSignup = async (req, res, next) => {
  try {
    // At this point, the request body has been validated and the password has been hashed
    const student = await Student.create(req.body);
    
    // Return user data without password
    const userData = {
      id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      role: 'student'
    };
    
    return res.status(201).json({
      message: 'Student account created successfully',
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  facultySignup,
  studentSignup
};
