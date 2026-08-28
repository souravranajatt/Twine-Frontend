import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loader from "../Components/Loader/Loader";

const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();

  if (auth === null) return <Loader />;

  return auth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

