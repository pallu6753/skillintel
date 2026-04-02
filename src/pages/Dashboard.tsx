import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  console.log("Logged Role:", user.role);

  // Redirect to role-specific dashboard
  switch (user.role) {
    case "student": return <Navigate to="/student-dashboard" replace />;
    case "faculty": return <Navigate to="/faculty-dashboard" replace />;
    case "placement": return <Navigate to="/placement-dashboard" replace />;
    case "admin": return <Navigate to="/admin-dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
}
