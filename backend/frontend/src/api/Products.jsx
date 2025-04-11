import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

export const getCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}categories/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      return [];
    }
  };
  
  // Fetch all beverages
  export const getBeverages = async () => {
    try {
      const response = await axios.get(`${API_URL}beverages/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching beverages:", error.message);
      return [];
    }
  };