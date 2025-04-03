import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();

  // If still loading auth state, show nothing
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If role is required and doesn't match, redirect to appropriate dashboard
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to={currentUser.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard'} />;
  }

  // Otherwise, render the protected component
  return children;
};

export default ProtectedRoute;
