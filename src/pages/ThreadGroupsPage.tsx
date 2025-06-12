import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import Layout from '../components/Layout';
import ThreadGroupCard from '../components/ThreadGroupCard';
import { useAuth } from '../contexts/AuthContext';

export default function ThreadGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [] as string[],
    dateRange: 'all',
    sortBy: 'updated'
  });
  const { isGuest } = useAuth();

  useEffect(() => {
    fetchThreadGroups();
  }, []);

  const fetchThreadGroups = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setGroups([
          {
            id: '1',
            title: 'React State Management',
            tags: ['React', 'JavaScript', 'Hooks', 'State'],
            memberCount: 3,
            updated_at: '2024-01-15T10:30:00Z',
            summary: 'Discussions about React state management approaches including useState, useReducer, Context API, and external libraries like Redux and Zustand.'
          },
          {
            id: '2',
            title: 'Machine Learning Fundamentals',
            tags: ['ML', 'AI', 'Python', 'Data Science'],
            memberCount: 5,
            updated_at: '2024-01-14T09:15:00Z',
            summary: 'Exploration of machine learning concepts, algorithms, and implementation approaches using Python and popular frameworks.'
          },
          {
            id: '3',
            title: 'Database Design Patterns',
            tags: ['SQL', 'NoSQL', 'Database', 'Architecture'],
            memberCount: 2,
            updated_at: '2024-01-13T11:00:00Z',
            summary: 'Discussions about database schema design, normalization, indexing strategies, and choosing between SQL and NoSQL solutions.'
          },
          {
            id: '4',
            title: 'Frontend Performance Optimization',
            tags: ['Web', 'Performance', 'JavaScript', 'React'],
            memberCount: 4,
            updated_at: '2024-01-12T14:20:00Z',
            summary: 'Techniques for optimizing frontend performance including code splitting, lazy loading, memoization, and rendering optimizations.'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching thread groups:', error);
      setLoading(false);
    }
  };

  const handleMergeGroup = (groupId: string) => {
    console.log('Merge more chats into group:', groupId);
    // Implementation would open a modal to select chats to merge
  };

  const handleArchiveGroup = (groupId: string) => {
    console.log('Archive group:', groupId);
    // Implementation would archive the group
  };

  const handleDeleteGroup = (groupId: string) => {
    console.log('Delete group:', groupId);
    // Implementation would confirm and delete the group
  };

  const filteredGroups = groups.filter(group => {
    // Search filter
    if (searchQuery && !group.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tag filter
    if (filters.tags.length > 0 && !group.tags.some(tag => filters.tags.includes(tag))) {
      return false;
    }
    
    // Date filter
    if (filters.dateRange !== 'all') {
      const date = new Date(group.updated_at);
      const now = new Date();
      
      if (filters.dateRange === 'today' && date.toDateString() !== now.toDateString()) {
        return false;
      }
      
      if (filters.dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (date < weekAgo) {
          return false;
        }
      }
      
      if (filters.dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (date < monthAgo) {
          return false;
        }
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Sort
    if (filters.sortBy === 'updated') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    
    if (filters.sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    
    if (filters.sortBy === 'size') {
      return b.memberCount - a.memberCount;
    }
    
    return 0;
  });

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thread Groups</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  Manage fused contexts of multiple related conversations
                </p>
              </div>
              <button
                onClick={() => console.log('Create new thread group')}
                disabled={isGuest}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Thread Group
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thread groups..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 inline-flex items-center border ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } rounded-l-md transition-colors`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 inline-flex items-center border ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } rounded-r-md transition-colors`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Options</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tags Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filter by Tags
                    </label>
                    <select
                      multiple
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.tags}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters({...filters, tags: options});
                      }}
                    >
                      <option value="React">React</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="ML">Machine Learning</option>
                      <option value="AI">AI</option>
                      <option value="Database">Database</option>
                      <option value="Performance">Performance</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Hold Ctrl/Cmd to select multiple
                    </p>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Range
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.dateRange}
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  
                  {/* Sort By Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort By
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    >
                      <option value="updated">Last Updated</option>
                      <option value="name">Name</option>
                      <option value="size">Size (Member Count)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilters({
                        tags: [],
                        dateRange: 'all',
                        sortBy: 'updated'
                      });
                    }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thread Groups List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            }>
              {filteredGroups.map(group => (
                <ThreadGroupCard
                  key={group.id}
                  group={group}
                  onMerge={handleMergeGroup}
                  onArchive={handleArchiveGroup}
                  onDelete={handleDeleteGroup}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No thread groups found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? `No results matching "${searchQuery}"`
                  : "Create your first thread group to start organizing your conversations"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => console.log('Create new thread group')}
                  disabled={isGuest}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Thread Group
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}