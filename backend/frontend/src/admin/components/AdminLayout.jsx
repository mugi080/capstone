// src/admin/components/AdminLayout.jsx
import React from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <>
      <AdminNavbar />
      <div style={{ display: "flex" }}>
        <AdminSidebar />
        <main style={{ flex: 1, marginLeft: '250px', padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
