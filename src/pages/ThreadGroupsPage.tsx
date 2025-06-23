
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, GitBranch, MessageCircle, Pin, Clock } from 'lucide-react';

const ThreadGroupsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const threadGroups = [
    {
      id: 1,
      title: 'Q4 Planning Discussion',
      description: 'Strategic planning for the upcoming quarter',
      threadCount: 8,
      unreadCount: 2,
      lastActivity: '10 min ago',
      isPinned: true,
      creator: { name: 'Sarah Johnson', avatar: '/api/placeholder/24/24' },
      participants: [
        { id: 1, name: 'Mike Chen', avatar: '/api/placeholder/24/24' },
        { id: 2, name: 'Emma Wilson', avatar: '/api/placeholder/24/24' },
        { id: 3, name: 'John Doe', avatar: '/api/placeholder/24/24' },
      ],
      tags: ['planning', 'strategy', 'Q4']
    },
    {
      id: 2,
      title: 'Feature Request: Dark Mode',
      description: 'Discussion about implementing dark mode across the platform',
      threadCount: 15,
      unreadCount: 5,
      lastActivity: '1 hour ago',
      isPinned: false,
      creator: { name: 'Alex Brown', avatar: '/api/placeholder/24/24' },
      participants: [
        { id: 4, name: 'Lisa Anderson', avatar: '/api/placeholder/24/24' },
        { id: 5, name: 'Tom Wilson', avatar: '/api/placeholder/24/24' },
        { id: 6, name: 'Rachel Green', avatar: '/api/placeholder/24/24' },
      ],
      tags: ['feature', 'UI', 'enhancement']
    },
    {
      id: 3,
      title: 'Bug Reports & Fixes',
      description: 'Tracking and resolving reported bugs',
      threadCount: 12,
      unreadCount: 0,
      lastActivity: '3 hours ago',
      isPinned: true,
      creator: { name: 'David Miller', avatar: '/api/placeholder/24/24' },
      participants: [
        { id: 7, name: 'Chris Taylor', avatar: '/api/placeholder/24/24' },
        { id: 8, name: 'Jane Smith', avatar: '/api/placeholder/24/24' },
      ],
      tags: ['bugs', 'fixes', 'development']
    },
    {
      id: 4,
      title: 'Marketing Campaign Ideas',
      description: 'Brainstorming for the next marketing campaign',
      threadCount: 6,
      unreadCount: 1,
      lastActivity: 'Yesterday',
      isPinned: false,
      creator: { name: 'Rachel Green', avatar: '/api/placeholder/24/24' },
      participants: [
        { id: 9, name: 'Chris Taylor', avatar: '/api/placeholder/24/24' },
        { id: 10, name: 'Emma Wilson', avatar: '/api/placeholder/24/24' },
      ],
      tags: ['marketing', 'campaign', 'creative']
    }
  ];

  const filteredGroups = threadGroups.filter(group =>
    group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort by pinned first, then by last activity
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Thread Groups</h1>
          <p className="text-muted-foreground">Organized discussions by topic</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Thread Group
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search thread groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Thread Groups List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4 flex-1 overflow-auto"
      >
        {sortedGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.title}
                        {group.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-500" />
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription className="mb-3">
                      {group.description}
                    </CardDescription>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {group.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {group.unreadCount > 0 && (
                      <Badge className="animate-pulse-glow">
                        {group.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Creator */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={group.creator.avatar} alt={group.creator.name} />
                        <AvatarFallback className="text-xs">
                          {group.creator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        by {group.creator.name}
                      </span>
                    </div>
                    
                    {/* Participants */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {group.participants.slice(0, 3).map((participant) => (
                          <Avatar key={participant.id} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback className="text-xs">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {group.participants.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                            +{group.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {group.threadCount} threads
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {group.lastActivity}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {sortedGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <GitBranch className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No thread groups found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first thread group to organize discussions'}
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Thread Group
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ThreadGroupsPage;
