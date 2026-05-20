import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/instanceAPI"; // tumhara axios instance (withCredentials:true)
import Loader from "../Components/Loader/Loader";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); // null → loading

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await api.get("/auth/check-auth"); // backend se auth check
        setAuth(res.data);
      } catch (err) {
        setAuth(false);
      }
    };

    verifyAuth();
  }, []);

  if (auth === null) return <Loader />; // optional loading

  return auth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
