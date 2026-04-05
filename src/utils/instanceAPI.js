import axios from "axios";

// You can store base URL in .env (recommended)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8082/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default api;