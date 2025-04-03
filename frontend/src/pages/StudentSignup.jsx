import { useEffect } from 'react';
import StudentSignupForm from '../components/auth/StudentSignupForm';

const StudentSignup = () => {
  useEffect(() => {
    document.title = 'Student Sign Up - Attendance System';
  }, []);

  return (
    <div className="auth-page bg-gray-100">
      <div className="auth-container">
        <h1 className="text-primary text-3xl font-bold">Attendance System</h1>
        <StudentSignupForm />
      </div>
    </div>
  );
};

export default StudentSignup;
