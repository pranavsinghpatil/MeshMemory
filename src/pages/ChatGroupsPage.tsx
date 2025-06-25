
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Users, MessageCircle, Crown, Settings } from 'lucide-react';

const ChatGroupsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const chatGroups = [
    {
      id: 1,
      name: 'Design Team',
      description: 'Creative minds working on UI/UX',
      memberCount: 8,
      unreadCount: 3,
      lastActivity: '5 min ago',
      avatar: '/api/placeholder/48/48',
      isOwner: true,
      members: [
        { id: 1, name: 'Sarah Johnson', avatar: '/api/placeholder/24/24' },
        { id: 2, name: 'Mike Chen', avatar: '/api/placeholder/24/24' },
        { id: 3, name: 'Emma Wilson', avatar: '/api/placeholder/24/24' },
      ]
    },
    {
      id: 2,
      name: 'Product Team',
      description: 'Product strategy and roadmap discussions',
      memberCount: 12,
      unreadCount: 0,
      lastActivity: '2 hours ago',
      avatar: '/api/placeholder/48/48',
      isOwner: false,
      members: [
        { id: 4, name: 'John Doe', avatar: '/api/placeholder/24/24' },
        { id: 5, name: 'Jane Smith', avatar: '/api/placeholder/24/24' },
        { id: 6, name: 'Alex Brown', avatar: '/api/placeholder/24/24' },
      ]
    },
    {
      id: 3,
      name: 'Engineering',
      description: 'Technical discussions and code reviews',
      memberCount: 15,
      unreadCount: 7,
      lastActivity: '1 hour ago',
      avatar: '/api/placeholder/48/48',
      isOwner: false,
      members: [
        { id: 7, name: 'Tom Wilson', avatar: '/api/placeholder/24/24' },
        { id: 8, name: 'Lisa Anderson', avatar: '/api/placeholder/24/24' },
        { id: 9, name: 'David Miller', avatar: '/api/placeholder/24/24' },
      ]
    },
    {
      id: 4,
      name: 'Marketing',
      description: 'Campaigns, content, and growth strategies',
      memberCount: 6,
      unreadCount: 1,
      lastActivity: 'Yesterday',
      avatar: '/api/placeholder/48/48',
      isOwner: true,
      members: [
        { id: 10, name: 'Rachel Green', avatar: '/api/placeholder/24/24' },
        { id: 11, name: 'Chris Taylor', avatar: '/api/placeholder/24/24' },
      ]
    }
  ];

  const filteredGroups = chatGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Chat Groups</h1>
          <p className="text-muted-foreground">Collaborate with your teams</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => navigate('/app/hybrid')}>
          <Plus className="w-4 h-4" />
          Create Hybrid
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
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Groups Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-auto"
      >
        {filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={group.avatar} alt={group.name} />
                      <AvatarFallback>
                        <Users className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.name}
                        {group.isOwner && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {group.memberCount} members
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {group.unreadCount > 0 && (
                      <Badge className="animate-pulse-glow">
                        {group.unreadCount}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {group.description}
                </CardDescription>
                
                {/* Member Avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((member, idx) => (
                      <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.memberCount > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                        +{group.memberCount - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {group.lastActivity}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first group to get started'}
          </p>
          <Button onClick={() => navigate('/app/hybrid')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Hybrid
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ChatGroupsPage;
