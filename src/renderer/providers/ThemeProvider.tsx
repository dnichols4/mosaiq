import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSettingsStore } from '../store/settingsStore';

// Create the theme context
interface ThemeContextType {
  theme: 'light' | 'dark' | 'sepia';
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { readingSettings, updateSettings } = useSettingsStore();
  const [theme, setThemeState] = useState<'light' | 'dark' | 'sepia'>(readingSettings.theme || 'light');

  // Apply the theme to the body element when it changes
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('light-theme', 'dark-theme', 'sepia-theme');
    
    // Add the appropriate theme class
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'sepia') {
      document.body.classList.add('sepia-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [theme]);

  // Keep theme state in sync with settings store
  useEffect(() => {
    if (readingSettings.theme && readingSettings.theme !== theme) {
      setThemeState(readingSettings.theme);
    }
  }, [readingSettings.theme, theme]);

  // Set theme and update settings
  const setTheme = async (newTheme: 'light' | 'dark' | 'sepia') => {
    setThemeState(newTheme);
    await updateSettings({ theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for consuming theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
