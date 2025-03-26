import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Create theme context
type ThemeType = 'light' | 'dark' | 'sepia';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme = null }) => {
  const [theme, setThemeState] = useState<ThemeType>(initialTheme as ThemeType || 'light');
  const [isInitialized, setIsInitialized] = useState(!!initialTheme);

  // Load theme settings from storage on mount if no initialTheme provided
  useEffect(() => {
    // Skip loading if initialTheme was provided
    if (initialTheme) return;
    
    const loadTheme = async () => {
      try {
        const settings = await window.electronAPI.getReadingSettings();
        if (settings && settings.theme) {
          setThemeState(settings.theme);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading theme settings:', error);
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, [initialTheme]);

  // Apply theme to document body
  useEffect(() => {
    if (!isInitialized) return;

    // Remove existing theme classes
    document.documentElement.classList.remove('light-theme', 'dark-theme', 'sepia-theme');
    
    // Add theme class to body
    document.documentElement.classList.add(`${theme}-theme`);
    
    // Store theme in localStorage for fast loading next time
    try {
      localStorage.setItem('mosaiq-theme', theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme, isInitialized]);

  // Update theme in settings and state
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await window.electronAPI.updateReadingSettings({ theme: newTheme });
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error updating theme settings:', error);
    }
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
