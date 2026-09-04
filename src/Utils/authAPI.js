import api from "./instanceAPI";

// Login API Function
export const loginUserAuthAPI = async (userData) => {
  try {
    const response = await api.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Signup API Function
export const signupUserAuthAPI = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Signup Send OTP API Function
export const sendOtpAuthAPI = async (userData) => {
  try {
    const response = await api.post("/auth/send-otp", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Verify OTP API Function
export const verifyOtpAuthAPI = async (otpData) => {
  try {
    const response = await api.post("/auth/verify-otp", otpData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};

// Logout Functionality
export const logoutHandleAPI = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
}

// Logout a specific session 
export const logoutSessionAPI = async (sessionId) => {
  try {
    const response = await api.delete(`/auth/logout-device/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Something went wrong!";
  }
};
