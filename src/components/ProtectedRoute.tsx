import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type Role = "SEEKER" | "EMPLOYER";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRole?: Role;
};

function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <p role="status">Checking your account...</p>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/account" replace />;
  }

  return children;
}

export default ProtectedRoute;