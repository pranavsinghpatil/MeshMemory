import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, User, Search, MessageSquare, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  onMenuClick?: () => void;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isGuest, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown') && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Get page title based on location
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/chats' || path.startsWith('/chats/')) return 'Conversations';
    if (path === '/chat-groups' || path.startsWith('/chat-groups/')) return 'Chat Groups';
    if (path === '/search' || path.startsWith('/search/')) return 'Search';
    if (path === '/settings') return 'Settings';
    if (path === '/analytics') return 'Analytics';
    if (path === '/help') return 'Help';
    if (path === '/team' || path.startsWith('/team/')) return 'Team Workspace';
    if (path === '/future-features') return 'Future Features';
    
    return 'MeshMemory';
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#333446] border-b border-[#AEC8A4] dark:border-[#7F8CAA] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section with logo and menu button */}
          <div className="flex items-center">
            {/* Hamburger menu for sidebar (on smaller screens) */}
            {onMenuClick && (
              <button 
                onClick={onMenuClick}
                className="p-2 rounded-md text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] mr-3 md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo.svg" alt="MeshMemory logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF] hidden sm:inline-block">
                MeshMemory<span className="text-[#8A784E] dark:text-[#B8CFCE]">.app</span>
              </span>
            </Link>
            
            {/* Page title (mobile) */}
            <span className="ml-4 text-lg font-medium text-[#3B3B1A] dark:text-[#EAEFEF] sm:hidden">
              {title || getPageTitle()}
            </span>
            
            {/* Page title (desktop) */}
            <span className="hidden sm:inline-block ml-4 text-lg font-medium text-[#3B3B1A] dark:text-[#EAEFEF]">
              {title || getPageTitle()}
            </span>
          </div>

          {/* Center section with search (hide on small screens) */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search MeshMemory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 pl-10 pr-4 w-40 lg:w-64 text-sm text-[#3B3B1A] dark:text-[#EAEFEF] bg-[#E7EFC7]/20 dark:bg-[#333446]/50 border border-[#AEC8A4] dark:border-[#7F8CAA] rounded-full focus:outline-none focus:ring-2 focus:ring-[#8A784E] dark:focus:ring-[#B8CFCE] transition-all duration-200 focus:w-52 lg:focus:w-72"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8A784E] dark:text-[#B8CFCE]" />
            </form>
          </div>

          {/* Right section with navigation buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle button - more prominent */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7]/50 dark:hover:bg-[#333446]/70 border border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 transition-all duration-200 transform hover:scale-105"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Main navigation buttons (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/chats"
                className="p-2 rounded-full text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A]"
                aria-label="Chats"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>
              
              <Link 
                to="/search"
                className="p-2 rounded-full text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] md:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
              
              <Link 
                to="/settings"
                className="p-2 rounded-full text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A]"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              
              <Link 
                to="/help"
                className="p-2 rounded-full text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A]"
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
            </div>
            
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-[#8A784E] dark:text-[#B8CFCE] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] md:hidden"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* User dropdown - more prominent */}
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 p-2 rounded-full hover:bg-[#E7EFC7]/50 dark:hover:bg-[#333446]/70 text-[#3B3B1A] dark:text-[#EAEFEF] border border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 transition-all duration-200 transform hover:scale-105"
                aria-label="Open user menu"
              >
                <div className="h-8 w-8 rounded-full bg-[#AEC8A4] dark:bg-[#7F8CAA] flex items-center justify-center text-[#3B3B1A] dark:text-[#EAEFEF]">
                  {isGuest ? (
                    <User className="h-5 w-5" />
                  ) : (
                    user?.email?.charAt(0).toUpperCase() || <User className="h-5 w-5" />
                  )}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#333446] border border-[#AEC8A4] dark:border-[#7F8CAA] rounded-md shadow-lg py-1 z-10">
                  {/* Guest indicator or user info */}
                  {isGuest ? (
                    <div className="px-4 py-2 border-b border-[#AEC8A4] dark:border-[#7F8CAA]">
                      <p className="font-medium text-sm text-[#3B3B1A] dark:text-[#EAEFEF]">Guest Mode</p>
                      <p className="text-xs text-[#8A784E] dark:text-[#B8CFCE]">Limited functionality</p>
                    </div>
                  ) : (
                    <div className="px-4 py-2 border-b border-[#AEC8A4] dark:border-[#7F8CAA]">
                      <p className="font-medium text-sm text-[#3B3B1A] dark:text-[#EAEFEF] truncate">{user?.email}</p>
                      <p className="text-xs text-[#8A784E] dark:text-[#B8CFCE]">MeshMemory user</p>
                    </div>
                  )}

                  <Link to="/dashboard" className="px-4 py-2 text-sm text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7]/50 dark:hover:bg-[#333446]/70 flex items-center rounded-md">
                    Dashboard
                  </Link>
                  <Link to="/settings" className="px-4 py-2 text-sm text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7]/50 dark:hover:bg-[#333446]/70 flex items-center rounded-md">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <Link to="/help" className="px-4 py-2 text-sm text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7]/50 dark:hover:bg-[#333446]/70 flex items-center rounded-md">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut();
                      navigate('/');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-[#E7EFC7]/50 dark:hover:bg-[#333446]/70 flex items-center rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#AEC8A4] dark:border-[#7F8CAA]">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-[#3B3B1A] dark:text-[#EAEFEF] bg-[#E7EFC7] dark:bg-[#3B3B1A] border border-[#AEC8A4] dark:border-[#7F8CAA] rounded-full focus:outline-none focus:ring-2 focus:ring-[#8A784E] dark:focus:ring-[#B8CFCE]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#8A784E] dark:text-[#B8CFCE]" />
            </form>
            
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/dashboard" 
                className="flex items-center px-4 py-2 text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/chats" 
                className="flex items-center px-4 py-2 text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversations
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center px-4 py-2 text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Link>
              <Link 
                to="/help" 
                className="flex items-center px-4 py-2 text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7] dark:hover:bg-[#3B3B1A] rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                Help
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
