import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building, Users, MessageSquare, Layers, BarChart3, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function TeamWorkspacePage() {
  const { teamId } = useParams<{ teamId?: string }>();
  const { workspaces, activeWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamActivity, setTeamActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load team data
    const loadTeamData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          const workspace = workspaces.find(w => w.id === (teamId || activeWorkspace.id));
          
          if (workspace && workspace.type === 'team') {
            setTeamData({
              id: workspace.id,
              name: workspace.name,
              members: workspace.members || 0,
              created: '2023-12-15T10:00:00Z',
              plan: 'Pro',
              storage: {
                used: 2.5, // GB
                total: 10 // GB
              }
            });
            
            setTeamMembers([
              {
                id: 'user-1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'Admin',
                avatar: null
              },
              {
                id: 'user-2',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: 'Member',
                avatar: null
              },
              {
                id: 'user-3',
                name: 'Bob Johnson',
                email: 'bob.johnson@example.com',
                role: 'Member',
                avatar: null
              }
            ]);
            
            setTeamActivity([
              {
                id: 'activity-1',
                user: 'Jane Smith',
                action: 'created a new thread group',
                target: 'Frontend Architecture',
                timestamp: '2024-01-15T14:30:00Z'
              },
              {
                id: 'activity-2',
                user: 'Bob Johnson',
                action: 'imported a conversation',
                target: 'Database Optimization Strategies',
                timestamp: '2024-01-14T11:20:00Z'
              },
              {
                id: 'activity-3',
                user: 'John Doe',
                action: 'shared a thread',
                target: 'Project Roadmap Discussion',
                timestamp: '2024-01-13T09:45:00Z'
              }
            ]);
          }
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading team data:', error);
        setLoading(false);
      }
    };
    
    loadTeamData();
  }, [teamId, activeWorkspace, workspaces]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!teamData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team workspace not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            The team workspace you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{teamData.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Team Workspace • {teamData.members} members • Created {new Date(teamData.created).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Team Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
            {/* Team Stats */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Overview</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{teamData.members}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{teamData.plan}</p>
                </div>
                
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Storage</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {teamData.storage.used}GB / {teamData.storage.total}GB
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" 
                      style={{ width: `${(teamData.storage.used / teamData.storage.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Manage Team
                </button>
              </div>
            </div>
            
            {/* Team Members */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Invite
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="h-8 w-8 rounded-full" />
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === 'Admin'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View All Members
                </button>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {teamActivity.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {activity.user.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{activity.target}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View All Activity
                </button>
              </div>
            </div>
          </div>

          {/* Team Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Team Thread Groups */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Thread Groups</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Team Thread Group {i}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          5 chats • Last updated {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Team Analytics */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Team Analytics</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View Details
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Overview</h3>
                  <div className="h-40 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Conversations</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">124</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Threads</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}