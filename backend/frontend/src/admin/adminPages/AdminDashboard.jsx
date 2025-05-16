import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AdminDashboard.css'; // Adjust the import path if necessary

function AdminDashboard() {
  const adminData = JSON.parse(localStorage.getItem('admin_data'));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <h1>Welcome, {adminData.first_name} (Admin)</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <div className="admin-dashboard-content">
        {/* Placeholder for dashboard content */}
        <p>Dashboard content goes here.</p>
        {/* You can later replace the placeholder with dynamic charts or statistics */}
      </div>
    </div>
  );
}

export default AdminDashboard;
