import React, { useState } from 'react';
import { Clock, MessageCircle, Pin, Eye, User, Bot } from 'lucide-react';

interface ConversationChunkProps {
  chunk: any;
  onFollowUp: (chunk: any) => void;
  onPinToThread: (chunk: any) => void;
  onSeeContext: (chunk: any) => void;
}

export default function ConversationChunk({ 
  chunk, 
  onFollowUp, 
  onPinToThread, 
  onSeeContext 
}: ConversationChunkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isUser = chunk.participant_label?.toLowerCase().includes('user') || 
                 chunk.participant_label?.toLowerCase().includes('human');

  const getChunkStyle = () => {
    if (isUser) {
      return {
        container: 'ml-auto max-w-xs sm:max-w-md',
        bubble: 'bg-indigo-600 text-white',
        icon: User,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600'
      };
    } else {
      return {
        container: 'mr-auto max-w-xs sm:max-w-md',
        bubble: 'bg-white border border-gray-200 text-gray-900',
        icon: Bot,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600'
      };
    }
  };

  const style = getChunkStyle();
  const IconComponent = style.icon;

  return (
    <div className="relative">
      <div className={`relative ${style.container}`}>
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className={`flex-shrink-0 h-8 w-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <IconComponent className={`h-4 w-4 ${style.iconColor}`} />
            </div>
          )}
          
          <div
            className={`relative px-4 py-3 rounded-2xl shadow-sm ${style.bubble} transition-all duration-200 ${
              isHovered ? 'shadow-md transform scale-[1.02]' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p className="text-sm leading-relaxed">{chunk.text_chunk}</p>
            
            {chunk.participant_label && (
              <p className="text-xs opacity-75 mt-2">
                — {chunk.participant_label}
              </p>
            )}
            
            <p className="text-xs opacity-60 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(chunk.timestamp).toLocaleString()}
            </p>

            {/* Hover Actions */}
            {isHovered && (
              <div className="absolute -top-2 -right-2 flex space-x-1">
                <button
                  onClick={() => onFollowUp(chunk)}
                  className="p-1.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                  title="Follow up"
                >
                  <MessageCircle className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onPinToThread(chunk)}
                  className="p-1.5 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
                  title="Pin to Thread"
                >
                  <Pin className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onSeeContext(chunk)}
                  className="p-1.5 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                  title="See context"
                >
                  <Eye className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {isUser && (
            <div className={`flex-shrink-0 h-8 w-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <IconComponent className={`h-4 w-4 ${style.iconColor}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}