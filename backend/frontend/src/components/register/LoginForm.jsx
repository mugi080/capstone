import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/Auth"; // Import login function

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    const result = await loginUser(username, password);
  
    if (result.success) {
      localStorage.setItem("accessToken", result.token); // Store token
      window.dispatchEvent(new Event("storage")); // Notify Navbar of login
      navigate("/"); // Redirect to homepage
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
