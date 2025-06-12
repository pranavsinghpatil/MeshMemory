import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConversationView from './pages/ConversationView';
import SearchPage from './pages/SearchPage';
import EnhancedSearchPage from './pages/EnhancedSearchPage';
import ThreadsPage from './pages/ThreadsPage';
<<<<<<< HEAD
import ThreadGroupsPage from './pages/ThreadGroupsPage';
import ThreadGroupDetailPage from './pages/ThreadGroupDetailPage';
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
=======
import SettingsPage from './pages/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
<<<<<<< HEAD
        <WorkspaceProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <SentryRoutes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/conversations/:sourceId" element={<ConversationView />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/search/enhanced" element={<EnhancedSearchPage />} />
                <Route path="/threads" element={<ThreadsPage />} />
                <Route path="/threads/:threadId" element={<ThreadsPage />} />
                <Route path="/threadgroups" element={<ThreadGroupsPage />} />
                <Route path="/threadgroups/:groupId" element={<ThreadGroupDetailPage />} />
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
=======
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/conversations/:sourceId" element={<ConversationView />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/threads" element={<ThreadsPage />} />
              <Route path="/threads/:threadId" element={<ThreadsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </Router>
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
      </AuthProvider>
    </ThemeProvider>
  );
}

// Create a Sentry-wrapped version of the app
export default Sentry.withProfiler(App);