import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  apiKeys: {
    openai?: string;
    gemini?: string;
    claude?: string;
  };
  setUser: (user: User | null) => void;
  setApiKeys: (keys: { openai?: string; gemini?: string; claude?: string }) => void;
  userHasHydrated: boolean;
}

interface WorkspaceState {
  currentWorkspace: {
    id: string;
    name: string;
    type: 'personal' | 'team';
  };
  workspaces: Array<{
    id: string;
    name: string;
    type: 'personal' | 'team';
    members?: number;
  }>;
  setCurrentWorkspace: (workspace: { id: string; name: string; type: 'personal' | 'team' }) => void;
  setWorkspaces: (workspaces: Array<{ id: string; name: string; type: 'personal' | 'team'; members?: number }>) => void;
  workspaceHasHydrated: boolean;
}

interface ChatState {
  activeChatId: string | null;
  activeThreadId: string | null;
  activeThreadGroupId: string | null;
  benchmarks: Array<{
    id: string;
    chatId: string;
    chunkId: string;
    name: string;
    timestamp: string;
  }>;
  parallelChats: Array<{
    id: string;
    parentChatId: string;
    title: string;
    createdAt: string;
  }>;
  setActiveChatId: (id: string | null) => void;
  setActiveThreadId: (id: string | null) => void;
  setActiveThreadGroupId: (id: string | null) => void;
  addBenchmark: (benchmark: { id: string; chatId: string; chunkId: string; name: string; timestamp: string }) => void;
  removeBenchmark: (id: string) => void;
  addParallelChat: (chat: { id: string; parentChatId: string; title: string; createdAt: string }) => void;
  removeParallelChat: (id: string) => void;
}

interface UIState {
  sidebarCollapsed: boolean;
  contextPanelOpen: boolean;
  darkMode: boolean | null; // null means system preference
  setSidebarCollapsed: (collapsed: boolean) => void;
  setContextPanelOpen: (open: boolean) => void;
  setDarkMode: (mode: boolean | null) => void;
  toggleSidebar: () => void;
  toggleContextPanel: () => void;
  uiHasHydrated: boolean;
}

// Create individual stores with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      apiKeys: {},
      userHasHydrated: false,
      setUser: (user) => set({ user }),
      setApiKeys: (apiKeys) => set({ apiKeys }),
    }),
    {
      name: 'knitchat-user-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.userHasHydrated = true;
        }
      },
    }
  )
);

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspace: {
        id: 'personal',
        name: 'Personal',
        type: 'personal',
      },
      workspaces: [
        {
          id: 'personal',
          name: 'Personal',
          type: 'personal',
        },
      ],
      workspaceHasHydrated: false,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setWorkspaces: (workspaces) => set({ workspaces }),
    }),
    {
      name: 'knitchat-workspace-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.workspaceHasHydrated = true;
        }
      },
    }
  )
);

export const useChatStore = create<ChatState>()((set) => ({
  activeChatId: null,
  activeThreadId: null,
  activeThreadGroupId: null,
  benchmarks: [],
  parallelChats: [],
  setActiveChatId: (id) => set({ activeChatId: id }),
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  setActiveThreadGroupId: (id) => set({ activeThreadGroupId: id }),
  addBenchmark: (benchmark) => set((state) => ({ 
    benchmarks: [...state.benchmarks, benchmark] 
  })),
  removeBenchmark: (id) => set((state) => ({ 
    benchmarks: state.benchmarks.filter((b) => b.id !== id) 
  })),
  addParallelChat: (chat) => set((state) => ({ 
    parallelChats: [...state.parallelChats, chat] 
  })),
  removeParallelChat: (id) => set((state) => ({ 
    parallelChats: state.parallelChats.filter((c) => c.id !== id) 
  })),
}));

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: true,
      contextPanelOpen: false,
      darkMode: null, // Default to system preference
      uiHasHydrated: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setContextPanelOpen: (open) => set({ contextPanelOpen: open }),
      setDarkMode: (mode) => set({ darkMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleContextPanel: () => set((state) => ({ contextPanelOpen: !state.contextPanelOpen })),
    }),
    {
      name: 'knitchat-ui-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.uiHasHydrated = true;
        }
      },
    }
  )
);

// Combined hook for convenience
export function useAppStore() {
  const user = useUserStore((state) => state.user);
  const apiKeys = useUserStore((state) => state.apiKeys);
  const setUser = useUserStore((state) => state.setUser);
  const setApiKeys = useUserStore((state) => state.setApiKeys);
  const userHasHydrated = useUserStore((state) => state.userHasHydrated);
  
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const workspaceHasHydrated = useWorkspaceStore((state) => state.workspaceHasHydrated);
  
  const activeChatId = useChatStore((state) => state.activeChatId);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const activeThreadGroupId = useChatStore((state) => state.activeThreadGroupId);
  const benchmarks = useChatStore((state) => state.benchmarks);
  const parallelChats = useChatStore((state) => state.parallelChats);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const setActiveThreadId = useChatStore((state) => state.setActiveThreadId);
  const setActiveThreadGroupId = useChatStore((state) => state.setActiveThreadGroupId);
  const addBenchmark = useChatStore((state) => state.addBenchmark);
  const removeBenchmark = useChatStore((state) => state.removeBenchmark);
  const addParallelChat = useChatStore((state) => state.addParallelChat);
  const removeParallelChat = useChatStore((state) => state.removeParallelChat);
  
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const contextPanelOpen = useUIStore((state) => state.contextPanelOpen);
  const darkMode = useUIStore((state) => state.darkMode);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const setContextPanelOpen = useUIStore((state) => state.setContextPanelOpen);
  const setDarkMode = useUIStore((state) => state.setDarkMode);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleContextPanel = useUIStore((state) => state.toggleContextPanel);
  const uiHasHydrated = useUIStore((state) => state.uiHasHydrated);
  
  return {
    // User state
    user,
    apiKeys,
    setUser,
    setApiKeys,
    userHasHydrated,
    
    // Workspace state
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    setWorkspaces,
    workspaceHasHydrated,
    
    // Chat state
    activeChatId,
    activeThreadId,
    activeThreadGroupId,
    benchmarks,
    parallelChats,
    setActiveChatId,
    setActiveThreadId,
    setActiveThreadGroupId,
    addBenchmark,
    removeBenchmark,
    addParallelChat,
    removeParallelChat,
    
    // UI state
    sidebarCollapsed,
    contextPanelOpen,
    darkMode,
    setSidebarCollapsed,
    setContextPanelOpen,
    setDarkMode,
    toggleSidebar,
    toggleContextPanel,
    uiHasHydrated,
  };
}