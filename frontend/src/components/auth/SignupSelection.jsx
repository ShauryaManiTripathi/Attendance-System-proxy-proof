import { useNavigate } from 'react-router-dom';

const SignupSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-selection">
      <h2>Create an Account</h2>
      <p>Choose your account type:</p>
      
      <div className="selection-options">
        <button 
          className="selection-button"
          onClick={() => navigate('/faculty-signup')}
        >
          <h3>Faculty</h3>
          <p>For teachers and administrators</p>
        </button>
        
        <button 
          className="selection-button"
          onClick={() => navigate('/student-signup')}
        >
          <h3>Student</h3>
          <p>For students enrolled in courses</p>
        </button>
      </div>
      
      <p>
        Already have an account?{' '}
        <button 
          className="text-button" 
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default SignupSelection;
