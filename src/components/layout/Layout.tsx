
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useMediaQuery } from '../../hooks/use-media-query';

const Layout = () => {
  // State for sidebar collapsed status
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State for tracking mobile view
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Handle sidebar toggle from either Navbar or Sidebar
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };
  
  // Auto-collapse sidebar on mobile view
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);
  
  return (
    <div className="min-h-screen w-full bg-[#333446]">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          onSidebarToggle={handleSidebarToggle} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar 
            toggleSidebar={() => handleSidebarToggle(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed} 
          />
          <main className="flex-1 overflow-auto bg-gradient-to-b from-[#333446] to-[#7F8CAA]/90">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
