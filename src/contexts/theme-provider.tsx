
'use client';

import type { Dispatch, SetStateAction} from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // effectiveTheme might not be needed if consumers always check theme and system preference themselves
  // For simplicity, components can derive this or the provider can just set the class
}

const initialState: Omit<ThemeProviderState, 'setTheme'> & { setTheme: Dispatch<SetStateAction<Theme>> | (() => void) } = {
  theme: 'system',
  setTheme: () => null,
};


const ThemeProviderContext = createContext<ThemeProviderState>(initialState as ThemeProviderState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'cinecollection-ui-theme', // Changed key to be more specific
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    try {
      const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
      return storedTheme || defaultTheme;
    } catch (e) {
      // console.error('Error reading theme from localStorage', e);
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (e) {
      // console.error('Error saving theme to localStorage', e);
    }
  }, [theme, storageKey]);

  // Listener for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') { // Only update if current theme is 'system'
        const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]); // Rerun if theme changes to/from 'system'

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
