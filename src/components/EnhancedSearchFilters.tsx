import React, { useState, useEffect } from 'react';
import { Filter, Calendar, User, FileText, X } from 'lucide-react';

interface SearchFilters {
  sourceTypes: string[];
  dateFrom: string;
  dateTo: string;
  participant: string;
  searchType: 'semantic' | 'text' | 'hybrid';
}

interface EnhancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

export default function EnhancedSearchFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: EnhancedSearchFiltersProps) {
  const [availableFilters, setAvailableFilters] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  const fetchAvailableFilters = async () => {
    try {
      const response = await fetch('/api/search/filters');
      const data = await response.json();
      setAvailableFilters(data);
    } catch (error) {
      console.error('Error fetching filters:', error);
      // Mock data for demo
      setAvailableFilters({
        sourceTypes: [
          { type: 'chatgpt-link', count: 8 },
          { type: 'pdf', count: 4 },
          { type: 'youtube-link', count: 2 },
          { type: 'text', count: 1 }
        ],
        participants: [
          { name: 'GPT-4', count: 45 },
          { name: 'Claude', count: 23 },
          { name: 'Gemini', count: 18 },
          { name: 'User', count: 67 }
        ],
        dateRange: {
          earliest: '2024-01-01',
          latest: '2024-01-15'
        }
      });
    }
  };

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSourceType = (type: string) => {
    const newTypes = filters.sourceTypes.includes(type)
      ? filters.sourceTypes.filter(t => t !== type)
      : [...filters.sourceTypes, type];
    updateFilters('sourceTypes', newTypes);
  };

  const hasActiveFilters = () => {
    return filters.sourceTypes.length > 0 || 
           filters.dateFrom || 
           filters.dateTo || 
           filters.participant ||
           filters.searchType !== 'hybrid';
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'chatgpt-link': 'ChatGPT',
      'pdf': 'PDF',
      'youtube-link': 'YouTube',
      'text': 'Text'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {hasActiveFilters() && (
            <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
              Active
            </span>
          )}
        </button>
        
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-4">
          {/* Search Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Type
            </label>
            <div className="flex space-x-4">
              {['semantic', 'text', 'hybrid'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value={type}
                    checked={filters.searchType === type}
                    onChange={(e) => updateFilters('searchType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Source Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Source Types
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFilters?.sourceTypes?.map((sourceType: any) => (
                <button
                  key={sourceType.type}
                  onClick={() => toggleSourceType(sourceType.type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.sourceTypes.includes(sourceType.type)
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getSourceTypeLabel(sourceType.type)} ({sourceType.count})
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilters('dateFrom', e.target.value)}
                min={availableFilters?.dateRange?.earliest}
                max={availableFilters?.dateRange?.latest}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilters('dateTo', e.target.value)}
                min={filters.dateFrom || availableFilters?.dateRange?.earliest}
                max={availableFilters?.dateRange?.latest}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Participant Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Participant
            </label>
            <select
              value={filters.participant}
              onChange={(e) => updateFilters('participant', e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All participants</option>
              {availableFilters?.participants?.map((participant: any) => (
                <option key={participant.name} value={participant.name}>
                  {participant.name} ({participant.count} messages)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}