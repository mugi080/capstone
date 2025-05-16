import React from 'react';
import { Link } from 'react-router-dom';
import './css/AdminSidebar.css';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>

      <ul className="space-y-4">
        <li>
          <Link
            to="/admin/dashboard"
            className="sidebar-link"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/orders"
            className="sidebar-link"
          >
            Orders
          </Link>
        </li>
        <li>
          <Link
            to="/admin/inventory"
            className="sidebar-link"
          >
            Inventory
          </Link>
        </li>
        <li>
          <Link
            to="/admin/customers"
            className="sidebar-link"
          >
            Customer
          </Link>
        </li>
        <li>
          <Link
            to="/admin/staff"
            className="sidebar-link"
          >
            Employee
          </Link>
        </li>

        <li>
          <Link
            to="/admin/vehicles"
            className="sidebar-link"
          >
            vehicle
          </Link>
        </li>
        <li>
          <Link
            to="/admin/logistics"
            className="sidebar-link"
          >
            Logistics
          </Link>
        </li>
        <li>
          <Link
            to="/admin/reviews"
            className="sidebar-link"
          >
            Reviews
          </Link>
        </li>
        <li>
          <Link
            to="/admin/analytics"
            className="sidebar-link"
          >
            Analytics Report
          </Link>
        </li>


      </ul>

      <button className="sidebar-button">Additional Action</button>
    </div>
  );
};

export default AdminSidebar;
