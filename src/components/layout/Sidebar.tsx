import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LayoutDashboard,
  MessageCircle,
  BarChart3, 
  Settings, 
  HelpCircle
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/app/dashboard', 
  },
  { 
    id: 'chats', 
    label: 'Chats', 
    icon: MessageCircle, 
    path: '/app/chats', 
  },
  
  
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    path: '/app/analytics', 
  },
  
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/app/settings', 
  },
  { 
    id: 'help', 
    label: 'Help', 
    icon: HelpCircle, 
    path: '/app/help', 
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarVariants = {
    expanded: { width: 220 },
    collapsed: { width: 64 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  }

  return (
    <motion.aside
      initial="collapsed"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sidebar-modern border-r border-sidebar-border/30 flex flex-col shadow-xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border/30">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1"
              >
                <h1 className="text-2xl font-bold text-primary">MeshMemory</h1>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-15 h-15 p-0 hover:bg-sidebar-accent/50 rounded-xl transition-all duration-300"
          >
                        <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (isCollapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-12 h-12 p-0 relative rounded-xl transition-all duration-300"
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link key={item.id} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" 
                    : "hover:bg-sidebar-accent/50 hover:scale-[1.02]"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <motion.span
                  variants={contentVariants}
                  className="flex-1 text-left font-medium"
                >
                  {item.label}
                </motion.span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/30">
        <div className="glass-effect rounded-xl p-3 text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg mx-auto mb-2 flex items-center justify-center">
            <span className="text-white text-sm font-bold">✨</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Upgrade to Pro for unlimited features
          </p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;