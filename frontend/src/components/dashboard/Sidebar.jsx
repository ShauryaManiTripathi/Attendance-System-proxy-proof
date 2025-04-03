import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ items }) => {
  const { logout, currentUser } = useAuth();

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="text-xl font-bold text-white m-0">Attendance System</h2>
        <p className="text-sm text-white/80 mt-1">v1.0</p>
      </div>
      
      <div className="sidebar-nav">
        <ul className="list-none p-0">
          {items.map((item, index) => (
            <li key={index}>
              <a href={item.path} className="sidebar-link">
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sidebar-footer">
        <div className="mb-4 text-sm">
          <p className="m-0 text-white/90">Logged in as:</p>
          <p className="m-0 font-semibold">{currentUser?.name}</p>
        </div>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
