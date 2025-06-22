import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '../store/useStore';

type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode, setDarkMode, uiHasHydrated } = useAppStore();
  const [isDark, setIsDark] = React.useState(false);

  // Define MeshMemory color palettes
  const darkColors: ThemeColors = {
    primary: '#333446',
    secondary: '#7F8CAA',
    accent: '#B8CFCE',
    text: '#EAEFEF'
  };

  const lightColors: ThemeColors = {
    primary: '#E7EFC7',
    secondary: '#AEC8A4',
    accent: '#8A784E',
    text: '#3B3B1A'
  };

  // Derive theme from darkMode
  const theme: Theme = darkMode === true ? 'dark' : darkMode === false ? 'light' : 'system';

  // Get current color palette based on isDark
  const colors = isDark ? darkColors : lightColors;

  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      setDarkMode(true);
    } else if (newTheme === 'light') {
      setDarkMode(false);
    } else {
      setDarkMode(null);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
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
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme, colors }}>
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