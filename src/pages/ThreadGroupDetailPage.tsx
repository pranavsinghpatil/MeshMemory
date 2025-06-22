import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ThreadGroupDetailHeader from '../components/ThreadGroupDetailHeader';
import ThreadGroupMembersPanel from '../components/ThreadGroupMembersPanel';
import FusedChatArea from '../components/FusedChatArea';
import RelatedGroupsPanel from '../components/RelatedGroupsPanel';
import ErrorMessage from '../components/ErrorMessage';

export default function ThreadGroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [fusedChunks, setFusedChunks] = useState<any[]>([]);
  const [relatedGroups, setRelatedGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      setTimeout(() => {
        // Mock group data
        const mockGroup = {
          id: groupId,
          title: 'React State Management',
          tags: ['React', 'JavaScript', 'Hooks', 'State'],
          summary: 'This thread group combines conversations about React state management, hooks, and performance optimization. Key topics include useState vs useReducer, Context API usage, and strategies to minimize re-renders.',
          memberCount: 3,
          created_at: '2024-01-10T10:30:00Z',
          updated_at: '2024-01-15T14:20:00Z'
        };
        
        // Mock member chats
        const mockMembers = [
          {
            id: 'chat-1',
            title: 'React Hooks Best Practices',
            type: 'chatgpt-link',
            created_at: '2024-01-10T10:30:00Z'
          },
          {
            id: 'chat-2',
            title: 'Context API vs Redux',
            type: 'chatgpt-link',
            created_at: '2024-01-12T15:45:00Z'
          },
          {
            id: 'chat-3',
            title: 'Performance Optimization in React',
            type: 'youtube-link',
            created_at: '2024-01-14T09:20:00Z'
          }
        ];
        
        // Mock fused conversation chunks
        const mockFusedChunks = [
          {
            id: 'chunk-1',
            text_chunk: "What's the best way to manage state in a React application?",
            participant_label: 'User',
            timestamp: '2024-01-10T10:31:00Z',
            source_title: 'React Hooks Best Practices'
          },
          {
            id: 'chunk-2',
            text_chunk: "The best approach depends on your application's complexity. For simple local state, useState is perfect. For more complex state logic, useReducer provides a more predictable state management pattern. For global state that needs to be accessed by many components, you might use Context API or external libraries like Redux or Zustand.",
            participant_label: 'Assistant',
            timestamp: '2024-01-10T10:32:00Z',
            source_title: 'React Hooks Best Practices'
          },
          {
            id: 'chunk-3',
            text_chunk: "When should I use Context API versus Redux?",
            participant_label: 'User',
            timestamp: '2024-01-12T15:46:00Z',
            source_title: 'Context API vs Redux'
          },
          {
            id: 'chunk-4',
            text_chunk: "Context API is built into React and is great for passing data through the component tree without prop drilling. It's simpler than Redux and sufficient for many applications. However, Context isn't optimized for high-frequency updates and can cause performance issues with large state objects. Redux shines in complex applications with frequent updates, middleware support, and powerful developer tools. Consider Context for simpler global state needs and Redux for more complex state management requirements.",
            participant_label: 'Assistant',
            timestamp: '2024-01-12T15:47:00Z',
            source_title: 'Context API vs Redux'
          },
          {
            id: 'chunk-5',
            text_chunk: "What are some strategies to optimize performance in React components?",
            participant_label: 'User',
            timestamp: '2024-01-14T09:21:00Z',
            source_title: 'Performance Optimization in React'
          },
          {
            id: 'chunk-6',
            text_chunk: "To optimize React performance: 1) Use React.memo for component memoization, 2) Implement useMemo and useCallback to prevent unnecessary recalculations and rerenders, 3) Use the virtual list pattern with libraries like react-window for long lists, 4) Lazy load components with React.lazy and Suspense, 5) Optimize Context usage by splitting contexts or using more granular providers, 6) Use the useTransition hook for non-urgent state updates, and 7) Implement proper key props in lists for efficient reconciliation.",
            participant_label: 'Assistant',
            timestamp: '2024-01-14T09:22:00Z',
            source_title: 'Performance Optimization in React'
          }
        ];
        
        // Mock related groups
        const mockRelatedGroups = [
          {
            id: 'group-1',
            title: 'Frontend Architecture',
            tags: ['React', 'Architecture', 'Design Patterns'],
            memberCount: 4,
            similarity: 0.82
          },
          {
            id: 'group-2',
            title: 'JavaScript Frameworks Comparison',
            tags: ['JavaScript', 'React', 'Vue', 'Angular'],
            memberCount: 3,
            similarity: 0.75
          }
        ];
        
        setGroup(mockGroup);
        setMembers(mockMembers);
        setFusedChunks(mockFusedChunks);
        setRelatedGroups(mockRelatedGroups);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching group data:', error);
      setError('Failed to load thread group data. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (data: { title?: string; tags?: string[] }) => {
    // In a real implementation, this would be an API call
    console.log('Updating group with data:', data);
    
    // Update local state
    setGroup(prev => ({
      ...prev,
      ...(data.title && { title: data.title }),
      ...(data.tags && { tags: data.tags })
    }));
    
    return Promise.resolve();
  };

  const handleAddMember = () => {
    console.log('Add member to group');
    // Implementation would open a modal to select chats to add
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('Remove member from group:', memberId);
    // Implementation would confirm and remove the member
    setMembers(members.filter(member => member.id !== memberId));
  };

  const handleSendMessage = async (message: string) => {
    console.log('Sending message to group:', message);
    // In a real implementation, this would send the message to the API
    
    // For demo purposes, add the message to the fused chunks
    const newMessage = {
      id: `chunk-${fusedChunks.length + 1}`,
      text_chunk: message,
      participant_label: 'User',
      timestamp: new Date().toISOString(),
      source_title: 'New Message'
    };
    
    setFusedChunks([...fusedChunks, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `chunk-${fusedChunks.length + 2}`,
        text_chunk: "I've processed your message in the context of all the conversations in this thread group. Based on the combined knowledge from these discussions about React state management, hooks, and performance optimization, I can provide a comprehensive response that takes into account all the nuances from the different conversations.",
        participant_label: 'Assistant',
        timestamp: new Date().toISOString(),
        source_title: 'AI Response'
      };
      
      setFusedChunks(prev => [...prev, aiResponse]);
    }, 1500);
    
    return Promise.resolve();
  };

  if (loading) {
    return (
              <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
    );
  }

  if (error) {
    return (
              <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Link
              to="/threadgroups"
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Thread Groups
            </Link>
            
            <ErrorMessage
              title="Error Loading Thread Group"
              message={error}
              onRetry={fetchGroupData}
              showHomeLink={true}
              className="mt-6"
            />
          </div>
        </div>
    );
  }

  if (!group) {
    return (
              <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thread Group not found</h2>
          <Link to="/threadgroups" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 mt-4 inline-block transition-colors">
            Return to Thread Groups
          </Link>
        </div>
    );
  }

  return (
          <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Back Link */}
          <Link
            to="/threadgroups"
            className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Thread Groups
          </Link>
          
          {/* Group Header */}
          <ThreadGroupDetailHeader 
            group={group} 
            onUpdateGroup={handleUpdateGroup} 
          />
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Members Panel */}
            <div className="lg:col-span-1">
              <ThreadGroupMembersPanel 
                members={members}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
              />
              
              {/* Related Groups */}
              <div className="mt-6">
                <RelatedGroupsPanel relatedGroups={relatedGroups} />
              </div>
            </div>
            
            {/* Right Column - Fused Chat */}
            <div className="lg:col-span-2 h-[calc(100vh-300px)]">
              <FusedChatArea 
                groupId={groupId || ''}
                fusedChunks={fusedChunks}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
