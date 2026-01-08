import { Toaster } from "@/components/ui/toaster";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import WorkThreadDetail from "./pages/WorkThreadDetail";
import InsightsPage from "./pages/InsightsPage";
import ProfilePage from "./pages/ProfilePage";
import IntegrationsPage from "./pages/IntegrationsPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import InviteAcceptPage from "./pages/InviteAcceptPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import NotFound from "./pages/NotFound";
import { AIChatBot } from "./components/AIChatBot";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./lib/msal";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = '636666241864-fronahev0ijj9vr0a0lue6lhuunqnp87.apps.googleusercontent.com';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/thread/:threadId"
                  element={
                    <ProtectedRoute>
                      <WorkThreadDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insights"
                  element={
                    <ProtectedRoute>
                      <InsightsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute>
                      <IntegrationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute>
                      <TeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/join"
                  element={
                    <ProtectedRoute>
                      <InviteAcceptPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId"
                  element={
                    <ProtectedRoute>
                      <TeamDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatBotWrapper />
            </BrowserRouter>
          </AuthProvider>
        </MsalProvider>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AIChatBotWrapper = () => {
  return <AIChatBot />;
};

export default App;
