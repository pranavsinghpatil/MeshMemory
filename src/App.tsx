import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConversationView from './pages/ConversationView';
import SearchPage from './pages/SearchPage';
import EnhancedSearchPage from './pages/EnhancedSearchPage';
import ChatsPage from './pages/ChatsPage';
import ChatGroupsPage from './pages/ChatGroupsPage';
import ChatGroupDetailPage from './pages/ChatGroupDetailPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FutureFeatures from './pages/FutureFeatures';
import TeamWorkspacePage from './pages/TeamWorkspacePage';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import Layout from './components/Layout';
import * as Sentry from "@sentry/react";

// Wrap the app with Sentry error boundary
const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user && !isGuest) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Component to wrap protected content with Layout
const ProtectedContent = ({ children, title }: { children: React.ReactNode, title?: string }) => {
  return (
    <ProtectedRoute>
      <Layout title={title}>{children}</Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-[#333446] transition-colors">
              <SentryRoutes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LandingPage />} />
                
                {/* Protected routes with Layout */}
                <Route path="/dashboard" element={<ProtectedContent title="Dashboard"><Dashboard /></ProtectedContent>} />
                <Route path="/conversations/:sourceId" element={<ProtectedContent title="Conversation"><ConversationView /></ProtectedContent>} />
                <Route path="/search" element={<ProtectedContent title="Search"><SearchPage /></ProtectedContent>} />
                <Route path="/search/enhanced" element={<ProtectedContent title="Enhanced Search"><EnhancedSearchPage /></ProtectedContent>} />
                <Route path="/chats" element={<ProtectedContent title="Chats"><ChatsPage /></ProtectedContent>} />
                <Route path="/chats/:chatId" element={<ProtectedContent title="Chat"><ChatsPage /></ProtectedContent>} />
                <Route path="/chat-groups" element={<ProtectedContent title="Chat Groups"><ChatGroupsPage /></ProtectedContent>} />
                <Route path="/chat-groups/:groupId" element={<ProtectedContent title="Chat Group"><ChatGroupDetailPage /></ProtectedContent>} />
                
                {/* Redirect old thread URLs to new chat URLs */}
                <Route path="/threads" element={<Navigate to="/chats" replace />} />
                <Route path="/threads/:threadId" element={<Navigate to="/chats" replace />} />
                <Route path="/threadgroups" element={<Navigate to="/chat-groups" replace />} />
                <Route path="/threadgroups/:groupId" element={<Navigate to="/chat-groups" replace />} />
                
                <Route path="/settings" element={<ProtectedContent title="Settings"><SettingsPage /></ProtectedContent>} />
                <Route path="/help" element={<ProtectedContent title="Help"><HelpPage /></ProtectedContent>} />
                <Route path="/analytics" element={<ProtectedContent title="Analytics"><AnalyticsPage /></ProtectedContent>} />
                <Route path="/future-features" element={<ProtectedContent title="Future Features"><FutureFeatures /></ProtectedContent>} />
                <Route path="/team" element={<ProtectedContent title="Team Workspace"><TeamWorkspacePage /></ProtectedContent>} />
                <Route path="/team/:teamId" element={<ProtectedContent title="Team Workspace"><TeamWorkspacePage /></ProtectedContent>} />
              </SentryRoutes>
            </div>
          </Router>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Create a Sentry-wrapped version of the app
export default Sentry.withProfiler(App);