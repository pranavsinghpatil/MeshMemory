import React from 'react';
import { Menu, Bell, Settings, MessageSquare, PlusCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import Tooltip from './Tooltip';

interface TopBarProps {
  onMenuClick?: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const { isGuest } = useAuth();
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-MeshMemory-light-base dark:bg-MeshMemory-dark-base shadow-sm border-b border-MeshMemory-light-accent dark:border-MeshMemory-dark-accent transition-colors">
      <button
        onClick={() => toggleSidebar()}
        className="px-4 border-r border-MeshMemory-light-accent dark:border-MeshMemory-dark-accent text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter focus:outline-none focus:ring-2 focus:ring-inset focus:ring-MeshMemory-light-dark dark:focus:ring-MeshMemory-dark-light md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1">
          {title && (
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
          )}
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <ThemeToggle />
          
          {isGuest && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              Guest Mode
            </span>
          )}
          
          <Tooltip content="Notifications">
            <button 
              onClick={() => navigate('/notifications')} 
              className="p-1 rounded-full text-MeshMemory-light-dark dark:text-MeshMemory-dark-light hover:text-MeshMemory-light-darker dark:hover:text-MeshMemory-dark-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-MeshMemory-light-dark dark:focus:ring-MeshMemory-dark-light transition-colors"
            >
              <Bell className="h-6 w-6" />
            </button>
          </Tooltip>
          <Tooltip content="Settings">
            <button 
              onClick={() => navigate('/settings')} 
              className="p-1 rounded-full text-MeshMemory-light-dark dark:text-MeshMemory-dark-light hover:text-MeshMemory-light-darker dark:hover:text-MeshMemory-dark-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-MeshMemory-light-dark dark:focus:ring-MeshMemory-dark-light transition-colors"
            >
              <Settings className="h-6 w-6" />
            </button>
          </Tooltip>
          <Tooltip content="New Conversation">
            <button 
              onClick={() => navigate('/conversations/new')} 
              className="p-1 rounded-full text-MeshMemory-light-dark dark:text-MeshMemory-dark-light hover:text-MeshMemory-light-darker dark:hover:text-MeshMemory-dark-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-MeshMemory-light-dark dark:focus:ring-MeshMemory-dark-light transition-colors"
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}