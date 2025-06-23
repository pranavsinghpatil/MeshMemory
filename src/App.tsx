
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import { checkApiHealth, logEnvironmentInfo } from "./lib/apiHealth";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChatsPage from "./pages/ChatsPage";
import ChatGroupsPage from "./pages/ChatGroupsPage";
import ThreadGroupsPage from "./pages/ThreadGroupsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import TeamWorkspacePage from "./pages/TeamWorkspacePage";
import NotFound from "./pages/NotFound";
import "./index.css";
import { OAuthCallback } from "./pages/OAuthCallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Log environment info on app start
logEnvironmentInfo();

// Perform API health check on app initialization
checkApiHealth().then(status => {
  console.log(`API Health Check: ${status.status === 'ok' ? '✅ Connected' : '❌ Connection Issue'}`);
  if (status.status === 'error') {
    console.warn('Backend connection issue:', status.message, status.details);
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            
            {/* Protected routes with layout */}
            <Route path="/app" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="chat-groups" element={<ChatGroupsPage />} />
              <Route path="thread-groups" element={<ThreadGroupsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="team" element={<TeamWorkspacePage />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
