import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ items }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Attendance System</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <button 
                className="sidebar-link" 
                onClick={() => navigate(item.path)}
              >
                {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button 
          className="logout-button" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
