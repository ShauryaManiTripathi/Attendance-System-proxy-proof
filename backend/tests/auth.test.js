const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Assuming you have an app.js file
const { Faculty, Student } = require('../schemas');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Setup and teardown
beforeAll(async () => {
  // Connect to a test database
  await mongoose.connect('mongodb://admin:passwd@localhost:27017/AS_test?authSource=admin');
});

beforeEach(async () => {
  // Clear database before each test
  await Faculty.deleteMany({});
  await Student.deleteMany({});
  
  // Create test users
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  await Faculty.create({
    name: 'Test Faculty',
    email: 'faculty@test.com',
    employeeId: 'FACT001',
    department: 'Computer Science',
    password: hashedPassword
  });
  
  await Student.create({
    name: 'Test Student',
    email: 'student@test.com',
    rollNumber: 'STU001',
    password: hashedPassword
  });
});

afterAll(async () => {
  // Disconnect from database
  await mongoose.connection.close();
});

// Faculty signup tests
describe('Faculty Signup', () => {
  test('Should create a new faculty with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/signup')
      .send({
        name: 'New Faculty',
        email: 'new.faculty@test.com',
        employeeId: 'FACT002',
        department: 'Mathematics',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
  });
  
  test('Should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/signup')
      .send({
        name: 'New Faculty',
        email: 'invalid-email',
        employeeId: 'FACT002',
        department: 'Mathematics',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
  
  test('Should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/signup')
      .send({
        name: 'New Faculty',
        email: 'new.faculty@test.com',
        employeeId: 'FACT002',
        department: 'Mathematics',
        password: 'simple'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
  
  test('Should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/signup')
      .send({
        name: 'New Faculty',
        email: 'faculty@test.com', // existing email
        employeeId: 'FACT002',
        department: 'Mathematics',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

// Student signup tests
describe('Student Signup', () => {
  test('Should create a new student with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/student/signup')
      .send({
        name: 'New Student',
        email: 'new.student@test.com',
        rollNumber: 'STU002',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
  });
  
  test('Should reject duplicate roll number', async () => {
    const res = await request(app)
      .post('/api/auth/student/signup')
      .send({
        name: 'New Student',
        email: 'new.student@test.com',
        rollNumber: 'STU001', // existing roll number
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

// Login tests
describe('User Login', () => {
  test('Faculty should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/login')
      .send({
        email: 'faculty@test.com',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('faculty');
  });
  
  test('Student should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'student@test.com',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('student');
  });
  
  test('Should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/login')
      .send({
        email: 'faculty@test.com',
        password: 'WrongPassword123!'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
  
  test('Should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/faculty/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'Password123!'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// Authentication middleware tests
describe('Authentication Middleware', () => {
  let validToken, expiredToken, invalidToken;
  
  beforeEach(() => {
    // Generate valid token for testing
    const faculty = { _id: new mongoose.Types.ObjectId(), employeeId: 'FACT001' };
    validToken = jwt.sign(
      { id: faculty._id, role: 'faculty' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Generate expired token
    expiredToken = jwt.sign(
      { id: faculty._id, role: 'faculty' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '0s' }
    );
    
    // Generate invalid token
    invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImludmFsaWQiLCJyb2xlIjoiZmFjdWx0eSIsImlhdCI6MTYxNjc2MjQ0OCwiZXhwIjoxNjE2ODQ4ODQ4fQ.invalidSignature';
  });
  
  test('Should allow access with valid token', async () => {
    const res = await request(app)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(res.statusCode).not.toBe(401);
  });
  
  test('Should reject access with expired token', async () => {
    const res = await request(app)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token has expired');
  });
  
  test('Should reject access with invalid token', async () => {
    const res = await request(app)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${invalidToken}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid token');
  });
  
  test('Should reject access without token', async () => {
    const res = await request(app)
      .get('/api/protected-route');
    
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});
