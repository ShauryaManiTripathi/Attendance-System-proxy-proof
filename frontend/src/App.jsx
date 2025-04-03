import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import FacultySignup from './pages/FacultySignup';
import StudentSignup from './pages/StudentSignup';

// Dashboard pages
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Faculty pages
import FacultyCourses from './pages/FacultyCourses';
import FacultyCourseDetails from './pages/FacultyCourseDetails';
import FacultySessions from './pages/FacultySessions';
import FacultySessionDetails from './pages/FacultySessionDetails';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultyStudents from './pages/FacultyStudents';
import FacultyReports from './pages/FacultyReports';

// Student pages
import StudentCourses from './pages/StudentCourses';
import StudentCourseDetails from './pages/StudentCourseDetails';
import StudentAttendance from './pages/StudentAttendance';
import StudentSessions from './pages/StudentSessions';
import StudentSessionDetails from './pages/StudentSessionDetails';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/faculty-signup" element={<FacultySignup />} />
          <Route path="/student-signup" element={<StudentSignup />} />
          
          {/* Faculty Routes */}
          <Route 
            path="/faculty-dashboard" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/courses" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyCourses />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/courses/:id" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyCourseDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/sessions" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultySessions />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/sessions/:id" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultySessionDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/sessions/:id/attendance" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyAttendance />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/students" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyStudents />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/reports" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyReports />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/courses" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentCourses />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/courses/:id" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentCourseDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/attendance" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentAttendance />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/sessions" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentSessions />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/sessions/:id" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentSessionDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Home redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* 404 Page */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
