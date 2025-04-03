import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    document.title = 'Login - Attendance System';
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Attendance System</h1>
        
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
