import { ipcMain } from 'electron';
import { ContentService, SettingsService } from '@mosaiq/core';
import { AdapterFactory } from './adapters/AdapterFactory';

/**
 * Register IPC handlers for communication between main and renderer processes
 */
export function registerIpcHandlers() {
  // Create services with adapters
  const contentService = new ContentService(
    AdapterFactory.createContentProcessor(),
    AdapterFactory.createMetadataStorage(),
    AdapterFactory.createContentStorage()
  );
  
  const settingsService = new SettingsService(
    AdapterFactory.createSettingsStorage()
  );
  
  // Content-related handlers
  ipcMain.handle('save-url', async (_, url: string) => {
    try {
      return await contentService.saveFromUrl(url);
    } catch (error) {
      console.error('Error saving URL:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-all-items', async () => {
    try {
      return await contentService.getAllItems();
    } catch (error) {
      console.error('Error getting all items:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-item-with-content', async (_, id: string) => {
    try {
      return await contentService.getItemWithContent(id);
    } catch (error) {
      console.error(`Error getting item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('delete-item', async (_, id: string) => {
    try {
      await contentService.deleteItem(id);
    } catch (error) {
      console.error(`Error deleting item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('update-tags', async (_, id: string, tags: string[]) => {
    try {
      return await contentService.updateTags(id, tags);
    } catch (error) {
      console.error(`Error updating tags for item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('update-thumbnail', async (_, id: string, imageUrl: string) => {
    try {
      return await contentService.updateThumbnail(id, imageUrl);
    } catch (error) {
      console.error(`Error updating thumbnail for item with ID ${id}:`, error);
      throw error;
    }
  });
  
  // Settings-related handlers
  ipcMain.handle('get-reading-settings', async () => {
    try {
      return await settingsService.getReadingSettings();
    } catch (error) {
      console.error('Error getting reading settings:', error);
      throw error;
    }
  });
  
  ipcMain.handle('update-reading-settings', async (_, settings: any) => {
    try {
      return await settingsService.updateReadingSettings(settings);
    } catch (error) {
      console.error('Error updating reading settings:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-all-settings', async () => {
    try {
      return await settingsService.getSettings();
    } catch (error) {
      console.error('Error getting all settings:', error);
      throw error;
    }
  });
  
  ipcMain.handle('update-general-settings', async (_, settings: any) => {
    try {
      return await settingsService.updateGeneralSettings(settings);
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  });
  
  ipcMain.handle('reset-settings', async () => {
    try {
      return await settingsService.resetSettings();
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  });
  
  // Platform capabilities handler
  ipcMain.handle('get-platform-capabilities', async () => {
    try {
      return AdapterFactory.createPlatformCapabilities();
    } catch (error) {
      console.error('Error getting platform capabilities:', error);
      throw error;
    }
  });
  
  // Dialog service handlers
  const dialogService = AdapterFactory.createDialogService();
  
  ipcMain.handle('show-message-dialog', async (_, options) => {
    try {
      return await dialogService.showMessageDialog(options);
    } catch (error) {
      console.error('Error showing message dialog:', error);
      throw error;
    }
  });
  
  ipcMain.handle('show-confirm-dialog', async (_, options) => {
    try {
      return await dialogService.showConfirmDialog(options);
    } catch (error) {
      console.error('Error showing confirm dialog:', error);
      throw error;
    }
  });
  
  ipcMain.handle('show-prompt-dialog', async (_, options) => {
    try {
      return await dialogService.showPromptDialog(options);
    } catch (error) {
      console.error('Error showing prompt dialog:', error);
      throw error;
    }
  });
  
  // File picker service handlers
  const filePickerService = AdapterFactory.createFilePickerService();
  
  ipcMain.handle('open-file-picker', async (_, options) => {
    try {
      return await filePickerService.openFilePicker(options);
    } catch (error) {
      console.error('Error opening file picker:', error);
      throw error;
    }
  });
  
  ipcMain.handle('open-multiple-file-picker', async (_, options) => {
    try {
      return await filePickerService.openMultipleFilePicker(options);
    } catch (error) {
      console.error('Error opening multiple file picker:', error);
      throw error;
    }
  });
  
  ipcMain.handle('open-directory-picker', async (_, options) => {
    try {
      return await filePickerService.openDirectoryPicker(options);
    } catch (error) {
      console.error('Error opening directory picker:', error);
      throw error;
    }
  });
  
  ipcMain.handle('save-file-picker', async (_, options) => {
    try {
      return await filePickerService.saveFilePicker(options);
    } catch (error) {
      console.error('Error opening save file picker:', error);
      throw error;
    }
  });
}
