import React, { useState } from 'react';
import { MessageSquare, Plus, X, Search, Loader2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface ThreadGroupMembersPanelProps {
  members: any[];
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
}

export default function ThreadGroupMembersPanel({
  members,
  onAddMember,
  onRemoveMember
}: ThreadGroupMembersPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredMembers = members.filter(member => 
    member.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value.length > 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Member Chats</h3>
        <button
          onClick={onAddMember}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Chat
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search member chats..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                  <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{member.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.type} • {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Tooltip content="Remove from group">
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            {isSearching ? (
              <>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No matching chats found</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <MessageSquare className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">No member chats yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add chats to this group to get started</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}