// src/components/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/Auth";
import "./LoginForm.css";  // Import the CSS file for this component

const LoginForm = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
        localStorage.setItem("access_token", result.token);
        localStorage.setItem("refresh_token", result.refresh_token);
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="form-container">
      <h2 className="title">Login</h2>
      
      {message && <p style={{ color: 'red' }}>{message}</p>}

      <form onSubmit={handleLogin} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" disabled={loading} className="form-btn">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="buttons-container">
        <div className="page-link">
          <Link to="/forgot-password" className="page-link-label">Forgot Password?</Link>
        </div>

        <div className="page-link">
          <span className="sign-up-label">
            Don't have an account? 
            <Link to="/register" className="sign-up-link">Register</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
