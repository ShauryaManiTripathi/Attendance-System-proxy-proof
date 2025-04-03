import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';
import SessionModal from '../components/SessionModal';

const FacultySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, coursesRes] = await Promise.all([
          facultyApi.getSessions(),
          facultyApi.getCourses()
        ]);
        
        setSessions(sessionsRes.data);
        setCourses(coursesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateSession = () => {
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredSessions = sessions.filter(session => {
    let matchesDate = true;
    let matchesCourse = true;
    
    if (filterDate) {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      matchesDate = sessionDate === filterDate;
    }
    
    if (filterCourse) {
      matchesCourse = session.course.id === filterCourse;
    }
    
    return matchesDate && matchesCourse;
  });

  const clearFilters = () => {
    setFilterDate('');
    setFilterCourse('');
  };

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading sessions...</div>
    </div>
  );

  return (
    <div className="faculty-sessions-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <h1>Session Management</h1>
          <button 
            className="btn-create-session"
            onClick={handleCreateSession}
          >
            Create New Session
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-section">
          <div className="filter-group">
            <label>Filter by Date:</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Filter by Course:</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn-clear-filters"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="sessions-container">
          {filteredSessions.length > 0 ? (
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Group</th>
                  <th>Time</th>
                  <th>Topic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(session => (
                  <tr key={session.id}>
                    <td>{formatDate(session.date)}</td>
                    <td>
                      {session.course.name}
                      <span className="course-code">({session.course.code})</span>
                    </td>
                    <td>{session.group?.name}</td>
                    <td>{`${session.startTime} - ${session.endTime}`}</td>
                    <td>{session.topic}</td>
                    <td className="session-actions">
                      <Link 
                        to={`/faculty/sessions/${session.id}`}
                        className="btn-view"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/faculty/sessions/${session.id}/attendance`}
                        className="btn-attendance"
                      >
                        Attendance
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">
              {filterDate || filterCourse ? 
                "No sessions match your filters" : 
                "No sessions found"
              }
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <SessionModal 
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            // Refresh sessions data
            facultyApi.getSessions().then(res => setSessions(res.data));
          }}
        />
      )}
    </div>
  );
};

export default FacultySessions;
