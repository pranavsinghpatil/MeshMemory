import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  Sparkles,
  TrendingUp,
  Star,
  Rocket,
  Heart,
  Brain,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  // const { continueAsGuest } = useAuth();

  // const handleContinueAsGuest = () => {
    // continueAsGuest();
    // navigate('/app/dashboard');
  // };

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Seamless communication with instant messaging, file sharing, and emoji reactions.',
      color: 'from-amber-400 to-yellow-500',
      delay: 0.1
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Powerful insights into team communication patterns and productivity metrics.',
      color: 'from-orange-400 to-amber-500',
      delay: 0.2
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Organize conversations with groups, threads, and workspace management.',
      color: 'from-yellow-400 to-orange-500',
      delay: 0.3
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for instant loading and smooth user experience.',
      color: 'from-amber-500 to-yellow-600',
      delay: 0.4
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encryption and enterprise-grade security for your conversations.',
      color: 'from-yellow-500 to-amber-600',
      delay: 0.5
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access your workspace from anywhere with cross-platform synchronization.',
      color: 'from-orange-500 to-amber-600',
      delay: 0.6
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10K+', icon: Users, color: 'from-amber-500 to-yellow-500' },
    { label: 'Messages Sent', value: '1M+', icon: MessageCircle, color: 'from-yellow-500 to-orange-500' },
    { label: 'Teams', value: '500+', icon: TrendingUp, color: 'from-orange-500 to-amber-600' },
    { label: 'Satisfaction', value: '99%', icon: Star, color: 'from-amber-600 to-yellow-600' }
  ];

  // Dynamic illustration components
  const FloatingOrb = ({ size = "w-16 h-16", delay = 0, className = "" }) => (
    <motion.div
      className={`${size} ${className} rounded-full absolute opacity-30`}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const AnimatedIcon = ({ Icon, delay = 0, className = "" }) => (
    <motion.div
      className={`w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl ${className}`}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon className="w-8 h-8 text-primary-foreground" />
    </motion.div>
  );

  return (
    <div className="relative h-full w-full bg-[#0f291b]">
      {/* <img src="../lba.png" alt="background" className="w-full h-full object-cover"/> */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,rgba(216,190,80,1)_100%)]"></div>
      
      {/* Floating illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb 
          size="w-32 h-32" 
          delay={0} 
          className="top-20 left-10 bg-gradient-to-r from-amber-400/20 to-yellow-500/20" 
        />
        <FloatingOrb 
          size="w-24 h-24" 
          delay={2} 
          className="top-40 right-20 bg-gradient-to-r from-orange-400/20 to-amber-500/20" 
        />
        <FloatingOrb 
          size="w-20 h-20" 
          delay={4} 
          className="bottom-40 left-1/4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20" 
        />
        <FloatingOrb 
          size="w-28 h-28" 
          delay={1} 
          className="bottom-20 right-10 bg-gradient-to-r from-amber-500/20 to-yellow-600/20" 
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-2xl pulse-glow">
                <span className="text-primary-foreground font-bold text-xl">M</span>
              </div>
              <span className="text-3xl font-bold text-white drop-shadow-lg">
                MeshMemory
              </span>
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-white border-white/30 hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-8 px-8 py-4 text-base bg-white/20 backdrop-blur-sm text-white border-white/30 rounded-full">
                <Sparkles className="w-5 h-5 mr-2" />
                Now with AI-powered insights
              </Badge>
              
              <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
                <span className="text-white drop-shadow-2xl">
                  Collaborate
                </span>
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent wave-animation">
                  Smarter
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto drop-shadow-lg">
                Transform your team communication with MeshMemory's intelligent chat platform. 
                Real-time messaging meets powerful analytics for unparalleled collaboration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-8 justify-center mb-16"
            >
              <Button 
                size="lg" 
                className="btn-primary text-lg px-12 py-6 h-16 text-lg"
                onClick={() => navigate('/register')}
              >
                <Rocket className="mr-2 w-6 h-6" />
                Get Started
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-ghost text-lg px-12 py-6 h-16 text-white border-white/30 hover:bg-white/10"
                // onClick={handleContinueAsGuest}
              >
                <Heart className="mr-2 w-6 h-6" />
                Demo
              </Button>
            </motion.div>

            {/* Dynamic Illustration Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative w-full max-w-5xl mx-auto">
                {/* Floating animated icons */}
                <div className="absolute -top-12 -left-12">
                  <AnimatedIcon Icon={MessageCircle} delay={0} />
                </div>
                <div className="absolute -top-12 -right-12">
                  <AnimatedIcon Icon={BarChart3} delay={1} />
                </div>
                <div className="absolute -bottom-12 -left-12">
                  <AnimatedIcon Icon={Users} delay={2} />
                </div>
                <div className="absolute -bottom-12 -right-12">
                  <AnimatedIcon Icon={Brain} delay={3} />
                </div>

                {/* Main stats card */}
                <div className="glass-effect rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        className="text-center group"
                      >
                        <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                          {stat.value}
                        </div>
                        <div className="text-base text-white/80 font-medium">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-8 px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-white/30 rounded-full">
              <Target className="w-5 h-5 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 text-white">
              Built for
              <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent"> Modern Teams</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Everything you need to streamline communication, boost productivity, and gain valuable insights into your team's collaboration patterns.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 card-modern">
                  <CardContent className="p-8">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-8 px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-white/30 rounded-full">
              <Rocket className="w-5 h-5 mr-2" />
              Ready to Launch
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 text-white">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent"> Communication?</span>
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Join thousands of teams already using MeshMemory to collaborate more effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Button 
                size="lg" 
                className="btn-primary text-lg px-12 py-6 h-16"
                onClick={() => navigate('/register')}
              >
                <Sparkles className="mr-2 w-6 h-6" />
                Start Your Free Trial
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-ghost text-lg px-12 py-6 h-16 text-white border-white/30 hover:bg-white/10"
                onClick={() => navigate('/app/help')}
              >
                <Brain className="mr-2 w-6 h-6" />
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-primary-foreground font-bold text-lg">M</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  MeshMemory
                </span>
              </div>
              <p className="text-white/80 leading-relaxed">
                Intelligent collaboration platform for modern teams. Transforming how teams communicate and collaborate.
              </p>
              <div className="flex space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-lg">💬</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-r from-accent to-amber-600 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-lg">📊</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-lg">🚀</span>
                </motion.div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg text-white">Product</h3>
              <ul className="space-y-3 text-white/80">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg text-white">Company</h3>
              <ul className="space-y-3 text-white/80">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg text-white">Support</h3>
              <ul className="space-y-3 text-white/80">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-white/80">
              &copy; 2024 MeshMemory. All rights reserved. Made with ❤️ for modern teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
