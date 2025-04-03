import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import StudentNavbar from '../components/StudentNavbar';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await studentApi.getDashboard();
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="student-dashboard">
      <StudentNavbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {currentUser?.name || 'Student'}</h1>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>My Courses</h3>
            <div className="stat-value">{dashboardData?.courses || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Upcoming Sessions</h3>
            <div className="stat-value">{dashboardData?.upcomingSessions || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Attendance Rate</h3>
            <div className="stat-value">{dashboardData?.attendanceRate || '0%'}</div>
          </div>
          <div className="stat-card">
            <h3>Missed Sessions</h3>
            <div className="stat-value">{dashboardData?.missedSessions || 0}</div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <div className="section-header">
              <h2>Today's Sessions</h2>
              <Link to="/student/sessions" className="view-all">View All</Link>
            </div>
            <div className="sessions-list">
              {dashboardData?.todaySessions?.length > 0 ? (
                dashboardData.todaySessions.map(session => (
                  <div className="session-card" key={session.id}>
                    <div className="session-info">
                      <h3>{session.course}</h3>
                      <p className="session-faculty">by {session.faculty}</p>
                      <p className="session-time">{session.time}</p>
                      <p className="session-topic">{session.topic}</p>
                    </div>
                    <Link to={`/student/sessions/${session.id}`} className="btn-view">
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="no-data">No sessions today</p>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>My Courses</h2>
              <Link to="/student/courses" className="view-all">View All</Link>
            </div>
            <div className="courses-list">
              {dashboardData?.courses > 0 ? (
                <Link to="/student/courses" className="btn-primary">
                  View My Courses
                </Link>
              ) : (
                <p className="no-data">No courses enrolled</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
