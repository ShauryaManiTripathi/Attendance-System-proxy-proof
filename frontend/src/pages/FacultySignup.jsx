import { useEffect } from 'react';
import FacultySignupForm from '../components/auth/FacultySignupForm';

const FacultySignup = () => {
  useEffect(() => {
    document.title = 'Faculty Sign Up - Attendance System';
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Attendance System</h1>
        <FacultySignupForm />
      </div>
    </div>
  );
};

export default FacultySignup;
