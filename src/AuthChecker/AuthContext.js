import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../Utils/instanceAPI.js';
import { loggedUserDataAPI } from '../Utils/homePageAPI.js';
import { logoutHandleAPI } from '../Utils/authAPI.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // null = initial checking, true = authenticated, false = not authenticated
  const [auth, setAuth] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Double Check: Step 1 = check-auth (Cookie Verification), Step 2 = loggedUserDataAPI (Data Fetch)
  const verifyAuthAndFetchUser = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Cookie Authentication Check
      const checkRes = await api.get("/auth/check-auth");

      if (checkRes.data === true) {
        // Step 2: Fetch Logged User Data
        try {
          const userData = await loggedUserDataAPI();
          setLoggedUser(userData);
          setAuth(true);
        } catch (userErr) {
          setLoggedUser(null);
          setAuth(false);
        }
      } else {
        setLoggedUser(null);
        setAuth(false);
      }
    } catch (err) {
      setLoggedUser(null);
      setAuth(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuthAndFetchUser();
  }, [verifyAuthAndFetchUser]);

  // Login handler
  const login = async () => {
    await verifyAuthAndFetchUser();
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutHandleAPI();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      setLoggedUser(null);
      setAuth(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        loggedUser,
        setLoggedUser,
        loading,
        isAuthenticated: auth === true,
        verifyAuthAndFetchUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
