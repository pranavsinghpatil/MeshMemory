
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
import { User, LogOut, Palette, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const pageNames: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/dashboard': 'Dashboard',
  '/app/chats': 'Chats',


  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
  '/app/help': 'Help',

};

const Navbar = () => {
  const location = useLocation();
  const { user, isGuest, logout } = useAuth();
  
  const currentPage = pageNames[location.pathname] || 'MeshMemory';

  return (
    <header className="navbar-modern border-b-0 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* <h1 className="text-xl font-semibold text-foreground">
              {currentPage}
            </h1> */}
          </motion.div>
        </div>

        {/* Center section - MeshMemory branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg pulse-glow">
            <span className="text-white font-bold text-lg">
              <img src="../dalogo.svg" alt="Logo" className="w-8 h-8" />
            </span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            MeshMemory
          </span>
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        </motion.div>

        {/* Right section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
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
