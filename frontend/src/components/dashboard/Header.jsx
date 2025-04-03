import { useAuth } from '../../contexts/AuthContext';

const Header = ({ title }) => {
  const { currentUser } = useAuth();

  return (
    <header className="dashboard-header">
      <h1 className="text-2xl font-bold m-0">{title}</h1>
      
      <div className="user-info text-right">
        <span className="user-name font-medium block">{currentUser?.name}</span>
        <span className="user-role text-sm text-gray-500 block">
          {currentUser?.role === 'faculty' ? 'Faculty' : 'Student'}
        </span>
      </div>
    </header>
  );
};

export default Header;
