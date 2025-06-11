import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConversationView from './pages/ConversationView';
import SearchPage from './pages/SearchPage';
import ThreadsPage from './pages/ThreadsPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/conversations/:sourceId" element={<ConversationView />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/threads" element={<ThreadsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;