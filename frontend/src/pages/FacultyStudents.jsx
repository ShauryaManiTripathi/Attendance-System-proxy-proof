import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          facultyApi.getStudents(),
          facultyApi.getCourses()
        ]);
        
        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load students data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.idNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse ? 
      student.courses.some(course => course.id === filterCourse) : true;
      
    return matchesSearch && matchesCourse;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCourse(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCourse('');
  };

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading students...</div>
    </div>
  );

  return (
    <div className="faculty-students-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <h1>Students</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Filter by Course:</label>
            <select
              value={filterCourse}
              onChange={handleFilterChange}
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

        <div className="students-container">
          {filteredStudents.length > 0 ? (
            <table className="students-table">
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Courses</th>
                  <th>Attendance Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.idNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.courses?.length || 0} courses</td>
                    <td>
                      <div className={`attendance-rate ${getAttendanceClass(student.attendanceRate)}`}>
                        {student.attendanceRate || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <Link 
                        to={`/faculty/students/${student.id}/attendance`}
                        className="btn-view-attendance"
                      >
                        View Attendance
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">
              {filterCourse || searchTerm ? 
                "No students match your search criteria" : 
                "No students found"
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine attendance rate class
const getAttendanceClass = (rate) => {
  if (!rate) return '';
  
  const percentage = parseInt(rate.replace('%', ''));
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'average';
  return 'poor';
};

export default FacultyStudents;
