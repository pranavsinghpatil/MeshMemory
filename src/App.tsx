import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import * as Sentry from "@sentry/react";

// Wrap the app with Sentry error boundary
const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <SentryRoutes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/conversations/:sourceId" element={<ConversationView />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/search/enhanced" element={<EnhancedSearchPage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/chats/:chatId" element={<ChatsPage />} />
                <Route path="/chat-groups" element={<ChatGroupsPage />} />
                <Route path="/chat-groups/:groupId" element={<ChatGroupDetailPage />} />
                {/* Redirect old thread URLs to new chat URLs */}
                <Route path="/threads" element={<Navigate to="/chats" replace />} />
                <Route path="/threads/:threadId" element={({ match }) => (
                  <Navigate to={`/chats/${match.params.threadId}`} replace />
                )} />
                <Route path="/threadgroups" element={<Navigate to="/chat-groups" replace />} />
                <Route path="/threadgroups/:groupId" element={({ match }) => (
                  <Navigate to={`/chat-groups/${match.params.groupId}`} replace />
                )} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/future-features" element={<FutureFeatures />} />
                <Route path="/team" element={<TeamWorkspacePage />} />
                <Route path="/team/:teamId" element={<TeamWorkspacePage />} />
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