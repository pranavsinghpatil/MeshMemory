import React from 'react';
import { Clock, ExternalLink, MessageCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResultCardProps {
  result: any;
  index: number;
  onFollowUp: (result: any) => void;
  onViewContext: (result: any) => void;
}

export default function SearchResultCard({ 
  result, 
  index, 
  onFollowUp, 
  onViewContext 
}: SearchResultCardProps) {
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'bg-green-100 text-green-800';
    if (similarity >= 0.8) return 'bg-blue-100 text-blue-800';
    if (similarity >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'chatgpt-link':
        return '🤖';
      case 'youtube-link':
        return '📺';
      case 'pdf':
        return '📄';
      default:
        return '💬';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
      {/* Header with similarity and source info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSimilarityColor(result.similarity)}`}>
            {Math.round(result.similarity * 100)}% match
          </span>
          <span className="text-sm text-gray-500">
            Result {index + 1}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onFollowUp(result)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Follow up"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewContext(result)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="View in full context"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chunk Text */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Chunk Text</h3>
        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
          {result.text_chunk}
        </p>
      </div>

      {/* Source Info */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Source Info</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getSourceIcon(result.source?.type)}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {result.source?.title || 'Untitled Source'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {result.source?.type?.replace('-', ' ')} • {' '}
                {new Date(result.source?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link
            to={`/conversations/${result.source?.id}`}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            View Source
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>

      {/* Participant info if available */}
      {result.participant_label && (
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          From {result.participant_label} • {new Date(result.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}