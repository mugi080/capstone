import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

// Function to register a new user
export const registerUser = async (username, password) => {
  try {
    await axios.post(`${API_URL}register/`, {
      username,
      password,
    });
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data.error : "Registration failed",
    };
  }
};

// Function to login user
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, { username, password });
    
    // Store token (you can use sessionStorage, localStorage or cookies here)
    localStorage.setItem("access_token", response.data.access); // Store JWT token

    return {
      success: true,
      token: response.data.access,  // JWT Token
    };
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data.error : "Invalid credentials",
    };
  }
};
