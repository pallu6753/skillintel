import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QuizPage from "./pages/QuizPage";
import CodingPractice from "./pages/CodingPractice";
import InterviewSimulator from "./pages/InterviewSimulator";
import SkillGap from "./pages/SkillGap";
import CareerIntelligence from "./pages/CareerIntelligence";
import StudyHabits from "./pages/StudyHabits";
import Notifications from "./pages/Notifications";
import StudentsPage from "./pages/StudentsPage";
import StudentProfile from "./pages/StudentProfile";
import AtRiskPage from "./pages/AtRiskPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SkillsDBPage from "./pages/SkillsDBPage";
import SettingsPage from "./pages/SettingsPage";
import PlacementDrives from "./pages/PlacementDrives";
import LeaderboardPage from "./pages/LeaderboardPage";
import ApplicationTracker from "./pages/ApplicationTracker";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AICopilot from "./pages/AICopilot";
import PlacementIntelligence from "./pages/PlacementIntelligence";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/quiz/:type" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
    <Route path="/coding-practice" element={<ProtectedRoute><CodingPractice /></ProtectedRoute>} />
    <Route path="/interview-simulator" element={<ProtectedRoute><InterviewSimulator /></ProtectedRoute>} />
    <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
    <Route path="/career" element={<ProtectedRoute><CareerIntelligence /></ProtectedRoute>} />
    <Route path="/study-habits" element={<ProtectedRoute><StudyHabits /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
    <Route path="/student/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
    <Route path="/at-risk" element={<ProtectedRoute><AtRiskPage /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
    <Route path="/skills-db" element={<ProtectedRoute><SkillsDBPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    <Route path="/placement-drives" element={<ProtectedRoute><PlacementDrives /></ProtectedRoute>} />
    <Route path="/placement-intelligence" element={<ProtectedRoute><PlacementIntelligence /></ProtectedRoute>} />
    <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
    <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
    <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
    <Route path="/ai-copilot" element={<ProtectedRoute><AICopilot /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
