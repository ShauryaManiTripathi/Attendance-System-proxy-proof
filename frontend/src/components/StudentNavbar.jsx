import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StudentNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar student-navbar">
      <div className="navbar-brand">
        <Link to="/student-dashboard">AS Attendance</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/student-dashboard" className="nav-item">Dashboard</Link>
        <Link to="/student/courses" className="nav-item">My Courses</Link>
        <Link to="/student/attendance" className="nav-item">My Attendance</Link>
        <Link to="/student/sessions" className="nav-item">Sessions</Link>
      </div>
      <div className="navbar-profile">
        <div className="profile-dropdown">
          <button className="dropdown-button">
            {currentUser?.name || 'Student'}
            <span className="dropdown-icon">▼</span>
          </button>
          <div className="dropdown-content">
            <Link to="/student/profile">Profile</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
