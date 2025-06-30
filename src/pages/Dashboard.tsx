
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Users, 
  BarChart3, 
  Plus,
  TrendingUp,
  Clock,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  // Stats data - empty array to be populated from backend
  const stats = [];

  const quickActions = [
    {
      title: 'New Chat',
      description: 'Start a conversation',
      icon: MessageCircle,
      color: 'from-primary to-accent',
      path: '/app/chats'
    },
    {
      title: 'Create Hybrid Chat',
      description: 'Combine multiple chat sources',
      icon: Users,
      color: 'from-primary to-accent',
      path: '/app/hybrid'
    },
    {
      title: 'View Analytics',
      description: 'Check team insights',
      icon: BarChart3,
      color: 'from-accent to-secondary',
      path: '/app/analytics'
    },
    {
      title: 'Invite Members',
      description: 'Add team members',
      icon: Plus,
      color: 'from-accent to-secondary',
      path: '/app/team'
    }
  ];

  // Recent activity - empty array to be populated from backend
  const recentActivity = [];

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Quick Actions - Moved to top */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <p className="text-muted-foreground">Get started with these common tasks</p>
          </div>
          {/* <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
            <Zap className="w-4 h-4 mr-1" />
            Fast Access
          </Badge> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card 
                  className="card-modern h-full cursor-pointer group border-2 border-border/20 hover:border-primary/30" 
                  onClick={() => navigate(action.path)}
                >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2 text-lg">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Welcome Section */}
      {/* <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden"
      >
        <Card className="glass-effect border-2 border-primary/10">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back! 
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    {' '}Let's collaborate
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your team communication hub is ready. Start engaging with your workspace.
                </p>
              </div>
              <div className="hidden md:flex space-x-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div 
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-r from-secondary to-success rounded-full flex items-center justify-center"
                >
                  <Rocket className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section> */}

    

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="card-modern">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your team
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="ring-2 ring-primary/20">
                      <AvatarImage src={activity.avatarUrl || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white font-semibold">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        <span className="font-semibold text-primary">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default Dashboard;
