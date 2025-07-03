
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

// Color palette configuration based on user requirements
export const themeConfig = {
  dark: {
    primary: '#333446',
    secondary: '#7F8CAA',
    accent: '#B8CFCE',
    text: '#EAEFEF',
    background: '#333446',
    border: '#7F8CAA',
    muted: '#7F8CAA80',
  },
  light: {
    primary: '#3B3B1A',
    secondary: '#8A784E',
    accent: '#AEC8A4',
    text: '#3B3B1A',
    background: '#E7EFC7',
    border: '#8A784E',
    muted: '#8A784E80',
  }
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colors: typeof themeConfig.dark | typeof themeConfig.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Updated to use knitter.app theme key
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('knitter-theme') as Theme;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  // Get current color palette based on theme
  const colors = theme === 'dark' ? themeConfig.dark : themeConfig.light;

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Update class names for theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Apply theme colors as CSS variables
    const currentColors = theme === 'dark' ? themeConfig.dark : themeConfig.light;
    Object.entries(currentColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Save theme preference
    localStorage.setItem('knitter-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
