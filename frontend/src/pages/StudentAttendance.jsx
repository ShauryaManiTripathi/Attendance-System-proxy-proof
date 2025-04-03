import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { studentApi } from '../services/ApiService';
import StudentNavbar from '../components/StudentNavbar';

const StudentAttendance = () => {
  const location = useLocation();
  const { courseId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses for filter dropdown
        const coursesResponse = await studentApi.getCourses();
        setCourses(coursesResponse.data);
        
        // Fetch attendance data based on whether a course is selected
        let attendanceData;
        if (selectedCourse) {
          const response = await studentApi.getCourseAttendance(selectedCourse);
          attendanceData = response.data;
        } else {
          const response = await studentApi.getAttendance();
          attendanceData = response.data;
        }
        
        setAttendance(attendanceData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load attendance data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, courseId]);

  // Apply filters to attendance data
  const filteredAttendance = attendance.filter(record => {
    let matchesStatus = true;
    let matchesDate = true;
    
    if (filterStatus) {
      matchesStatus = record.status === filterStatus;
    }
    
    if (dateRange.start) {
      const recordDate = new Date(record.date);
      const startDate = new Date(dateRange.start);
      matchesDate = recordDate >= startDate;
    }
    
    if (dateRange.end) {
      const recordDate = new Date(record.date);
      const endDate = new Date(dateRange.end);
      matchesDate = matchesDate && (recordDate <= endDate);
    }
    
    return matchesStatus && matchesDate;
  });

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterStatus('');
    setDateRange({ start: '', end: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
      <div className="loading">Loading attendance records...</div>
    </div>
  );

  return (
    <div className="student-attendance-page">
      <StudentNavbar />
      <div className="container">
        <div className="page-header">
          <h1>My Attendance</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-section">
          <div className="filter-group">
            <label>Course:</label>
            <select 
              value={selectedCourse} 
              onChange={handleCourseChange}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterStatus}
              onChange={handleStatusChange}
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="unmarked">Unmarked</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>From:</label>
            <input 
              type="date" 
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="filter-group">
            <label>To:</label>
            <input 
              type="date" 
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
            />
          </div>
          
          <button 
            className="btn-clear-filters"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        {filteredAttendance.length > 0 ? (
          <div className="attendance-records">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Faculty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map(record => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      {record.course.name}
                      <div className="course-code">{record.course.code}</div>
                    </td>
                    <td>{record.topic}</td>
                    <td>{record.faculty.name}</td>
                    <td>
                      <span className={getStatusBadgeClass(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <Link 
                        to={`/student/sessions/${record.sessionId}`} 
                        className="btn-view"
                      >
                        View Session
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            {(selectedCourse || filterStatus || dateRange.start || dateRange.end) ? 
              "No attendance records match your filters" : 
              "No attendance records found"
            }
          </div>
        )}
        
        {filteredAttendance.length > 0 && (
          <div className="attendance-summary">
            <h3>Summary</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{filteredAttendance.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {filteredAttendance.filter(r => r.status === 'present').length}
                </div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {filteredAttendance.filter(r => r.status === 'absent').length}
                </div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {filteredAttendance.filter(r => r.status === 'late').length}
                </div>
                <div className="stat-label">Late</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
