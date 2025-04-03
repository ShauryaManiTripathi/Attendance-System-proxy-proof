import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../services/ApiService';
import StudentNavbar from '../components/StudentNavbar';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await studentApi.getCourses();
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return (
    <div>
      <StudentNavbar />
      <div className="loading">Loading courses...</div>
    </div>
  );

  return (
    <div className="student-courses-page">
      <StudentNavbar />
      <div className="container">
        <div className="page-header">
          <h1>My Courses</h1>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div className="course-card" key={course.id}>
                <div className="course-code">{course.code}</div>
                <h3 className="course-name">{course.name}</h3>
                <div className="course-info">
                  <p>
                    <strong>Faculty:</strong> {course.faculty.name}
                  </p>
                  <p>
                    <strong>Group:</strong> {course.group.name}
                  </p>
                  <p>
                    <strong>Credits:</strong> {course.credits}
                  </p>
                </div>
                <div className="course-actions">
                  <Link 
                    to={`/student/courses/${course.id}`} 
                    className="btn-primary"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/student/attendance/course/${course.id}`}
                    className="btn-secondary"
                  >
                    View Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            {searchTerm ? 
              "No courses match your search" : 
              "You are not enrolled in any courses yet"
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
