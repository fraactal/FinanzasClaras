import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="screen-center">Cargando tu espacio financiero...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}
