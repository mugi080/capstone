import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));

  // Listen for login/logout changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };
  
    checkLoginStatus(); // Initial check
  
    // Listen for storage changes (detect login/logout from other components)
    window.addEventListener("storage", checkLoginStatus);
  
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("accessToken"); 
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false); // ✅ This ensures immediate state update
    navigate("/login"); 
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="BottleFlow Logo" />
      </div>
      <div className="menu">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/about">About</Link>
        <Link to="/reviews">Reviews</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/shop_now">Shop Now</Link>
        <Link to="/orders">Orders</Link>
      </div>

      <div className="login_btn">
        {isLoggedIn ? (
          <>
            <span className="user-icon">👤</span> {/* ✅ Replace with actual icon */}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button>Sign In</button>
            </Link>
            <Link to="/register">
              <button className="border_sign">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
