import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentApi } from '../services/ApiService';
import StudentNavbar from '../components/StudentNavbar';

const StudentCourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await studentApi.getCourseDetails(id);
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load course details');
        console.error(err);
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) return (
    <div className="student-course-details-page">
      <StudentNavbar />
      <div className="container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 w-full max-w-2xl bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="student-course-details-page">
      <StudentNavbar />
      <div className="container">
        <div className="error-container">
          <div className="text-error text-xl mb-4">⚠️ {error}</div>
          <button className="btn-primary max-w-xs mx-auto" onClick={() => navigate('/student/courses')}>
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );

  if (!course) return (
    <div className="student-course-details-page">
      <StudentNavbar />
      <div className="container">
        <div className="error-container">
          <div className="text-xl text-gray-700 mb-4">Course not found</div>
          <button className="btn-primary max-w-xs mx-auto" onClick={() => navigate('/student/courses')}>
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="student-course-details-page">
      <StudentNavbar />
      <div className="container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/student/courses')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Courses
          </button>
          <h1 className="text-2xl md:text-3xl text-gray-800 font-bold m-0">{course.course.name}</h1>
        </div>

        <div className="course-details">
          <div className="course-info-card">
            <div className="course-header">
              <div className="course-code">{course.course.code}</div>
              <div className="course-credits">{course.course.credits} Credits</div>
            </div>
            
            <div className="course-description">
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
              <p>{course.course.description || 'No description available'}</p>
            </div>
            
            <div className="course-info">
              <p>
                <span className="inline-block w-20 font-semibold">Faculty:</span> 
                <span className="bg-blue-50 text-primary px-2 py-1 rounded">{course.faculty.name}</span>
              </p>
              <p>
                <span className="inline-block w-20 font-semibold">Group:</span> 
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">{course.group.name}</span>
              </p>
            </div>

            <div className="attendance-summary">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M9 14l2 2 4-4"></path>
                </svg>
                Your Attendance
              </h3>
              <div className="attendance-stats">
                <div className="stat">
                  <div className="stat-value">{course.attendance.totalSessions}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
                <div className="stat" style={{ backgroundColor: course.attendance.present > 0 ? '#e6f7e6' : '#f0f0f0' }}>
                  <div className="stat-value" style={{ color: '#2e7d32' }}>{course.attendance.present}</div>
                  <div className="stat-label">Present</div>
                </div>
                <div className="stat" style={{ backgroundColor: course.attendance.absent > 0 ? '#fce8e8' : '#f0f0f0' }}>
                  <div className="stat-value" style={{ color: '#c62828' }}>{course.attendance.absent}</div>
                  <div className="stat-label">Absent</div>
                </div>
                <div className="stat" style={{ backgroundColor: course.attendance.late > 0 ? '#fff8e0' : '#f0f0f0' }}>
                  <div className="stat-value" style={{ color: '#ff8f00' }}>{course.attendance.late}</div>
                  <div className="stat-label">Late</div>
                </div>
                <div className="stat" style={{ backgroundColor: course.attendance.unmarked > 0 ? '#e8eaf6' : '#f0f0f0' }}>
                  <div className="stat-value" style={{ color: '#3949ab' }}>{course.attendance.unmarked}</div>
                  <div className="stat-label">Unmarked</div>
                </div>
              </div>
              
              <div className="attendance-percentage">
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ 
                      width: course.attendance.attendancePercentage, 
                      backgroundColor: getAttendanceColor(course.attendance.attendancePercentage) 
                    }}
                  ></div>
                </div>
                <div 
                  className="percentage-value"
                  style={{ color: getAttendanceColor(course.attendance.attendancePercentage) }}
                >
                  {course.attendance.attendancePercentage}
                </div>
              </div>
            </div>
          </div>

          <div className="course-actions">
            <Link 
              to={`/student/attendance/course/${id}`} 
              className="btn-primary"
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                View Detailed Attendance
              </div>
            </Link>
            <Link 
              to="/student/sessions" 
              state={{ courseId: id }}
              className="btn-secondary"
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                View Sessions
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine color based on attendance percentage
const getAttendanceColor = (percentageStr) => {
  const percentage = parseInt(percentageStr);
  
  if (percentage >= 90) return '#2e7d32'; // Dark Green
  if (percentage >= 75) return '#689f38'; // Green
  if (percentage >= 60) return '#ff8f00'; // Orange
  return '#c62828'; // Red
};

export default StudentCourseDetails;
