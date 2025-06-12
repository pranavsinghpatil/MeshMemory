<<<<<<< HEAD
import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
=======
import React, { createContext, useContext, useEffect, useState } from 'react';
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const { darkMode, setDarkMode, uiHasHydrated } = useAppStore();
  const [isDark, setIsDark] = React.useState(false);

  // Convert between darkMode (boolean | null) and theme (string)
  const theme: Theme = darkMode === true ? 'dark' : darkMode === false ? 'light' : 'system';
  
  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      setDarkMode(true);
    } else if (newTheme === 'light') {
      setDarkMode(false);
    } else {
      setDarkMode(null);
    }
  };

  useEffect(() => {
    // Wait for store to hydrate before proceeding
    if (!uiHasHydrated) {
      return;
    }
    
=======
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let shouldBeDark = false;
      
<<<<<<< HEAD
      if (darkMode === true) {
        shouldBeDark = true;
      } else if (darkMode === false) {
=======
      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
        shouldBeDark = false;
      } else {
        // system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      setIsDark(shouldBeDark);
      
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
<<<<<<< HEAD
      if (darkMode === null) {
=======
      if (theme === 'system') {
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
<<<<<<< HEAD
  }, [darkMode, uiHasHydrated]);
=======
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}