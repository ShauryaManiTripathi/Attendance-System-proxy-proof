import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';

const FacultyAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSessionAttendance = async () => {
      try {
        // Fetch session details
        const sessionResponse = await facultyApi.getSessionById(id);
        setSession(sessionResponse.data);
        
        // Fetch attendance for this session
        const attendanceResponse = await facultyApi.getSessionAttendance(id);
        setAttendanceList(attendanceResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load session attendance data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchSessionAttendance();
  }, [id]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceList(prevList =>
      prevList.map(item =>
        item.student.id === studentId ? { ...item, status } : item
      )
    );
  };

  const handleSubmitAttendance = async () => {
    try {
      setSaving(true);
      
      // Format attendance data for API
      const attendanceData = {
        sessionId: id,
        attendanceData: attendanceList.map(item => ({
          studentId: item.student.id,
          status: item.status
        }))
      };
      
      await facultyApi.recordAttendance(id, attendanceData);
      
      setSaveSuccess(true);
      setSaving(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save attendance data');
      console.error(err);
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading attendance data...</div>
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

  return (
    <div className="faculty-attendance-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <button 
            className="btn-back" 
            onClick={() => navigate(`/faculty/sessions/${id}`)}
          >
            &lt; Back to Session
          </button>
          <h1>Mark Attendance</h1>
        </div>

        {saveSuccess && (
          <div className="success-message">
            Attendance saved successfully!
          </div>
        )}

        {session && (
          <div className="session-info-banner">
            <div className="session-details">
              <h2>{session.course?.name}</h2>
              <div className="session-meta">
                <span>{formatDate(session.date)}</span>
                <span>{session.startTime} - {session.endTime}</span>
                <span>Group: {session.group?.name || 'All Groups'}</span>
              </div>
              <div className="session-topic">{session.topic}</div>
            </div>
          </div>
        )}

        <div className="attendance-tools">
          <div className="bulk-actions">
            <button 
              className="btn-mark-all"
              onClick={() => {
                setAttendanceList(prevList =>
                  prevList.map(item => ({ ...item, status: 'present' }))
                );
              }}
            >
              Mark All Present
            </button>
            <button 
              className="btn-mark-all"
              onClick={() => {
                setAttendanceList(prevList =>
                  prevList.map(item => ({ ...item, status: 'absent' }))
                );
              }}
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="attendance-list">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID Number</th>
                <th className="status-column">Present</th>
                <th className="status-column">Absent</th>
                <th className="status-column">Late</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length > 0 ? (
                attendanceList.map(item => (
                  <tr key={item.student.id}>
                    <td>{item.student.name}</td>
                    <td>{item.student.idNumber}</td>
                    <td className="status-cell">
                      <input 
                        type="radio" 
                        id={`present-${item.student.id}`}
                        name={`status-${item.student.id}`}
                        checked={item.status === 'present'}
                        onChange={() => handleAttendanceChange(item.student.id, 'present')}
                      />
                      <label htmlFor={`present-${item.student.id}`}>Present</label>
                    </td>
                    <td className="status-cell">
                      <input 
                        type="radio" 
                        id={`absent-${item.student.id}`}
                        name={`status-${item.student.id}`}
                        checked={item.status === 'absent'}
                        onChange={() => handleAttendanceChange(item.student.id, 'absent')}
                      />
                      <label htmlFor={`absent-${item.student.id}`}>Absent</label>
                    </td>
                    <td className="status-cell">
                      <input 
                        type="radio" 
                        id={`late-${item.student.id}`}
                        name={`status-${item.student.id}`}
                        checked={item.status === 'late'}
                        onChange={() => handleAttendanceChange(item.student.id, 'late')}
                      />
                      <label htmlFor={`late-${item.student.id}`}>Late</label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No students found for this session
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button 
            className="btn-cancel"
            onClick={() => navigate(`/faculty/sessions/${id}`)}
          >
            Cancel
          </button>
          <button 
            className="btn-save"
            onClick={handleSubmitAttendance}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyAttendance;
