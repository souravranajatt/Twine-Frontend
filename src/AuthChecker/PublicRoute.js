import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loader from "../Components/Loader/Loader";

const PublicRoute = ({ children }) => {
  const { auth } = useAuth();

  if (auth === null) return <Loader />;

  return auth ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;

