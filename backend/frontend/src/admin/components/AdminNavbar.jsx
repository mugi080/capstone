import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AdminNavbar.css'; // Import your CSS file for styling

const AdminNavbar = () => {
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('admin_data'));

  if (!adminData) return null;

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    navigate('/admin/login');
  };

  return (
    <div className="admin-navbar">
      {/* Logo/Branding */}
      <div className="logo-container">
        <h2>Admin Panel</h2>
      </div>

      {/* Welcome message and logout */}
      <div className="navbar-right flex items-center gap-4">
        <span className="welcome-message">
          Welcome, <span className="admin-name">{adminData.first_name}</span>
        </span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
