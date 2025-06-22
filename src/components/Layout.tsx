import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ImportModal from './ImportModal';
import AuthModal from './AuthModal';
import { useUIStore } from '../store/useStore';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

// Helper function to get page title based on the current route
function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/chats')) return 'Chats';
  if (pathname.startsWith('/search')) return 'Search';
  if (pathname.startsWith('/chat-groups')) return 'Chat Groups';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/help') return 'Help';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname.startsWith('/team')) return 'Team Workspace';
  
  // Convert path to title
  return pathname.split('/').pop()?.replace(/-/g, ' ') || 'MeshMemory';
}

export default function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isGuest, continueAsGuest } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const location = useLocation();

  // Show welcome screen for unauthenticated users
  const showWelcomeScreen = !user && !isGuest;

  if (showWelcomeScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7EFC7] to-white dark:from-[#333446] dark:to-[#333446] flex items-center justify-center transition-colors">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-[#333446] rounded-xl shadow-lg border border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-[#AEC8A4] dark:bg-[#7F8CAA] flex items-center justify-center mb-6">
              <span className="text-[#3B3B1A] dark:text-[#EAEFEF] font-bold text-xl">K</span>
            </div>
            <h2 className="text-3xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF]">
              Welcome to MeshMemory
            </h2>
            <p className="mt-2 text-sm text-[#8A784E] dark:text-[#B8CFCE]">
              Start your intelligent AI conversation journey
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#3B3B1A] dark:text-[#EAEFEF] bg-[#AEC8A4] dark:bg-[#7F8CAA] hover:bg-[#E7EFC7] dark:hover:bg-[#333446]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AEC8A4] dark:focus:ring-[#B8CFCE] transition-colors"
            >
              Sign In / Sign Up
            </button>
            <button
              onClick={continueAsGuest}
              className="w-full flex justify-center py-3 px-4 border border-[#AEC8A4] dark:border-[#7F8CAA] rounded-lg shadow-sm text-sm font-medium text-[#3B3B1A] dark:text-[#EAEFEF] bg-white dark:bg-[#333446] hover:bg-[#E7EFC7]/10 dark:hover:bg-[#333446]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AEC8A4] dark:focus:ring-[#B8CFCE] transition-colors"
            >
              Continue as Guest
            </button>
          </div>
          <p className="text-xs text-center text-[#8A784E] dark:text-[#B8CFCE]">
            Guest mode has limited features. Sign up for full access.
          </p>
        </div>
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#333446] transition-colors">
      {/* Mobile sidebar - with overlay */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-[#8A784E]/30 dark:bg-black/50 backdrop-blur-sm transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#333446] border-r border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-[#333446]/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#B8CFCE] transition-all duration-200 transform hover:scale-105"
            >
              <X className="h-6 w-6 text-[#EAEFEF]" />
            </button>
          </div>
          <Sidebar 
            onImportClick={() => setImportModalOpen(true)} 
            collapsed={false}
          />
        </div>
      </div>

      {/* Desktop sidebar - with proper styling */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'} border-r border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 bg-white dark:bg-[#333446] shadow-sm`}>
        <Sidebar 
          onImportClick={() => setImportModalOpen(true)} 
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main content - with smooth transition */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1`}>
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={title || getPageTitle(location.pathname)}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Modals - Always rendered to maintain consistent hook order */}
      <ImportModal 
        isOpen={importModalOpen} 
        onClose={() => setImportModalOpen(false)} 
      />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
