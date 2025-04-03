import { useAuth } from '../../contexts/AuthContext';

const Header = ({ title }) => {
  const { currentUser } = useAuth();

  return (
    <header className="dashboard-header">
      <h1>{title}</h1>
      
      <div className="user-info">
        <span className="user-name">{currentUser?.name}</span>
        <span className="user-role">{currentUser?.role === 'faculty' ? 'Faculty' : 'Student'}</span>
      </div>
    </header>
  );
};

export default Header;
