import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Utils/instanceAPI";
import Loader from "../Components/Loader/Loader";

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

  if (auth === null) return <Loader />;

  return auth ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
