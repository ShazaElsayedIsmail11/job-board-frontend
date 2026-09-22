import type { ReactNode } from "react";
import { Navigate } from "react-router";

type ProtectedRouteProps = {
  token: string | null;
  children: ReactNode;
};

function ProtectedRoute({
  token,
  children,
}: ProtectedRouteProps) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;