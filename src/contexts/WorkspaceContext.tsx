import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAppStore } from '../store/useStore';

interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
  members?: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  isTeamWorkspace: boolean;
  createWorkspace: (name: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  
  // Use the global state for workspaces
  const workspaces = useAppStore(state => state.workspaces);
  const currentWorkspace = useAppStore(state => state.currentWorkspace);
  const setWorkspaces = useAppStore(state => state.setWorkspaces);
  const setCurrentWorkspace = useAppStore(state => state.setCurrentWorkspace);
  const workspaceHasHydrated = useAppStore(state => state.workspaceHasHydrated);

  // Load workspaces when user changes
  useEffect(() => {
    // Wait for store to hydrate before proceeding
    if (!workspaceHasHydrated) {
      return;
    }
    
    if (user && !isGuest) {
      // In a real implementation, this would fetch from an API
      const personalWorkspace = {
        id: 'personal',
        name: 'Personal',
        type: 'personal' as const
      };
      
      // Mock team workspaces
      const mockTeamWorkspaces = [
        {
          id: 'team-1',
          name: 'Acme Corp',
          type: 'team' as const,
          members: 5
        },
        {
          id: 'team-2',
          name: 'Startup Project',
          type: 'team' as const,
          members: 3
        }
      ];
      
      if (typeof setWorkspaces === 'function') {
        setWorkspaces([personalWorkspace, ...mockTeamWorkspaces]);
      }
      
      if (typeof setCurrentWorkspace === 'function') {
        setCurrentWorkspace(personalWorkspace);
      }
    } else {
      // Guest or logged out - only personal workspace
      const personalWorkspace = {
        id: 'personal',
        name: 'Personal',
        type: 'personal' as const
      };
      
      if (typeof setWorkspaces === 'function') {
        setWorkspaces([personalWorkspace]);
      }
      
      if (typeof setCurrentWorkspace === 'function') {
        setCurrentWorkspace(personalWorkspace);
      }
    }
  }, [user, isGuest, setWorkspaces, setCurrentWorkspace, workspaceHasHydrated]);

  const isTeamWorkspace = currentWorkspace?.type === 'team';

  const createWorkspace = async (name: string) => {
    // In a real implementation, this would create a workspace via API
    const newWorkspace: Workspace = {
      id: `team-${Date.now()}`,
      name,
      type: 'team',
      members: 1
    };
    
    if (typeof setWorkspaces === 'function' && workspaces) {
      setWorkspaces([...workspaces, newWorkspace]);
    }
    
    if (typeof setCurrentWorkspace === 'function') {
      setCurrentWorkspace(newWorkspace);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces: workspaces || [], 
      activeWorkspace: currentWorkspace || { id: 'personal', name: 'Personal', type: 'personal' }, 
      setActiveWorkspace: typeof setCurrentWorkspace === 'function' ? setCurrentWorkspace : () => {}, 
      isTeamWorkspace,
      createWorkspace
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}