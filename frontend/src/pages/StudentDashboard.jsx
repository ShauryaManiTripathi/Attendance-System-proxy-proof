import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    document.title = 'Student Dashboard - Attendance System';
  }, []);

  const sidebarItems = [
    { label: 'Dashboard', path: '#overview', icon: '📊' },
    { label: 'Courses', path: '#courses', icon: '📚' },
    { label: 'Attendance', path: '#attendance', icon: '✓' },
    { label: 'Schedule', path: '#schedule', icon: '📅' },
    { label: 'Profile', path: '#profile', icon: '👤' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Welcome, {currentUser?.name}</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3 className="text-gray-500 text-base font-medium">Courses</h3>
                <p className="dashboard-stat">4</p>
              </div>
              <div className="dashboard-card">
                <h3 className="text-gray-500 text-base font-medium">Upcoming Sessions</h3>
                <p className="dashboard-stat">2</p>
              </div>
              <div className="dashboard-card">
                <h3 className="text-gray-500 text-base font-medium">Attendance Rate</h3>
                <p className="dashboard-stat">95%</p>
              </div>
              <div className="dashboard-card">
                <h3 className="text-gray-500 text-base font-medium">Missed Sessions</h3>
                <p className="dashboard-stat">1</p>
              </div>
            </div>
            <div className="dashboard-schedule">
              <h3 className="font-medium">Today's Schedule</h3>
              <p className="text-gray-600">No classes scheduled for today.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar items={sidebarItems} />
      
      <div className="dashboard-main">
        <Header title="Student Dashboard" />
        
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
