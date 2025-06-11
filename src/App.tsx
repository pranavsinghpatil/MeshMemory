import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConversationView from './pages/ConversationView';
import SearchPage from './pages/SearchPage';
import ThreadsPage from './pages/ThreadsPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;