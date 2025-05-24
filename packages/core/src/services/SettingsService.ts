import { IStorageProvider } from '@mosaiq/platform-abstractions';

/**
 * Reading view settings
 */
export interface ReadingSettings {
  fontSize: string;
  lineHeight: string;
  theme: 'light' | 'dark' | 'sepia';
  width: string;
  fontFamily: string;
}

/**
 * Default reading settings
 */
const DEFAULT_READING_SETTINGS: ReadingSettings = {
  fontSize: '18px',
  lineHeight: '1.6',
  theme: 'light',
  width: '800px',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

/**
 * Application settings
 */
export interface AppSettings {
  reading: ReadingSettings;
  general: {
    defaultView: 'list' | 'grid' | 'graph';
    enableAI: boolean;
    syncEnabled: boolean;
  };
}

/**
 * Default application settings
 */
const DEFAULT_APP_SETTINGS: AppSettings = {
  reading: DEFAULT_READING_SETTINGS,
  general: {
    defaultView: 'list',
    enableAI: false,
    syncEnabled: false
  }
};

/**
 * Service responsible for managing application settings
 */
export class SettingsService {
  private settingsStorage: IStorageProvider;
  private readonly SETTINGS_KEY = 'appSettings';
  
  constructor(settingsStorage: IStorageProvider) {
    this.settingsStorage = settingsStorage;
  }
  
  /**
   * Get all application settings
   * @returns The application settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await this.settingsStorage.getItem<AppSettings>(this.SETTINGS_KEY);
      // If no settings are found, return default settings
      if (!settings) {
        return DEFAULT_APP_SETTINGS;
      }
      
      // Merge with defaults to ensure all properties exist
      return {
        reading: {
          ...DEFAULT_READING_SETTINGS,
          ...settings.reading
        },
        general: {
          ...DEFAULT_APP_SETTINGS.general,
          ...settings.general
        }
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_APP_SETTINGS;
    }
  }
  
  /**
   * Get reading settings
   * @returns The reading settings
   */
  async getReadingSettings(): Promise<ReadingSettings> {
    const settings = await this.getSettings();
    return settings.reading;
  }
  
  /**
   * Update reading settings
   * @param newSettings The new reading settings
   * @returns The updated reading settings
   */
  async updateReadingSettings(newSettings: Partial<ReadingSettings>): Promise<ReadingSettings> {
    try {
      const settings = await this.getSettings();
      
      // Update reading settings
      const updatedReadingSettings = {
        ...settings.reading,
        ...newSettings
      };
      
      // Save updated settings
      await this.settingsStorage.setItem(this.SETTINGS_KEY, {
        ...settings,
        reading: updatedReadingSettings
      });
      
      return updatedReadingSettings;
    } catch (error) {
      console.error('Error updating reading settings:', error);
      throw error;
    }
  }
  
  /**
   * Update general settings
   * @param newSettings The new general settings
   * @returns The updated general settings
   */
  async updateGeneralSettings(newSettings: Partial<AppSettings['general']>): Promise<AppSettings['general']> {
    try {
      const settings = await this.getSettings();
      
      // Update general settings
      const updatedGeneralSettings = {
        ...settings.general,
        ...newSettings
      };
      
      // Save updated settings
      await this.settingsStorage.setItem(this.SETTINGS_KEY, {
        ...settings,
        general: updatedGeneralSettings
      });
      
      return updatedGeneralSettings;
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  }
  
  /**
   * Reset all settings to defaults
   * @returns The default settings
   */
  async resetSettings(): Promise<AppSettings> {
    try {
      await this.settingsStorage.setItem(this.SETTINGS_KEY, DEFAULT_APP_SETTINGS);
      return DEFAULT_APP_SETTINGS;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}
