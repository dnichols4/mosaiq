import { ipcMain } from 'electron';
import { ContentService, SettingsService, TaxonomyService } from '@mosaiq/core';
import { AdapterFactory } from './adapters/AdapterFactory';
import { ElectronContentProcessor, ClassificationProgressEvent } from './adapters/ElectronContentProcessor';
import { BrowserWindow } from 'electron';

/**
 * Register IPC handlers for communication between main and renderer processes
 */
export async function registerIpcHandlers(mainWindow: BrowserWindow) {
  // Create services with adapters
  const contentProcessor = await AdapterFactory.createContentProcessor(true);
  
  // Type assertion to get access to additional methods
  const processorWithEvents = contentProcessor as unknown as ElectronContentProcessor;
  
  const contentService = new ContentService(
    contentProcessor,
    AdapterFactory.createMetadataStorage(),
    AdapterFactory.createContentStorage(),
    true // Enable automatic classification by default
  );
  
  // Forward classification progress events from content processor to renderer
  processorWithEvents.on('classification-progress', (event: ClassificationProgressEvent) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('classification-processor-progress', event);
    }
  });
  
  // Forward classification progress events from content service to renderer
  contentService.on('classification-progress', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('classification-service-progress', event);
    }
  });
  
  const settingsService = new SettingsService(
    AdapterFactory.createSettingsStorage()
  );
  
  // Initialize taxonomy service
  const taxonomyService = await AdapterFactory.createTaxonomyService();
  
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
  
  // Classification-related handlers
  ipcMain.handle('update-concepts', async (_, id: string, concepts: any[]) => {
    try {
      return await contentService.updateConcepts(id, concepts);
    } catch (error) {
      console.error(`Error updating concepts for item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('classify-content', async (_, title: string, text: string, options?: any) => {
    try {
      return await contentProcessor.classifyContent(title, text, options);
    } catch (error) {
      console.error('Error classifying content:', error);
      throw error;
    }
  });
  
  ipcMain.handle('classify-content-item', async (_, id: string, options?: { force?: boolean }) => {
    try {
      return await contentService.classifyContentItem(id, options);
    } catch (error) {
      console.error(`Error classifying content item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('batch-reclassify', async (_, ids: string[], options?: { force?: boolean }) => {
    try {
      return await contentService.batchReclassify(ids, options);
    } catch (error) {
      console.error('Error batch reclassifying content items:', error);
      throw error;
    }
  });
  
  ipcMain.handle('cancel-classification', async (_, id: string) => {
    try {
      return contentService.cancelClassification(id);
    } catch (error) {
      console.error(`Error canceling classification for item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('get-classification-status', async (_, id: string) => {
    try {
      return contentService.getClassificationStatus(id);
    } catch (error) {
      console.error(`Error getting classification status for item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('is-classifying', async (_, id: string) => {
    try {
      return contentService.isClassifying(id);
    } catch (error) {
      console.error(`Error checking if item with ID ${id} is being classified:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('extract-metadata', async (_, id: string, options?: any) => {
    try {
      return await contentService.extractMetadata(id);
    } catch (error) {
      console.error(`Error extracting metadata for item with ID ${id}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('set-auto-classification', async (_, enabled: boolean) => {
    try {
      contentService.setAutoClassification(enabled);
      return enabled;
    } catch (error) {
      console.error(`Error setting auto-classification to ${enabled}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('is-auto-classification-enabled', async () => {
    try {
      return contentService.isAutoClassificationEnabled();
    } catch (error) {
      console.error('Error checking if auto-classification is enabled:', error);
      throw error;
    }
  });
  
  ipcMain.handle('is-classification-available', async () => {
    try {
      return processorWithEvents.isClassificationAvailable();
    } catch (error) {
      console.error('Error checking if classification is available:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-classification-service-status', async () => {
    try {
      return processorWithEvents.getClassificationStatus();
    } catch (error) {
      console.error('Error getting classification service status:', error);
      throw error;
    }
  });
  
  ipcMain.handle('initialize-classification', async (_, force: boolean = false) => {
    try {
      return await processorWithEvents.initializeClassification(force);
    } catch (error) {
      console.error('Error initializing classification:', error);
      throw error;
    }
  });
  
  // Taxonomy-related handlers
  ipcMain.handle('get-taxonomy-concepts', async () => {
    try {
      return taxonomyService.getAllConcepts();
    } catch (error) {
      console.error('Error getting taxonomy concepts:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-taxonomy-concept', async (_, conceptId: string) => {
    try {
      return taxonomyService.getConcept(conceptId);
    } catch (error) {
      console.error(`Error getting concept with ID ${conceptId}:`, error);
      throw error;
    }
  });
  
  ipcMain.handle('search-taxonomy-concepts', async (_, query: string) => {
    try {
      return taxonomyService.searchConcepts(query);
    } catch (error) {
      console.error(`Error searching taxonomy concepts for "${query}":`, error);
      throw error;
    }
  });
  
  ipcMain.handle('get-child-concepts', async (_, conceptId: string) => {
    try {
      return taxonomyService.getChildConcepts(conceptId);
    } catch (error) {
      console.error(`Error getting child concepts for "${conceptId}":`, error);
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
