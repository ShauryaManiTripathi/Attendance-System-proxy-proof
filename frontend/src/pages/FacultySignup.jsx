import { useEffect } from 'react';
import FacultySignupForm from '../components/auth/FacultySignupForm';

const FacultySignup = () => {
  useEffect(() => {
    document.title = 'Faculty Sign Up - Attendance System';
  }, []);

  return (
    <div className="auth-page bg-gray-100">
      <div className="auth-container">
        <h1 className="text-primary text-3xl font-bold">Attendance System</h1>
        <FacultySignupForm />
      </div>
    </div>
  );
};

export default FacultySignup;
