
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  GitBranch, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Building 
} from 'lucide-react';

const sidebarItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/app/dashboard', 
    badge: null 
  },
  { 
    id: 'chats', 
    label: 'Chats', 
    icon: MessageCircle, 
    path: '/app/chats', 
    badge: null 
  },
  { 
    id: 'hybrid', 
    label: 'Hybrid Chat', 
    icon: GitBranch, 
    path: '/app/hybrid', 
    badge: null 
  },
  { 
    id: 'chat-groups', 
    label: 'Chat Groups', 
    icon: Users, 
    path: '/app/chat-groups', 
    badge: null 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    path: '/app/analytics', 
    badge: null 
  },
  { 
    id: 'team', 
    label: 'Team Workspace', 
    icon: Building, 
    path: '/app/team', 
    badge: null 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/app/settings', 
    badge: null 
  },
  { 
    id: 'help', 
    label: 'Help', 
    icon: HelpCircle, 
    path: '/app/help', 
    badge: null 
  },
];

// Define interface for props
interface SidebarProps {
  onSidebarToggle?: (collapsed: boolean) => void;
}

const Sidebar = ({ onSidebarToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Toggle sidebar state
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Notify parent component if callback provided
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
    // Store preference in local storage
    localStorage.setItem('sidebar-collapsed', newState ? 'true' : 'false');
  };
  
  // Handle navigation with active state tracking
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  // Load saved sidebar state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      const newState = savedState === 'true';
      setIsCollapsed(newState);
      if (onSidebarToggle) {
        onSidebarToggle(newState);
      }
    }
  }, [onSidebarToggle]);

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <motion.aside
      initial="collapsed"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sidebar-modern border-r border-[#B8CFCE]/20 flex flex-col shadow-xl bg-[#333446]/95 backdrop-blur-sm z-20 h-screen sticky top-0 left-0"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#B8CFCE]/20">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#333446] to-[#7F8CAA] rounded-xl flex items-center justify-center shadow-lg pulse-glow">
                  <span className="text-[#EAEFEF] font-bold text-lg">K</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-[#B8CFCE] to-[#EAEFEF] bg-clip-text text-transparent">
                  knitter.app
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-10 h-10 p-0 hover:bg-[#7F8CAA]/30 rounded-xl transition-all duration-300 text-[#EAEFEF]"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            >
              <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
            </svg>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#7F8CAA]/50 scrollbar-track-transparent">
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
                      className={`w-12 h-12 p-0 relative rounded-xl transition-all duration-300 ${
                        isActive 
                          ? "bg-gradient-to-r from-[#7F8CAA] to-[#B8CFCE] text-[#333446] shadow-lg" 
                          : "hover:bg-[#7F8CAA]/20 hover:scale-105 text-[#EAEFEF]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.badge && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-gradient-to-r from-accent to-secondary">
                          {item.badge}
                        </Badge>
                      )}
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
                    ? "bg-gradient-to-r from-[#7F8CAA] to-[#B8CFCE] text-[#333446] shadow-lg" 
                    : "hover:bg-[#7F8CAA]/20 hover:scale-[1.02] text-[#EAEFEF]"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <motion.span
                  variants={contentVariants}
                  className="flex-1 text-left font-medium"
                >
                  {item.label}
                </motion.span>
                {item.badge && (
                  <motion.div variants={contentVariants}>
                    <Badge className="ml-auto bg-gradient-to-r from-[#333446] to-[#7F8CAA] text-[#EAEFEF]">
                      {item.badge}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#B8CFCE]/20">
        <motion.div
          variants={contentVariants}
          className={`${isCollapsed ? 'hidden' : 'block'}`}
        >
          <div className="glass-effect rounded-xl p-3 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#7F8CAA] to-[#B8CFCE] rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-[#333446] text-sm font-bold">✨</span>
            </div>
            <p className="text-xs text-[#EAEFEF]/80">
              Upgrade to Pro for unlimited features
            </p>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
