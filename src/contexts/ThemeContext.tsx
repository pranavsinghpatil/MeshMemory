
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Derive theme from darkMode
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
    if (!uiHasHydrated) return;
    const root = window.document.documentElement;
    let shouldBeDark = false;
    if (darkMode === true) {
      shouldBeDark = true;
    } else if (darkMode === false) {
      shouldBeDark = false;
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Listen for system theme changes if theme is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (darkMode === null) {
        const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(sysDark);
        if (sysDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [darkMode, uiHasHydrated]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

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