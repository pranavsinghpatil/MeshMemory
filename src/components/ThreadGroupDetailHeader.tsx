import React, { useState } from 'react';
import { Layers, Tag, Edit, Check, X, Download, Share2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface ThreadGroupDetailHeaderProps {
  group: {
    id: string;
    title: string;
    tags: string[];
    summary: string;
    memberCount: number;
    created_at: string;
    updated_at: string;
  };
  onUpdateGroup: (data: { title?: string; tags?: string[] }) => Promise<void>;
}

export default function ThreadGroupDetailHeader({
  group,
  onUpdateGroup
}: ThreadGroupDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(group.title);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(group.tags);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setSaving(true);
    try {
      await onUpdateGroup({ title, tags });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(group.title);
    setTags(group.tags);
    setIsEditing(false);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-4">
            <Layers className="h-6 w-6 text-white" />
          </div>
          
          {isEditing ? (
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xl font-bold"
                placeholder="Group Title"
              />
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {group.title}
            </h1>
          )}
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <Tooltip content="Edit group">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </Tooltip>
              <Tooltip content="Export group">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </Tooltip>
              <Tooltip content="Share group">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</h3>
        </div>
        
        {isEditing ? (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full text-xs"
                >
                  <span>{tag}</span>
                  <button 
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 text-sm font-medium rounded-r-md text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {group.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
              >
                {tag}
              </span>
            ))}
            {group.tags.length === 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">No tags</span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Layers className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          {group.summary}
        </p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Member Chats</p>
          <p className="font-medium text-gray-900 dark:text-white">{group.memberCount}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
          <p className="font-medium text-gray-900 dark:text-white">{new Date(group.created_at).toLocaleDateString()}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
          <p className="font-medium text-gray-900 dark:text-white">{new Date(group.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}