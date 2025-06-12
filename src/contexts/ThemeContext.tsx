import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../store/useStore';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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
    
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let shouldBeDark = false;
      
      if (darkMode === true) {
        shouldBeDark = true;
      } else if (darkMode === false) {
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
      if (darkMode === null) {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [darkMode, uiHasHydrated]);

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