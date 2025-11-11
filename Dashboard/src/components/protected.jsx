import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { user } = useSelector((state) => state.auth);

  // If no user in Redux (and no localStorage fallback), redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render child routes (like /dashboard)
  return <Outlet />;
}
