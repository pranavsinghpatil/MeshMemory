
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Palette, Sparkles, Menu, MessageSquare, Settings, Home, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const pageNames: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/dashboard': 'Dashboard',
  '/app/chats': 'Chats',
  '/app/chat-groups': 'Chat Groups',
  '/app/thread-groups': 'Thread Groups',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
  '/app/help': 'Help',
  '/app/team': 'Team Workspace',
};

// Interface for sidebar toggling functionality
interface NavbarProps {
  toggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const Navbar = ({ toggleSidebar, isSidebarCollapsed }: NavbarProps) => {
  const location = useLocation();
  const { user, isGuest, logout } = useAuth();
  
  const currentPage = pageNames[location.pathname] || 'MeshMemory';

  return (
    <header className="navbar-modern border-b border-[#B8CFCE]/20 shadow-md bg-[#333446]/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-3"
          >
            {/* Sidebar toggle button */}
            {toggleSidebar && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="w-9 h-9 rounded-full hover:bg-[#7F8CAA]/30 text-[#EAEFEF] transition-all duration-300"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isSidebarCollapsed ? 'Expand' : 'Collapse'} sidebar</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <h1 className="text-xl font-semibold text-[#EAEFEF]">
              {currentPage}
            </h1>
          </motion.div>
        </div>

        {/* Center section - Quick Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center space-x-1"
        >
          {/* Quick navigation buttons */}
          <div className="flex items-center space-x-1 bg-[#7F8CAA]/20 rounded-xl p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/app/dashboard">
                  <Button 
                    variant={location.pathname === '/app/dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-lg ${location.pathname === '/app/dashboard' ? 'bg-[#B8CFCE] text-[#333446]' : 'text-[#EAEFEF] hover:bg-[#B8CFCE]/30'}`}
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Home Dashboard</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/app/chats">
                  <Button 
                    variant={location.pathname === '/app/chats' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-lg ${location.pathname === '/app/chats' ? 'bg-[#B8CFCE] text-[#333446]' : 'text-[#EAEFEF] hover:bg-[#B8CFCE]/30'}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chats
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Message Chats</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/app/chat-groups">
                  <Button 
                    variant={location.pathname === '/app/chat-groups' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-lg ${location.pathname === '/app/chat-groups' ? 'bg-[#B8CFCE] text-[#333446]' : 'text-[#EAEFEF] hover:bg-[#B8CFCE]/30'}`}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Groups
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Chat Groups</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/app/settings">
                  <Button 
                    variant={location.pathname === '/app/settings' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-lg ${location.pathname === '/app/settings' ? 'bg-[#B8CFCE] text-[#333446]' : 'text-[#EAEFEF] hover:bg-[#B8CFCE]/30'}`}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>User Settings</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Logo in center */}
          <div className="flex items-center space-x-2 ml-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#333446] to-[#7F8CAA] rounded-xl flex items-center justify-center shadow-lg pulse-glow">
              <span className="text-[#EAEFEF] font-bold text-md">
                K
              </span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#B8CFCE] to-[#EAEFEF] bg-clip-text text-transparent hidden md:inline-block">
              knitter.app
            </span>
            <Sparkles className="w-4 h-4 text-[#B8CFCE] animate-pulse" />
          </div>
        </motion.div>

        {/* Right section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center space-x-3 ml-auto"
        >
          {/* Notifications bell removed as requested */}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:scale-110 transition-all duration-300">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'Guest'} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {isGuest ? 'G' : user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-effect border-border/50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {isGuest ? 'Guest User' : user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isGuest ? 'Limited access' : user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isGuest && (
                <>
                  <DropdownMenuItem className="hover:bg-primary/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary/10">
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Appearance</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={logout} className="hover:bg-destructive/10 text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isGuest ? 'Exit Guest Mode' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Guest indicator */}
          {isGuest && (
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-secondary to-success text-white">
              Guest
            </Badge>
          )}
        </motion.div>
      </div>
    </header>
  );
};

export default Navbar;
