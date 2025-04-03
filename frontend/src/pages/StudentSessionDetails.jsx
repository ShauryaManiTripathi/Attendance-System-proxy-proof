import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../services/ApiService';
import StudentNavbar from '../components/StudentNavbar';

const StudentSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [markSuccess, setMarkSuccess] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await studentApi.getSessionDetails(id);
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

  const handleMarkAttendance = async () => {
    try {
      setMarkingAttendance(true);
      await studentApi.markAttendance(id);
      
      // Update session status in the UI
      setSession(prev => ({
        ...prev,
        attendance: {
          ...prev.attendance,
          status: 'present',
          timestamp: new Date().toISOString()
        }
      }));
      
      setMarkSuccess(true);
      setMarkingAttendance(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setMarkSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to mark attendance');
      console.error(err);
      setMarkingAttendance(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present': return 'status-badge present';
      case 'absent': return 'status-badge absent';
      case 'late': return 'status-badge late';
      default: return 'status-badge unmarked';
    }
  };

  const isSessionActive = () => {
    if (!session) return false;
    
    const sessionDate = new Date(session.date);
    const todayDate = new Date();
    
    // Compare date only (not time)
    return sessionDate.toDateString() === todayDate.toDateString();
  };

  if (loading) return (
    <div>
      <StudentNavbar />
      <div className="loading">Loading session details...</div>
    </div>
  );

  if (error) return (
    <div>
      <StudentNavbar />
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={() => navigate('/student/sessions')}>
          Back to Sessions
        </button>
      </div>
    </div>
  );

  if (!session) return (
    <div>
      <StudentNavbar />
      <div className="error-container">
        <div className="error-message">Session not found</div>
        <button className="btn-back" onClick={() => navigate('/student/sessions')}>
          Back to Sessions
        </button>
      </div>
    </div>
  );

  return (
    <div className="student-session-details-page">
      <StudentNavbar />
      <div className="container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/student/sessions')}>
            &lt; Back to Sessions
          </button>
          <h1>Session Details</h1>
        </div>

        {markSuccess && (
          <div className="success-message">
            Attendance marked successfully!
          </div>
        )}

        <div className="session-details-card">
          <div className="session-header">
            <h2>{session.course.name}</h2>
            <div className={getStatusBadgeClass(session.attendance.status)}>
              {session.attendance.status || 'Not marked'}
            </div>
          </div>

          <div className="session-info">
            <div className="info-group">
              <label>Date:</label>
              <span>{formatDate(session.date)}</span>
            </div>
            
            <div className="info-group">
              <label>Time:</label>
              <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
            </div>
            
            <div className="info-group">
              <label>Faculty:</label>
              <span>{session.faculty.name}</span>
            </div>
            
            <div className="info-group">
              <label>Topic:</label>
              <span>{session.topic}</span>
            </div>
            
            <div className="info-group">
              <label>Group:</label>
              <span>{session.group.name}</span>
            </div>
            
            {session.attendance.timestamp && (
              <div className="info-group">
                <label>Marked at:</label>
                <span>{new Date(session.attendance.timestamp).toLocaleString()}</span>
              </div>
            )}
          </div>

          {session.attendance.status === 'unmarked' && isSessionActive() && (
            <div className="attendance-actions">
              <button 
                className="btn-mark-attendance"
                onClick={handleMarkAttendance}
                disabled={markingAttendance}
              >
                {markingAttendance ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSessionDetails;
