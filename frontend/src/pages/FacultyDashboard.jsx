import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';

const FacultyDashboard = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    document.title = 'Faculty Dashboard - Attendance System';
  }, []);

  const sidebarItems = [
    { label: 'Dashboard', path: '#overview', icon: '📊' },
    { label: 'Courses', path: '#courses', icon: '📚' },
    { label: 'Sessions', path: '#sessions', icon: '📅' },
    { label: 'Attendance', path: '#attendance', icon: '✓' },
    { label: 'Students', path: '#students', icon: '👥' },
    { label: 'Reports', path: '#reports', icon: '📝' },
    { label: 'Settings', path: '#settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-content-section">
            <h2>Welcome, {currentUser?.name}</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>Courses</h3>
                <p className="dashboard-stat">5</p>
              </div>
              <div className="dashboard-card">
                <h3>Students</h3>
                <p className="dashboard-stat">120</p>
              </div>
              <div className="dashboard-card">
                <h3>Sessions Today</h3>
                <p className="dashboard-stat">3</p>
              </div>
              <div className="dashboard-card">
                <h3>Pending Tasks</h3>
                <p className="dashboard-stat">2</p>
              </div>
            </div>
            <div className="dashboard-recent">
              <h3>Recent Activity</h3>
              <p>No recent activity to display.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content-section">
            <h2>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar items={sidebarItems} />
      
      <div className="dashboard-main">
        <Header title="Faculty Dashboard" />
        
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
