import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import FacultyNavbar from '../components/FacultyNavbar';
import SessionModal from '../components/SessionModal';

const FacultyDashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await facultyApi.getDashboard();
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
    <div className="faculty-dashboard">
      <FacultyNavbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {currentUser?.name || 'Faculty'}</h1>
          <button 
            className="create-session-btn"
            onClick={() => setShowSessionModal(true)}
          >
            Create New Session
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Courses</h3>
            <div className="stat-value">{dashboardData?.courses || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Active Sessions</h3>
            <div className="stat-value">{dashboardData?.activeSessions || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <div className="stat-value">{dashboardData?.totalStudents || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Average Attendance</h3>
            <div className="stat-value">{dashboardData?.averageAttendance || '0%'}</div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <div className="section-header">
              <h2>Upcoming Sessions</h2>
              <Link to="/faculty/sessions" className="view-all">View All</Link>
            </div>
            <div className="sessions-list">
              {dashboardData?.upcomingSessions?.length > 0 ? (
                dashboardData.upcomingSessions.map(session => (
                  <div className="session-card" key={session.id}>
                    <div className="session-info">
                      <h3>{session.course}</h3>
                      <p className="session-date">
                        {new Date(session.date).toLocaleDateString()} • {session.time}
                      </p>
                      <p className="session-topic">{session.topic}</p>
                    </div>
                    <Link to={`/faculty/sessions/${session.id}`} className="btn-view">
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="no-data">No upcoming sessions</p>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Recent Courses</h2>
              <Link to="/faculty/courses" className="view-all">View All</Link>
            </div>
            <div className="courses-list">
              {dashboardData?.recentCourses?.length > 0 ? (
                dashboardData.recentCourses.map(course => (
                  <div className="course-card" key={course.id}>
                    <div className="course-info">
                      <h3>{course.name}</h3>
                      <p>{course.code}</p>
                      <p>{course.students} students</p>
                    </div>
                    <Link to={`/faculty/courses/${course.id}`} className="btn-view">
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="no-data">No courses available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSessionModal && (
        <SessionModal 
          onClose={() => setShowSessionModal(false)} 
          onSuccess={() => {
            setShowSessionModal(false);
            // Refresh dashboard data
            facultyApi.getDashboard().then(res => setDashboardData(res.data));
          }}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
