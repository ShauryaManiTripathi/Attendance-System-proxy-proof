import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../services/ApiService';
import StudentNavbar from '../components/StudentNavbar';

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [allSessionsRes, upcomingSessionsRes] = await Promise.all([
          studentApi.getSessions(),
          studentApi.getUpcomingSessions()
        ]);
        
        setSessions(allSessionsRes.data);
        setUpcomingSessions(upcomingSessionsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load sessions');
        console.error(err);
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleMarkAttendance = async (sessionId) => {
    try {
      await studentApi.markAttendance(sessionId);
      
      // Update the session status in the UI
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, attendanceStatus: 'present' } 
          : session
      ));
      
      setUpcomingSessions(upcomingSessions.map(session => 
        session.id === sessionId 
          ? { ...session, attendanceStatus: 'present' } 
          : session
      ));
    } catch (err) {
      setError('Failed to mark attendance');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present': return 'status-badge present';
      case 'absent': return 'status-badge absent';
      case 'late': return 'status-badge late';
      default: return 'status-badge unmarked';
    }
  };

  if (loading) return (
    <div>
      <StudentNavbar />
      <div className="loading">Loading sessions...</div>
    </div>
  );

  return (
    <div className="student-sessions-page">
      <StudentNavbar />
      <div className="container">
        <div className="page-header">
          <h1>My Sessions</h1>
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Sessions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Sessions
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="sessions-container">
          {activeTab === 'all' ? (
            sessions.length > 0 ? (
              <div className="sessions-list">
                {sessions.map(session => (
                  <div className="session-card" key={session.id}>
                    <div className="session-date">
                      {formatDate(session.date)}
                    </div>
                    <div className="session-details">
                      <h3>{session.course.name}</h3>
                      <p className="session-time">{session.time}</p>
                      <p className="session-faculty">Faculty: {session.faculty.name}</p>
                      <p className="session-topic">{session.topic}</p>
                      <div className={getStatusBadgeClass(session.attendanceStatus)}>
                        {session.attendanceStatus || 'Not marked'}
                      </div>
                    </div>
                    <div className="session-actions">
                      <Link 
                        to={`/student/sessions/${session.id}`}
                        className="btn-details"
                      >
                        Details
                      </Link>
                      {session.attendanceStatus === 'unmarked' && new Date(session.date) <= new Date() && (
                        <button 
                          className="btn-mark-attendance"
                          onClick={() => handleMarkAttendance(session.id)}
                        >
                          Mark Attendance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No sessions found</p>
            )
          ) : (
            upcomingSessions.length > 0 ? (
              <div className="sessions-list">
                {upcomingSessions.map(session => (
                  <div className="session-card upcoming" key={session.id}>
                    <div className="session-date">
                      {formatDate(session.date)}
                    </div>
                    <div className="session-details">
                      <h3>{session.course.name}</h3>
                      <p className="session-time">{session.startTime} - {session.endTime}</p>
                      <p className="session-faculty">Faculty: {session.faculty.name}</p>
                      <p className="session-topic">{session.topic}</p>
                    </div>
                    <div className="session-actions">
                      <Link 
                        to={`/student/sessions/${session.id}`}
                        className="btn-details"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No upcoming sessions</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSessions;
