import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi } from '../services/ApiService';
import FacultyNavbar from '../components/FacultyNavbar';

const FacultyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await facultyApi.getCourses();
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

  if (loading) return (
    <div>
      <FacultyNavbar />
      <div className="loading">Loading courses...</div>
    </div>
  );

  if (error) return (
    <div>
      <FacultyNavbar />
      <div className="error-message">{error}</div>
    </div>
  );

  return (
    <div className="faculty-courses-page">
      <FacultyNavbar />
      <div className="container">
        <div className="page-header">
          <h1>My Courses</h1>
        </div>

        {courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map(course => (
              <div className="course-card" key={course.id}>
                <div className="course-code">{course.code}</div>
                <h3 className="course-name">{course.name}</h3>
                <div className="course-meta">
                  <span>{course.credits} Credits</span>
                  <span>{course.students || 0} Students</span>
                </div>
                <div className="course-actions">
                  <Link 
                    to={`/faculty/courses/${course.id}`} 
                    className="btn-view-course"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/faculty/courses/${course.id}/attendance`} 
                    className="btn-attendance"
                  >
                    Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>You don't have any courses assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyCourses;
