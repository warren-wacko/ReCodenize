import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (loading) fetchMe();
  }, [loading, fetchMe]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
