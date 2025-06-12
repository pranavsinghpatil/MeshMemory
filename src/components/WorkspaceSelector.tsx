import React, { useState, useRef, useEffect } from 'react';
import { Building, ChevronDown, User, Plus, Check } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
  members?: number;
}

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  onCreateWorkspace?: () => void;
}

export default function WorkspaceSelector({
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  onCreateWorkspace
}: WorkspaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-indigo-500/30 transition-colors"
      >
        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${
          activeWorkspace.type === 'personal'
            ? 'bg-indigo-500/30'
            : 'bg-blue-500/30'
        }`}>
          {activeWorkspace.type === 'personal' ? (
            <User className="h-3.5 w-3.5 text-white" />
          ) : (
            <Building className="h-3.5 w-3.5 text-white" />
          )}
        </div>
        <span className="text-sm font-medium text-white truncate max-w-[120px]">
          {activeWorkspace.name}
        </span>
        <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Your Workspaces
            </div>
            
            {workspaces.map(workspace => (
              <button
                key={workspace.id}
                onClick={() => {
                  onWorkspaceChange(workspace);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center ${
                    workspace.type === 'personal'
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {workspace.type === 'personal' ? (
                      <User className={`h-3.5 w-3.5 ${
                        workspace.type === 'personal'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    ) : (
                      <Building className={`h-3.5 w-3.5 ${
                        workspace.type === 'personal'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{workspace.name}</p>
                    {workspace.type === 'team' && workspace.members && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{workspace.members} members</p>
                    )}
                  </div>
                </div>
                {workspace.id === activeWorkspace.id && (
                  <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
              <button
                onClick={() => {
                  if (onCreateWorkspace) onCreateWorkspace();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}