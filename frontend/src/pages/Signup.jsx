import { useEffect } from 'react';
import SignupSelection from '../components/auth/SignupSelection';

const Signup = () => {
  useEffect(() => {
    document.title = 'Sign Up - Attendance System';
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Attendance System</h1>
        <SignupSelection />
      </div>
    </div>
  );
};

export default Signup;
