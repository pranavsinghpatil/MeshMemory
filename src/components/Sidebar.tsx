import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Upload, 
  Search, 
  Layers, 
  Home,
  User,
  LogOut,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onImportClick: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ onImportClick, collapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { user, isGuest, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Explore Threads', href: '/threads', icon: Layers },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className={`flex items-center flex-shrink-0 px-4 ${collapsed ? 'justify-center' : ''}`}>
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          {!collapsed && <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">KnitChat</span>}
        </div>
        
        {/* Collapse toggle button */}
        <div className="mt-4 px-4">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {/* Import Button */}
          <button
            onClick={onImportClick}
            className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
            disabled={isGuest}
            title="Import Source"
          >
            <Upload className={`${collapsed ? '' : 'mr-3'} h-5 w-5`} />
            {!collapsed && (
              <>
                Import Source
                {isGuest && <span className="ml-auto text-xs opacity-75">Pro</span>}
              </>
            )}
          </button>
          
          {/* Navigation Links */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                title={item.name}
              >
                <item.icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Section */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'w-full'}`}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              {isGuest ? (
                <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
          </div>
          {!collapsed && (
            <>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {isGuest ? 'Guest User' : user?.email}
                </p>
                {isGuest && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Limited features</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}