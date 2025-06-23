
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageCircle, 
  Clock, 
  Target,
  Zap
} from 'lucide-react';

const AnalyticsPage = () => {
  const metrics = [
    {
      title: 'Total Messages',
      value: '12,543',
      change: '+15.3%',
      trend: 'up',
      icon: MessageCircle,
      color: 'text-blue-500'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Avg Response Time',
      value: '2.4m',
      change: '-12.5%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      title: 'Team Engagement',
      value: '87%',
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-500'
    }
  ];

  const chartData = [
    { name: 'Mon', messages: 245, users: 120 },
    { name: 'Tue', messages: 320, users: 145 },
    { name: 'Wed', messages: 290, users: 135 },
    { name: 'Thu', messages: 410, users: 180 },
    { name: 'Fri', messages: 380, users: 165 },
    { name: 'Sat', messages: 150, users: 80 },
    { name: 'Sun', messages: 120, users: 65 }
  ];

  const topChannels = [
    { name: 'Design Team', messages: 1243, growth: 15.2 },
    { name: 'Engineering', messages: 1156, growth: 8.7 },
    { name: 'Product Team', messages: 892, growth: 12.1 },
    { name: 'Marketing', messages: 654, growth: -3.2 },
    { name: 'Sales', messages: 423, growth: 22.8 }
  ];

  const moodAnalysis = {
    positive: 68,
    neutral: 24,
    negative: 8
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Insights into your team's communication patterns and productivity
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                    <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Charts Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Communication Trends</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Message Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Messages and active users over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4">
                <div className="h-full flex items-end justify-between gap-2">
                  {chartData.map((day, index) => (
                    <div key={day.name} className="flex-1 flex flex-col items-center">
                      <div className="w-full space-y-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.messages / 450) * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="bg-blue-500 rounded-t"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.users / 200) * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                          className="bg-purple-500 rounded-t"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">{day.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-xs">Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span className="text-xs">Users</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mood Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Overall team mood based on message analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Positive</span>
                    <span className="text-sm font-medium">{moodAnalysis.positive}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${moodAnalysis.positive}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-2 bg-green-500 rounded-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neutral</span>
                    <span className="text-sm font-medium">{moodAnalysis.neutral}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${moodAnalysis.neutral}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-2 bg-yellow-500 rounded-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Negative</span>
                    <span className="text-sm font-medium">{moodAnalysis.negative}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${moodAnalysis.negative}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-2 bg-red-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Top Channels */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-4">Most Active Channels</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topChannels.map((channel, index) => (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {channel.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {channel.messages.toLocaleString()} messages
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={channel.growth > 0 ? 'default' : 'secondary'}>
                    {channel.growth > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(channel.growth)}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default AnalyticsPage;
