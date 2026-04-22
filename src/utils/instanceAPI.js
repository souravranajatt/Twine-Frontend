import axios from "axios";

// Nginx will proxy /api requests to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;