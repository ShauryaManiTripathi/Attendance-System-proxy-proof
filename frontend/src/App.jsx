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
          
          {/* Protected Routes */}
          <Route 
            path="/faculty-dashboard" 
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
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
