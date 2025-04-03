import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FacultyNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar faculty-navbar">
      <div className="navbar-brand">
        <Link to="/faculty-dashboard">AS Attendance</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/faculty-dashboard" className="nav-item">Dashboard</Link>
        <Link to="/faculty/courses" className="nav-item">Courses</Link>
        <Link to="/faculty/sessions" className="nav-item">Sessions</Link>
        <Link to="/faculty/students" className="nav-item">Students</Link>
        <Link to="/faculty/reports" className="nav-item">Reports</Link>
      </div>
      <div className="navbar-profile">
        <div className="profile-dropdown">
          <button className="dropdown-button">
            {currentUser?.name || 'Faculty'}
            <span className="dropdown-icon">▼</span>
          </button>
          <div className="dropdown-content">
            <Link to="/faculty/profile">Profile</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FacultyNavbar;
