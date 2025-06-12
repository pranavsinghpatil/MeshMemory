import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  GitBranch, 
  Archive, 
  Search, 
  PenSquare, 
  Settings, 
  HelpCircle, 
  Activity, 
  Users, 
  FolderPlus, 
  PlusCircle, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import Tooltip from './Tooltip';
import SidebarNavItem from './SidebarNavItem';
import WorkspaceSelector from './WorkspaceSelector';
import { useAppStore } from '../store/useStore';

interface SidebarProps {
  onImportClick: () => void;
  collapsed?: boolean;
}

export default function Sidebar({ onImportClick, collapsed = true }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace, isTeamWorkspace } = useWorkspace();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use the global state for sidebar collapsed state
  const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore(state => state.setSidebarCollapsed);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const uiHasHydrated = useAppStore(state => state.uiHasHydrated);
  const isExpanded = !sidebarCollapsed;

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home 
    },
    { 
      name: 'Chats', 
      icon: MessageSquare, 
      isGroup: true,
      groupId: 'chats',
      children: [
        { name: 'New Chat', href: '/chats/new', icon: PlusCircle, badge: 'New' },
        { name: 'Import Chat', href: '#', icon: FolderPlus, action: onImportClick },
        { name: 'Active Chats', href: '/chats/active', icon: MessageSquare },
        { name: 'Parallel Chats', href: '/chats/parallel', icon: GitBranch },
        { name: 'Archived Chats', href: '/chats/archived', icon: Archive }
      ]
    },
    { 
      name: 'Thread Groups', 
      icon: Activity, 
      isGroup: true,
      groupId: 'threadgroups',
      children: [
        { name: 'All Groups', href: '/threadgroups', icon: Users },
        { name: 'Create Group', href: '/threadgroups/new', icon: PlusCircle },
        { name: 'Shared Groups', href: '/threadgroups/shared', icon: Users, pro: true }
      ]
    },
    { 
      name: 'Search', 
      icon: Search, 
      isGroup: true,
      groupId: 'search',
      children: [
        { name: 'Basic Search', href: '/search', icon: Search },
        { name: 'Enhanced Search', href: '/search/enhanced', icon: Search, badge: 'New' }
      ]
    },
    { 
      name: 'Analytics & Insights', 
      icon: PenSquare, 
      isGroup: true,
      groupId: 'analytics',
      children: [
        { name: 'Dashboard', href: '/analytics', icon: PenSquare },
        { name: 'Weekly Reports', href: '/analytics/weekly', icon: PenSquare, pro: true },
        { name: 'Topic Clusters', href: '/analytics/topics', icon: PenSquare, pro: true }
      ],
      pro: true
    },
    { 
      name: 'Exports', 
      icon: Archive, 
      isGroup: true,
      groupId: 'exports',
      children: [
        { name: 'My Exports', href: '/exports', icon: Archive },
        { name: 'Create Export', href: '/exports/create', icon: Archive },
        { name: 'Shared Exports', href: '/exports/shared', icon: Archive, pro: true }
      ],
      pro: true
    },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle mouse enter/leave for dynamic expansion
  const handleMouseEnter = () => {
    // Only handle mouse events if the store has hydrated and setSidebarCollapsed is a function
    if (!uiHasHydrated || typeof setSidebarCollapsed !== 'function') return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSidebarCollapsed(false);
  };

  const handleMouseLeave = () => {
    // Only handle mouse events if the store has hydrated and setSidebarCollapsed is a function
    if (!uiHasHydrated || typeof setSidebarCollapsed !== 'function') return;
    
    timeoutRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 300); // Small delay to prevent flickering
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Check if a route is active
  const isRouteActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Handle navigation for items with action or href
  const handleNavigation = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <div 
      ref={sidebarRef}
      className={`flex flex-col h-full bg-gradient-to-b from-knitter-light-accent to-knitter-light-dark dark:from-knitter-dark-base dark:to-knitter-dark-accent transition-all ${collapsed ? 'w-16' : 'w-64'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo and Workspace Selector */}
        <div className={`flex items-center flex-shrink-0 px-4 ${!isExpanded ? 'justify-center' : ''}`}>
          {isExpanded ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-semibold text-white">Knitter.app</span>
              </div>
              {!isGuest && (
                <WorkspaceSelector 
                  workspaces={workspaces}
                  activeWorkspace={activeWorkspace}
                  onWorkspaceChange={setActiveWorkspace}
                  onCreateWorkspace={() => console.log('Create workspace')}
                />
              )}
            </div>
          ) : (
            <MessageSquare className="h-8 w-8 text-white" />
          )}
        </div>
        
        {/* Team Workspace Indicator */}
        {isTeamWorkspace && isExpanded && (
          <div className="mx-4 mt-2 px-3 py-2 bg-indigo-500/30 rounded-md border border-indigo-400/30">
            <div className="flex items-center">
              <Building className="h-4 w-4 text-indigo-200 mr-2" />
              <span className="text-sm font-medium text-indigo-100">Team Workspace</span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              You're viewing shared team content
            </p>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {/* Import Button */}
          <Tooltip content={!isExpanded ? "Import Source" : ""} position="right">
            <button
              onClick={onImportClick}
              disabled={isGuest}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white bg-indigo-500/30 hover:bg-indigo-500/50 transition-colors ${!isExpanded ? 'justify-center' : ''}`}
            >
              <Upload className={`${!isExpanded ? '' : 'mr-3'} h-5 w-5`} />
              {isExpanded && (
                <>
                  Import Source
                  {isGuest && <span className="ml-auto text-xs opacity-75">Pro</span>}
                </>
              )}
            </button>
          </Tooltip>
          
          {/* Navigation Links */}
          {navigation.map((item) => {
            const isActive = item.href 
              ? isRouteActive(item.href) 
              : item.children 
                ? item.children.some(child => child.href && isRouteActive(child.href))
                : false;
            
            const isDisabled = isGuest && item.pro;
            const isGroupExpanded = expandedGroups[item.groupId || ''] || false;
            
            return (
              <SidebarNavItem
                key={item.name}
                item={item}
                isActive={isActive}
                isExpanded={isExpanded}
                isGroupExpanded={isGroupExpanded}
                isDisabled={isDisabled}
                isGuest={isGuest}
                currentPathname={location.pathname}
                toggleGroup={toggleGroup}
                sidebarExpanded={isExpanded}
                onNavigate={handleNavigation}
              />
            );
          })}
        </nav>
      </div>
      
      {/* User Section */}
      <div className="flex-shrink-0 flex border-t border-indigo-700 dark:border-indigo-900 p-4">
        <Tooltip
          content={!isExpanded ? (isGuest ? "Guest User" : user?.email || "User") : ""}
          position="right"
        >
          <div className={`flex items-center ${!isExpanded ? 'justify-center' : 'w-full'}`}>
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                {isGuest ? (
                  <UserCheck className="h-5 w-5 text-white" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
            {isExpanded && (
              <>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {isGuest ? 'Guest User' : user?.email}
                  </p>
                  {isGuest && (
                    <p className="text-xs text-indigo-200">Limited features</p>
                  )}
                </div>
                <Tooltip content="Sign out" position="top">
                  <button
                    onClick={handleSignOut}
                    className="ml-3 flex-shrink-0 p-1 text-indigo-200 hover:text-white transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </Tooltip>
      </div>
    </div>
  );
}