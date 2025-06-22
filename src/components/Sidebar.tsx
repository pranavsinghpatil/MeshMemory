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
  Building,
  BarChart,
  FileText,
  Shield,
  Book,
  List
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

interface Navigation {
  name: string;
  href?: string;
  icon: React.ElementType;
  isGroup?: boolean;
  groupId?: string;
  children?: Navigation[];
  action?: () => void;
  badge?: string;
  pro?: boolean;
  endpoint?: string;
}

export default function Sidebar({ onImportClick, collapsed = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace, isTeamWorkspace } = useWorkspace();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use the global state for sidebar collapsed state
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useAppStore();
  const isExpanded = !sidebarCollapsed || isHovered;

  // Initialize the navigation items

  
  // Auto-expand relevant group when navigating to a page
  useEffect(() => {
    const currentPath = location.pathname;
    navigation.forEach(item => {
      if (item.isGroup && item.children) {
        const shouldExpand = item.children.some(child => 
          child.href && currentPath.startsWith(child.href));
        
        if (shouldExpand) {
          setExpandedGroups(prev => ({ ...prev, [item.groupId!]: true }));
        }
      }
    });
  }, [location.pathname]);

  const navigation: Navigation[] = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      endpoint: '/api/dashboard'
    },
    { 
      name: 'Chats', 
      icon: MessageSquare, 
      isGroup: true,
      groupId: 'chats',
      endpoint: '/api/messages',
      children: [
        { name: 'New Chat', href: '/chats/new', icon: PlusCircle, badge: 'New', endpoint: '/api/messages' },
        { name: 'Quick Chat', href: '/chats/quick', icon: MessageSquare, endpoint: '/api/messages' },
        { name: 'Import Chat', href: '#', icon: FolderPlus, action: onImportClick, endpoint: '/api/import' },
        { name: 'Active Chats', href: '/chats/active', icon: List, endpoint: '/api/messages' },
        { name: 'Parallel Chats', href: '/chats/parallel', icon: GitBranch, endpoint: '/api/messages' },
        { name: 'Archived Chats', href: '/chats/archived', icon: Archive, endpoint: '/api/messages' }
      ]
    },
    { 
      name: 'Conversations', 
      icon: Activity, 
      isGroup: true,
      groupId: 'conversations',
      endpoint: '/api/conversations',
      children: [
        { name: 'All Conversations', href: '/conversations', icon: List, endpoint: '/api/conversations' },
        { name: 'Create New', href: '/conversations/new', icon: PlusCircle, endpoint: '/api/conversations' },
        { name: 'Shared', href: '/conversations/shared', icon: Users, pro: true, endpoint: '/api/conversations' }
      ]
    },
    { 
      name: 'Search', 
      icon: Search, 
      isGroup: true,
      groupId: 'search',
      endpoint: '/api/search',
      children: [
        { name: 'Basic Search', href: '/search', icon: Search, endpoint: '/api/search' },
        { name: 'Enhanced Search', href: '/search/enhanced', icon: Search, badge: 'New', endpoint: '/api/enhanced_search' }
      ]
    },
    { 
      name: 'Analytics', 
      icon: BarChart, 
      isGroup: true,
      groupId: 'analytics',
      endpoint: '/api/analytics',
      children: [
        { name: 'Dashboard', href: '/analytics', icon: BarChart, endpoint: '/api/analytics' },
        { name: 'Usage Stats', href: '/analytics/usage', icon: BarChart, endpoint: '/api/analytics' },
        { name: 'Topic Clusters', href: '/analytics/topics', icon: PenSquare, pro: true, endpoint: '/api/analytics/topics' }
      ],
      pro: true
    },
    { 
      name: 'Documents', 
      icon: FileText, 
      isGroup: true,
      groupId: 'documents',
      endpoint: '/api/data_management',
      children: [
        { name: 'My Documents', href: '/documents', icon: FileText, endpoint: '/api/data_management' },
        { name: 'Upload', href: '/documents/upload', icon: Upload, endpoint: '/api/data_management' },
        { name: 'Shared Documents', href: '/documents/shared', icon: Users, pro: true, endpoint: '/api/data_management' }
      ]
    },
    { name: 'Settings', href: '/settings', icon: Settings, endpoint: '/api/user_settings' },
    { name: 'Privacy & Security', href: '/privacy', icon: Shield, endpoint: '/api/auth' },
    { name: 'Help', href: '/help', icon: Book },
  ];

  // Sign out handler
  function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
      // Reset active states before signing out
      const { setActiveChatId, setActiveThreadId } = useAppStore();
      setActiveChatId(null);
      setActiveThreadId(null);
      
      signOut().then(() => {
        navigate('/');
      }).catch(error => {
        console.error('Error signing out:', error);
      });
    }
  }

  // Handle mouse enter/leave for dynamic expansion
  function handleMouseEnter() {
    if (sidebarCollapsed) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsHovered(true);
    }
  }

  function handleMouseLeave() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(false);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-full flex flex-col bg-white dark:bg-[#333446] border-r border-[#AEC8A4]/20 dark:border-[#7F8CAA]/20 shadow-sm transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}
    >
      {/* App Logo/Title */}
      <div className="flex-shrink-0 h-16 flex items-center justify-center bg-[#E7EFC7] dark:bg-[#333446] px-4">
        <div className="flex items-center w-full overflow-hidden">
          {isExpanded ? (
            <div className="w-full">
              <div className="text-xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF] flex items-center justify-between">
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
            <MessageSquare className="h-8 w-8 text-[#3B3B1A] dark:text-[#EAEFEF]" />
          )}
        </div>
      </div>
      
      {/* Close/Expand Button */}
      <div className="mt-1 px-2">
        <button
          onClick={() => toggleSidebar()}
          className={`flex items-center w-full px-2 py-2 text-sm font-medium text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7] dark:hover:bg-[#333446] rounded-md transition-colors
            ${isExpanded ? '' : 'justify-center'}`}
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          {isExpanded && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
      
      {/* Divider */}
      <div className="mt-2 mb-2">
        <div className="h-px bg-[#AEC8A4]/20 dark:bg-[#7F8CAA]/20"></div>
      </div>
        
      {/* Team Workspace Indicator */}
      {isTeamWorkspace && isExpanded && (
        <div className="mt-2 mx-3 p-2 bg-[#E7EFC7]/30 dark:bg-[#7F8CAA]/30 rounded-lg">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1 text-[#8A784E] dark:text-[#B8CFCE]" />
            <span className="text-xs font-medium text-[#3B3B1A] dark:text-[#EAEFEF]">Team Workspace</span>
          </div>
          <p className="text-xs text-[#8A784E] dark:text-[#B8CFCE] mt-1">
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
              ? 'text-[#AEC8A4]/50 dark:text-[#7F8CAA]/50 cursor-not-allowed' 
              : 'text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7] dark:hover:bg-[#333446]'
            }`}
        >
          <Upload className={`${isExpanded ? 'mr-3' : ''} h-5 w-5`} />
          {isExpanded && (
            <>
              Import Source
              {isGuest && <span className="ml-auto text-xs text-[#8A784E] dark:text-[#B8CFCE]">Pro</span>}
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
            isDisabled={isGuest && !!item.pro}
            isGuest={isGuest}
            currentPathname={location.pathname}
            toggleGroup={toggleGroup}
            sidebarExpanded={isExpanded}
            onNavigate={handleNavigation}
          />
        ))}
      </nav>
      
      {/* User Section */}
      <div className="flex-shrink-0 flex border-t border-[#AEC8A4] dark:border-[#7F8CAA] p-4">
        <div className={`flex items-center ${!isExpanded ? 'justify-center' : 'w-full'}`}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-[#AEC8A4] dark:bg-[#7F8CAA] flex items-center justify-center">
              {isGuest ? (
                <UserCheck className="h-5 w-5 text-[#3B3B1A] dark:text-[#EAEFEF]" />
              ) : (
                <User className="h-5 w-5 text-[#3B3B1A] dark:text-[#EAEFEF]" />
              )}
            </div>
          </div>
          {isExpanded && (
            <>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3B3B1A] dark:text-[#EAEFEF] truncate">
                  {isGuest ? 'Guest User' : user?.email}
                </p>
                {isGuest && (
                  <p className="text-xs text-[#8A784E] dark:text-[#B8CFCE]">Limited features</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 flex-shrink-0 p-1 text-[#8A784E] dark:text-[#B8CFCE] hover:text-[#3B3B1A] dark:hover:text-[#EAEFEF] transition-colors"
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
