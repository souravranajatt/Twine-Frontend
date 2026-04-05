import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/instanceAPI"; // axios instance withCredentials:true

const PublicRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/check-auth"); // backend check
        setAuth(res.data);  // user logged in
      } catch (err) {
        setAuth(false); // user not logged in
      }
    };

    checkAuth();
  }, []);

  if (auth === null) return <div>Loading...</div>; // optional loading

  // If logged in → redirect to home page
  return auth ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
