import { useEffect } from 'react';
import StudentSignupForm from '../components/auth/StudentSignupForm';

const StudentSignup = () => {
  useEffect(() => {
    document.title = 'Student Sign Up - Attendance System';
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Attendance System</h1>
        <StudentSignupForm />
      </div>
    </div>
  );
};

export default StudentSignup;
