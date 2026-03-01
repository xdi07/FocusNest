import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FaceDetectionProvider } from "@/contexts/FaceDetectionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AdminLayout from "@/layouts/AdminLayout";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import FocusPage from "./pages/FocusPage";
import GoalsPage from "./pages/GoalsPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import LoginAttemptsPage from "./pages/LoginAttemptsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogins from "./pages/admin/AdminLogins";
import AdminSessions from "./pages/admin/AdminSessions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <FaceDetectionProvider checkInterval={10000}>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Onboarding />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/focus" element={<ProtectedRoute><FocusPage /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/login-attempts" element={<ProtectedRoute><LoginAttemptsPage /></ProtectedRoute>} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="logins" element={<AdminLogins />} />
                <Route path="sessions" element={<AdminSessions />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FaceDetectionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
