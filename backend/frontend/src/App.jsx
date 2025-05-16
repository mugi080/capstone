import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// User Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetails";
import OrderingPage from "./pages/ordering/OrderingPage";
import Order from "./pages/ordering/Order";
import RegisterForm from "./components/register/RegisterForm";
import LoginForm from "./components/register/LoginForm";
import Activate from "./components/user/Activate";
import ForgotPassword from "./components/user/ForgotPassword";
import ResetPasswordConfirm from "./components/user/ResetPasswordConfirm";
import UserProfile from "./components/user/UserProfile";
import Navbar from "./components/navbar/NavBar";
import CheckoutForm from "./pages/ordering/CheckoutForm";

// Role Request
import RoleRequestForm from "./components/user/RoleRequestForm";
import AdminRoleRequests from "./components/user/AdminRoleRequests";

// Admin Pages
import AdminLogin from "./admin/AdminLogin";    
import AdminDashboard from "./admin/adminPages/AdminDashboard";
import AdminNavbar from "./admin/components/AdminNavbar";
import AdminSidebar from "./admin/components/AdminSidebar";
import AdminOrders from "./admin/adminPages/AdminOrders";
import Inventory from "./admin/adminPages/Inventory";
import CreateOrderForm from "./admin/adminPages/CreateOrderForm";
import CustomerTable from "./admin/adminPages/CustomerTable";
import StaffTable from "./admin/adminPages/StaffTable";
import VehicleTable from "./admin/adminPages/VehicleTable";
import Logistics from "./admin/adminPages/Logistic";

// Staff Pages
import StaffLogin from "./staff/StaffLogin";
import StaffDashboard from "./staff/staffPages/StaffDashboard";

// Styles
import "./App.css";

function AppRoutes() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isStaffPath = location.pathname.startsWith("/staff");

  return (
    <>
      {isAdminPath ? (
        <>
          {location.pathname !== "/admin/login" && <AdminNavbar />}
          <div className="admin-layout">
            {location.pathname !== "/admin/login" && <AdminSidebar />}
            <div className="admin-content">
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/role-request" element={<AdminRoleRequests />} />
                <Route path="/admin/inventory" element={<Inventory />} />
                <Route path="/admin/orders/create-order" element={<CreateOrderForm />} />
                <Route path="/admin/customers" element={<CustomerTable />} />
                <Route path="/admin/staff" element={<StaffTable />} />
                <Route path="/admin/vehicles" element={<VehicleTable />} />
                <Route path="/admin/logistics" element={<Logistics />} />
              </Routes>
            </div>
          </div>
        </>
      ) : isStaffPath ? (
        <>
          <div className="staff-layout">
            <div className="staff-content">
              <Routes>
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                {/* Add other staff-specific routes here */}
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <>
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shop_now" element={<OrderingPage />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product-detail/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<CheckoutForm />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/activate/:uid/:token" element={<Activate />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/password/reset/confirm/:uid/:token/" element={<ResetPasswordConfirm />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/request-role" element={<RoleRequestForm />} />
            </Routes>
          </div>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
