import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LNavigate } from "./LLink";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LNavigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => user?.roles.includes(role))
  ) {
    return <LNavigate to="/" replace />;
  }

  return <Outlet />;
}
