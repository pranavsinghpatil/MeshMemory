
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Users, 
  Settings, 
  Crown, 
  Mail, 
  Shield,
  MoreVertical,
  UserPlus,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TeamWorkspacePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'Owner',
      avatar: '/api/placeholder/48/48',
      status: 'online',
      joinDate: '2023-01-15',
      lastActive: 'now'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'Admin',
      avatar: '/api/placeholder/48/48',
      status: 'online',
      joinDate: '2023-02-01',
      lastActive: '5 min ago'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma@company.com',
      role: 'Member',
      avatar: '/api/placeholder/48/48',
      status: 'away',
      joinDate: '2023-02-15',
      lastActive: '1 hour ago'
    },
    {
      id: 4,
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Member',
      avatar: '/api/placeholder/48/48',
      status: 'offline',
      joinDate: '2023-03-01',
      lastActive: 'Yesterday'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa@company.com',
      role: 'Member',
      avatar: '/api/placeholder/48/48',
      status: 'online',
      joinDate: '2023-03-10',
      lastActive: '10 min ago'
    }
  ];

  const pendingInvitations = [
    {
      id: 1,
      email: 'alex@company.com',
      role: 'Member',
      invitedBy: 'Sarah Johnson',
      invitedDate: '2024-01-20'
    },
    {
      id: 2,
      email: 'rachel@company.com',
      role: 'Admin',
      invitedBy: 'Mike Chen',
      invitedDate: '2024-01-18'
    }
  ];

  const workspaceStats = [
    { label: 'Total Members', value: teamMembers.length, icon: Users },
    { label: 'Active Today', value: teamMembers.filter(m => m.status === 'online').length, icon: Building },
    { label: 'Pending Invites', value: pendingInvitations.length, icon: Mail },
    { label: 'Admins', value: teamMembers.filter(m => m.role === 'Admin' || m.role === 'Owner').length, icon: Shield }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner': return 'bg-yellow-500';
      case 'Admin': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Workspace</h1>
          <p className="text-muted-foreground">
            Manage your team members and workspace settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Workspace Settings
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </motion.div>

      {/* Workspace Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workspaceStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Team Members */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Team Members</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-6 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-background`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        {member.role === 'Owner' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        <Badge 
                          variant="secondary" 
                          className={`${getRoleColor(member.role)} text-white text-xs`}
                        >
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joinDate).toLocaleDateString()} • Last active {member.lastActive}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getStatusColor(member.status)} text-white border-0 capitalize`}>
                      {member.status}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        {member.role !== 'Owner' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Pending Invitations</h2>
          <Card>
            <CardHeader>
              <CardTitle>Awaiting Response</CardTitle>
              <CardDescription>
                These invitations are waiting for acceptance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited by {invitation.invitedBy} on {new Date(invitation.invitedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{invitation.role}</Badge>
                      <Button variant="outline" size="sm">
                        Resend
                      </Button>
                      <Button variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </div>
  );
};

export default TeamWorkspacePage;
