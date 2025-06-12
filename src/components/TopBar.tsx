import * as React from 'react';
import * as Icons from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const { isGuest } = useAuth();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-knitter-dark-base shadow-sm border-b border-gray-200 dark:border-knitter-dark-accent transition-colors">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}