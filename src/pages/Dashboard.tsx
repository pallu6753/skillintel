import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import StudentDashboard from "@/pages/StudentDashboard";
import FacultyDashboard from "@/pages/FacultyDashboard";
import PlacementDashboard from "@/pages/PlacementDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "student": return <StudentDashboard />;
    case "faculty": return <FacultyDashboard />;
    case "placement": return <PlacementDashboard />;
    case "admin": return <AdminDashboard />;
    default: return <Navigate to="/login" replace />;
  }
}
