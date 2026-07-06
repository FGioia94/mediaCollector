import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireEditor?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requireEditor = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, canEditContent } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireEditor && !canEditContent) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
