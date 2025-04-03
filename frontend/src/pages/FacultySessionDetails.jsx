import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';

const FacultySessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await facultyApi.getSessionById(id);
        setSession(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load session details');
        console.error(err);
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading session details...</div>
    </div>
  );

  if (error) return (
    <div>
      <FacultyNavbar />
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={() => navigate('/faculty/sessions')}>
          Back to Sessions
        </button>
      </div>
    </div>
  );

  if (!session) return (
    <div>
      <FacultyNavbar />
      <div className="error-container">
        <div className="error-message">Session not found</div>
        <button className="btn-back" onClick={() => navigate('/faculty/sessions')}>
          Back to Sessions
        </button>
      </div>
    </div>
  );

  return (
    <div className="faculty-session-details-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/faculty/sessions')}>
            &lt; Back to Sessions
          </button>
          <h1>Session Details</h1>
        </div>

        <div className="session-details-card">
          <div className="session-header">
            <h2>{session.course?.name}</h2>
            <div className="session-meta">
              <span className="session-date">{formatDate(session.date)}</span>
              <span className="session-time">{session.startTime} - {session.endTime}</span>
            </div>
          </div>

          <div className="session-info">
            <div className="info-group">
              <label>Topic:</label>
              <span className="topic-text">{session.topic || 'No topic specified'}</span>
            </div>
            
            <div className="info-group">
              <label>Group:</label>
              <span>{session.group?.name || 'All Groups'}</span>
            </div>
            
            <div className="info-group">
              <label>Course Code:</label>
              <span>{session.course?.code}</span>
            </div>

            <div className="info-group">
              <label>Status:</label>
              <span className={`session-status ${getSessionStatus(session).toLowerCase()}`}>
                {getSessionStatus(session)}
              </span>
            </div>
          </div>

          <div className="attendance-summary">
            <h3>Attendance Summary</h3>
            {session.attendanceSummary ? (
              <div className="attendance-stats">
                <div className="stat-item">
                  <span className="stat-value present">{session.attendanceSummary.present || 0}</span>
                  <span className="stat-label">Present</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value absent">{session.attendanceSummary.absent || 0}</span>
                  <span className="stat-label">Absent</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value late">{session.attendanceSummary.late || 0}</span>
                  <span className="stat-label">Late</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value unmarked">{session.attendanceSummary.unmarked || 0}</span>
                  <span className="stat-label">Unmarked</span>
                </div>
              </div>
            ) : (
              <p className="no-data">No attendance data available yet</p>
            )}
          </div>

          <div className="session-actions">
            <Link 
              to={`/faculty/sessions/${id}/attendance`} 
              className="btn-primary"
            >
              Mark Attendance
            </Link>
            <Link 
              to={`/faculty/sessions/${id}/report`} 
              className="btn-secondary"
            >
              Attendance Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine session status based on date and time
const getSessionStatus = (session) => {
  const now = new Date();
  const sessionDate = new Date(session.date);
  
  // Set session start and end times on the session date
  const startTime = session.startTime.split(':');
  const endTime = session.endTime.split(':');
  
  const sessionStart = new Date(sessionDate);
  sessionStart.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0);
  
  const sessionEnd = new Date(sessionDate);
  sessionEnd.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0);

  if (now < sessionStart) {
    return 'Upcoming';
  } else if (now >= sessionStart && now <= sessionEnd) {
    return 'In Progress';
  } else {
    return 'Completed';
  }
};

export default FacultySessionDetails;
