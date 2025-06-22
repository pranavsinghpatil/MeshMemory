import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  Layers, 
  Home,
  User,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Upload,
  Building
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

export default function Sidebar({ onImportClick, collapsed = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace, isTeamWorkspace } = useWorkspace();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Use the global state for sidebar collapsed state
  const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore(state => state.setSidebarCollapsed);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
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
        { name: 'Quick Chat', href: '/chats/quick', icon: PlusCircle },
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
      name: 'Analytics', 
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

  // Sign out handler
  function handleSignOut() {
    signOut().then(() => {
      navigate('/');
    }).catch(error => {
      console.error('Error signing out:', error);
    });
  }

  // Handle mouse enter/leave for dynamic expansion
  function handleMouseEnter() {
    if (sidebarCollapsed && timeoutRef.current === null) {
      timeoutRef.current = setTimeout(() => {
        setSidebarCollapsed(false);
        timeoutRef.current = null;
      }, 300);
    }
  }

  function handleMouseLeave() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  // Toggle group expansion
  function toggleGroup(groupId: string) {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Check if a route is active
  function isRouteActive(href: string) {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }

  // Handle navigation for items with action or href
  function handleNavigation(item: any) {
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    }
  }

  return (
    <div 
      ref={sidebarRef}
      className={`flex flex-col h-full bg-MeshMemory-light-base dark:bg-MeshMemory-dark-base border-r border-MeshMemory-light-accent dark:border-MeshMemory-dark-accent transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* App Logo/Title */}
      <div className="flex-shrink-0 h-16 flex items-center justify-center bg-MeshMemory-light-accent dark:bg-MeshMemory-dark-accent px-4">
        <div className="flex items-center w-full overflow-hidden">
          {isExpanded ? (
            <div className="w-full">
              <div className="text-xl font-bold text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter flex items-center justify-between">
                MeshMemory
                {isTeamWorkspace && (
                  <WorkspaceSelector 
                    workspaces={workspaces}
                    activeWorkspace={activeWorkspace}
                    onWorkspaceChange={setActiveWorkspace}
                    onCreateWorkspace={() => console.log('Create workspace')}
                  />
                )}
              </div>
            </div>
          ) : (
            <MessageSquare className="h-8 w-8 text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter" />
          )}
        </div>
      </div>
      
      {/* Close/Expand Button */}
      <div className="mt-1 px-2">
        <button 
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-md text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter bg-MeshMemory-light-base dark:bg-MeshMemory-dark-base hover:bg-MeshMemory-light-accent dark:hover:bg-MeshMemory-dark-accent transition-colors"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          {isExpanded && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
        
      {/* Team Workspace Indicator */}
      {isTeamWorkspace && isExpanded && (
        <div className="mt-2 mx-3 p-2 bg-MeshMemory-light-accent/30 dark:bg-MeshMemory-dark-accent/30 rounded-lg">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1 text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter" />
            <span className="text-xs font-medium text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter">Team Workspace</span>
          </div>
          <p className="text-xs text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter mt-1">
            You're viewing shared team content
          </p>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
        {/* Import Button */}
        <button
          onClick={onImportClick}
          disabled={isGuest}
          className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
            ${isExpanded ? '' : 'justify-center'}
            ${isGuest 
              ? 'text-MeshMemory-light-accent/50 dark:text-MeshMemory-dark-accent/50 cursor-not-allowed' 
              : 'text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter hover:bg-MeshMemory-light-accent dark:hover:bg-MeshMemory-dark-accent'
            }`}
        >
          <Upload className={`${isExpanded ? 'mr-3' : ''} h-5 w-5`} />
          {isExpanded && (
            <>
              Import Source
              {isGuest && <span className="ml-auto text-xs opacity-75">Pro</span>}
            </>
          )}
        </button>
        
        {/* Navigation Links */}
        {navigation.map((item, idx) => (
          <SidebarNavItem 
            key={item.name + idx}
            item={item}
            active={item.href ? isRouteActive(item.href) : false}
            expanded={expandedGroups[item.groupId || ''] || false}
            isDisabled={isGuest && item.pro}
            isGuest={isGuest}
            currentPathname={location.pathname}
            toggleGroup={toggleGroup}
            sidebarExpanded={isExpanded}
            onNavigate={handleNavigation}
          />
        ))}
      </nav>
      
      {/* User Section */}
      <div className="flex-shrink-0 flex border-t border-MeshMemory-light-accent dark:border-MeshMemory-dark-accent p-4">
        <div className={`flex items-center ${!isExpanded ? 'justify-center' : 'w-full'}`}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-MeshMemory-light-accent dark:bg-MeshMemory-dark-accent flex items-center justify-center">
              {isGuest ? (
                <UserCheck className="h-5 w-5 text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter" />
              ) : (
                <User className="h-5 w-5 text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter" />
              )}
            </div>
          </div>
          {isExpanded && (
            <>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter truncate">
                  {isGuest ? 'Guest User' : user?.email}
                </p>
                {isGuest && (
                  <p className="text-xs text-MeshMemory-light-dark/70 dark:text-MeshMemory-dark-light/70">Limited features</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 flex-shrink-0 p-1 text-MeshMemory-light-darker dark:text-MeshMemory-dark-lighter hover:text-MeshMemory-light-dark dark:hover:text-MeshMemory-dark-light transition-colors"
                aria-label="Sign out"
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
