import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function UnprotectedRoute() {
  const { user } = useSelector((state) => state.auth);

  // If user already logged in → redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, show the public route (login/register)
  return <Outlet />;
}
