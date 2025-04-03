import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';

const FacultyCourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseResponse = await facultyApi.getCourseById(id);
        setCourse(courseResponse.data);
        
        // Fetch sessions for this course (if your API supports it)
        try {
          const sessionsResponse = await facultyApi.getSessions();
          const courseSessions = sessionsResponse.data.filter(
            session => session.course.id === id
          );
          setSessions(courseSessions);
        } catch (sessionErr) {
          console.error('Failed to load sessions for this course', sessionErr);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load course details');
        console.error(err);
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading course details...</div>
    </div>
  );

  if (error) return (
    <div>
      <FacultyNavbar />
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={() => navigate('/faculty/courses')}>
          Back to Courses
        </button>
      </div>
    </div>
  );

  if (!course) return (
    <div>
      <FacultyNavbar />
      <div className="error-container">
        <div className="error-message">Course not found</div>
        <button className="btn-back" onClick={() => navigate('/faculty/courses')}>
          Back to Courses
        </button>
      </div>
    </div>
  );

  return (
    <div className="faculty-course-details-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <button 
            className="btn-back" 
            onClick={() => navigate('/faculty/courses')}
          >
            &lt; Back to Courses
          </button>
          <h1>{course.name}</h1>
        </div>

        <div className="course-details">
          <div className="course-info-card">
            <div className="course-header">
              <div className="course-code">{course.code}</div>
              <div className="course-credits">{course.credits} Credits</div>
            </div>
            
            <div className="course-description">
              <h3>Description</h3>
              <p>{course.description || 'No description available'}</p>
            </div>
            
            <div className="course-meta-info">
              <div className="info-group">
                <h3>Total Students</h3>
                <div className="info-value">{course.students || 0}</div>
              </div>
              
              <div className="info-group">
                <h3>Groups</h3>
                <div className="info-value">
                  {course.groups?.length || 0} Groups
                </div>
              </div>
              
              <div className="info-group">
                <h3>Average Attendance</h3>
                <div className="info-value">
                  {course.averageAttendance || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="course-actions">
            <Link 
              to={`/faculty/courses/${id}/attendance`} 
              className="btn-primary"
            >
              View Attendance Report
            </Link>
            <Link 
              to="/faculty/sessions" 
              state={{ courseId: id }}
              className="btn-secondary"
            >
              Create New Session
            </Link>
          </div>
        </div>

        <div className="course-sessions">
          <div className="section-header">
            <h2>Recent Sessions</h2>
            <Link 
              to="/faculty/sessions" 
              state={{ courseId: id }}
              className="view-all"
            >
              View All
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="sessions-list">
              {sessions.slice(0, 5).map(session => (
                <div className="session-card" key={session.id}>
                  <div className="session-date">
                    {formatDate(session.date)}
                  </div>
                  <div className="session-details">
                    <h3>{session.topic || 'Untitled Session'}</h3>
                    <p>Time: {session.startTime} - {session.endTime}</p>
                    <p>Group: {session.group?.name || 'All Groups'}</p>
                  </div>
                  <div className="session-actions">
                    <Link 
                      to={`/faculty/sessions/${session.id}`}
                      className="btn-view"
                    >
                      Details
                    </Link>
                    <Link 
                      to={`/faculty/sessions/${session.id}/attendance`}
                      className="btn-attendance"
                    >
                      Attendance
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No sessions found for this course</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyCourseDetails;
