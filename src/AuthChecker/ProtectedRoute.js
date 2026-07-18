import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Utils/instanceAPI";
import Loader from "../Components/Loader/Loader";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await api.get("/auth/check-auth");
        setAuth(res.data);
      } catch (err) {
        setAuth(false);
      }
    };

    verifyAuth();
  }, []);

  if (auth === null) return <Loader />;

  return auth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
