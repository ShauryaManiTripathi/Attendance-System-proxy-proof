import { useState, useEffect } from 'react';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';

const FacultyReports = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [reportType, setReportType] = useState('course'); // 'course', 'student', 'session'
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          facultyApi.getCourses(),
          facultyApi.getStudents()
        ]);
        
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
        setLoading(false);
        
        // If course is selected, fetch sessions for that course
        if (selectedCourse) {
          fetchSessionsForCourse(selectedCourse);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse]);

  const fetchSessionsForCourse = async (courseId) => {
    try {
      const sessionsRes = await facultyApi.getSessions();
      const filteredSessions = sessionsRes.data.filter(
        session => session.course.id === courseId
      );
      setSessions(filteredSessions);
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  const generateReport = async () => {
    setLoadingReport(true);
    setReportData(null);
    setError(null);

    try {
      let response;
      
      switch (reportType) {
        case 'course':
          if (!selectedCourse) {
            setError('Please select a course');
            setLoadingReport(false);
            return;
          }
          response = await facultyApi.getCourseAttendance(selectedCourse);
          break;
          
        case 'student':
          if (!selectedStudent) {
            setError('Please select a student');
            setLoadingReport(false);
            return;
          }
          response = await facultyApi.getStudentAttendance(selectedStudent);
          break;
          
        case 'session':
          if (!selectedSession) {
            setError('Please select a session');
            setLoadingReport(false);
            return;
          }
          response = await facultyApi.getSessionReport(selectedSession);
          break;
          
        default:
          setError('Invalid report type');
          setLoadingReport(false);
          return;
      }
      
      setReportData(response.data);
      setLoadingReport(false);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
      setLoadingReport(false);
    }
  };

  const renderReportFilters = () => {
    switch (reportType) {
      case 'course':
        return (
          <div className="filter-group">
            <label>Select Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loadingReport}
            >
              <option value="">-- Select a course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'student':
        return (
          <>
            <div className="filter-group">
              <label>Select Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={loadingReport}
              >
                <option value="">-- All courses --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Select Student:</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={loadingReport}
              >
                <option value="">-- Select a student --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.idNumber})
                  </option>
                ))}
              </select>
            </div>
          </>
        );
        
      case 'session':
        return (
          <>
            <div className="filter-group">
              <label>Select Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={loadingReport}
              >
                <option value="">-- Select a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Select Session:</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                disabled={loadingReport || !selectedCourse}
              >
                <option value="">-- Select a session --</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {new Date(session.date).toLocaleDateString()} - {session.topic}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  const renderReport = () => {
    if (!reportData) return null;
    
    switch (reportType) {
      case 'course':
        return (
          <div className="report-content course-report">
            <h2>Course Attendance Report</h2>
            <div className="report-header">
              <p><strong>Course:</strong> {reportData.course?.name} ({reportData.course?.code})</p>
              <p><strong>Total Students:</strong> {reportData.totalStudents}</p>
              <p><strong>Total Sessions:</strong> {reportData.totalSessions}</p>
              <p><strong>Average Attendance Rate:</strong> {reportData.averageAttendanceRate}</p>
            </div>
            
            <h3>Sessions</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.sessions?.map(session => (
                  <tr key={session.id}>
                    <td>{new Date(session.date).toLocaleDateString()}</td>
                    <td>{session.topic}</td>
                    <td>{session.present}</td>
                    <td>{session.absent}</td>
                    <td>{session.late}</td>
                    <td>{session.attendanceRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <h3>Student Attendance</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.studentAttendance?.map(student => (
                  <tr key={student.id}>
                    <td>{student.idNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.present}</td>
                    <td>{student.absent}</td>
                    <td>{student.late}</td>
                    <td>{student.attendanceRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'student':
        return (
          <div className="report-content student-report">
            <h2>Student Attendance Report</h2>
            <div className="report-header">
              <p><strong>Student:</strong> {reportData.student?.name} ({reportData.student?.idNumber})</p>
              <p><strong>Total Courses:</strong> {reportData.totalCourses}</p>
              <p><strong>Overall Attendance Rate:</strong> {reportData.overallAttendanceRate}</p>
            </div>
            
            <h3>Attendance by Course</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.courseAttendance?.map(course => (
                  <tr key={course.id}>
                    <td>{course.name} ({course.code})</td>
                    <td>{course.present}</td>
                    <td>{course.absent}</td>
                    <td>{course.late}</td>
                    <td>{course.attendanceRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <h3>Recent Sessions</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.recentSessions?.map(session => (
                  <tr key={session.id}>
                    <td>{new Date(session.date).toLocaleDateString()}</td>
                    <td>{session.course.name}</td>
                    <td>{session.topic}</td>
                    <td>{session.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'session':
        return (
          <div className="report-content session-report">
            <h2>Session Attendance Report</h2>
            <div className="report-header">
              <p><strong>Date:</strong> {new Date(reportData.session?.date).toLocaleDateString()}</p>
              <p><strong>Course:</strong> {reportData.session?.course.name} ({reportData.session?.course.code})</p>
              <p><strong>Topic:</strong> {reportData.session?.topic}</p>
              <p><strong>Time:</strong> {reportData.session?.startTime} - {reportData.session?.endTime}</p>
            </div>
            
            <h3>Attendance Summary</h3>
            <div className="attendance-summary">
              <div className="summary-stat">
                <div className="stat-value">{reportData.summary?.present || 0}</div>
                <div className="stat-label">Present</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{reportData.summary?.absent || 0}</div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{reportData.summary?.late || 0}</div>
                <div className="stat-label">Late</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{reportData.summary?.attendanceRate || '0%'}</div>
                <div className="stat-label">Attendance Rate</div>
              </div>
            </div>
            
            <h3>Student Attendance</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Time Marked</th>
                </tr>
              </thead>
              <tbody>
                {reportData.attendance?.map(record => (
                  <tr key={record.student.id}>
                    <td>{record.student.idNumber}</td>
                    <td>{record.student.name}</td>
                    <td className={record.status}>{record.status}</td>
                    <td>{record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return <p>No report data available</p>;
    }
  };

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading...</div>
    </div>
  );

  return (
    <div className="faculty-reports-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <h1>Attendance Reports</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="report-controls">
          <div className="report-type-selector">
            <div className="filter-group">
              <label>Report Type:</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
                disabled={loadingReport}
              >
                <option value="course">Course Report</option>
                <option value="student">Student Report</option>
                <option value="session">Session Report</option>
              </select>
            </div>
          </div>
          
          <div className="report-filters">
            {renderReportFilters()}
            
            <button 
              className="btn-generate"
              onClick={generateReport}
              disabled={loadingReport}
            >
              {loadingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        <div className="report-result">
          {loadingReport && (
            <div className="loading">Generating report...</div>
          )}

          {reportData && renderReport()}
          
          {reportData && (
            <div className="report-actions">
              <button className="btn-print" onClick={() => window.print()}>
                Print Report
              </button>
              <button className="btn-export">
                Export to CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyReports;
