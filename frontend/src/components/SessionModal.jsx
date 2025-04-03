import { useState, useEffect } from 'react';
import { facultyApi } from '../services/ApiService';

const SessionModal = ({ onClose, onSuccess, editSession = null }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    groupId: '',
    topic: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await facultyApi.getCourses();
        setCourses(response.data);
        setLoading(false);
        
        // If editing an existing session, populate the form
        if (editSession) {
          setFormData({
            courseId: editSession.course.id,
            groupId: editSession.group?.id || '',
            topic: editSession.topic,
            date: formatDate(new Date(editSession.date)),
            startTime: editSession.startTime,
            endTime: editSession.endTime,
          });
        }
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [editSession]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const sessionData = {
        course: formData.courseId,
        group: formData.groupId,
        topic: formData.topic,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };
      
      if (editSession) {
        // Update existing session logic would go here
        // Currently not implemented in the backend routes
      } else {
        await facultyApi.createSession(sessionData);
      }
      
      onSuccess();
    } catch (err) {
      setError('Failed to save session');
      console.error(err);
    }
  };

  if (loading) return <div className="modal-backdrop"><div className="modal-content">Loading...</div></div>;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editSession ? 'Edit Session' : 'Create New Session'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="session-form">
          <div className="form-group">
            <label htmlFor="courseId">Course</label>
            <select 
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="groupId">Group</label>
            <select 
              id="groupId"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              required
            >
              <option value="">Select a group</option>
              {formData.courseId && courses.find(c => c.id === formData.courseId)?.groups?.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input 
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              placeholder="Session topic or description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input 
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input 
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input 
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editSession ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
