import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Faculty API endpoints
const facultyApi = {
  getDashboard: () => api.get('/faculty/dashboard'),
  getCourses: () => api.get('/faculty/courses'),
  getCourseById: (id) => api.get(`/faculty/courses/${id}`),
  getCourseAttendance: (id) => api.get(`/faculty/courses/${id}/attendance`),
  getSessions: () => api.get('/faculty/sessions'),
  createSession: (sessionData) => api.post('/faculty/sessions', sessionData),
  getSessionById: (id) => api.get(`/faculty/sessions/${id}`),
  getSessionAttendance: (id) => api.get(`/faculty/sessions/${id}/attendance`),
  recordAttendance: (id, attendanceData) => api.post(`/faculty/sessions/${id}/attendance`, attendanceData),
  getStudents: () => api.get('/faculty/students'),
  getStudentAttendance: (id) => api.get(`/faculty/students/${id}/attendance`),
  getSessionReport: (id) => api.get(`/faculty/sessions/${id}/report`),
};

// Student API endpoints
const studentApi = {
  getDashboard: () => api.get('/student/dashboard'),
  getCourses: () => api.get('/student/courses'),
  getCourseDetails: (id) => api.get(`/student/courses/${id}`),
  getAttendance: () => api.get('/student/attendance'),
  getCourseAttendance: (courseId) => api.get(`/student/attendance/course/${courseId}`),
  markAttendance: (sessionId) => api.post('/student/attendance/mark', { sessionId }),
  getSessions: () => api.get('/student/sessions'),
  getSessionDetails: (id) => api.get(`/student/sessions/${id}`),
  getUpcomingSessions: () => api.get('/student/sessions/upcoming'),
};

// Authentication API endpoints
const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  facultySignup: (data) => api.post('/auth/faculty/signup', data),
  studentSignup: (data) => api.post('/auth/student/signup', data),
};

export { api, facultyApi, studentApi, authApi };
