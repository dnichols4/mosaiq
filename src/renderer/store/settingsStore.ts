import { create } from 'zustand';
import { ReadingSettings } from '../../data/urlStorage';

// Import shared types
import '../types/api';

interface SettingsState {
  readingSettings: ReadingSettings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<ReadingSettings>) => Promise<void>;
}

// Default settings (fallback if fetching fails)
const defaultSettings: ReadingSettings = {
  fontSize: '18px',
  lineHeight: '1.6',
  theme: 'light',
  width: '680px'
};

export const useSettingsStore = create<SettingsState>((set) => ({
  readingSettings: defaultSettings,
  loading: false,
  error: null,
  
  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const settings = await window.api.getReadingSettings();
      set({ readingSettings: settings, loading: false });
    } catch (error) {
      console.error('Error fetching reading settings:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        readingSettings: defaultSettings // Fallback to defaults
      });
    }
  },
  
  updateSettings: async (newSettings) => {
    try {
      set({ loading: true, error: null });
      const updatedSettings = await window.api.updateReadingSettings(newSettings);
      set({ readingSettings: updatedSettings, loading: false });
    } catch (error) {
      console.error('Error updating reading settings:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to update settings'
      });
    }
  }
}));
