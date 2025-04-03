import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('faculty');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, userType);
      
      // Redirect based on user type
      if (userType === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Sign In</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userType">Login as:</label>
          <select 
            id="userType" 
            value={userType} 
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p>
        Don't have an account?{' '}
        <button 
          className="text-button" 
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
