import { ipcMain } from 'electron';
import { saveUrl, getAllUrls, getUrlWithContent, getReadingSettings, updateReadingSettings, deleteUrl, ReadingSettings } from '../data/urlStorage';
import { fetchAndProcessUrl } from '../content/contentProcessor';

export function registerIpcHandlers() {
  // Handle URL saving
  ipcMain.handle('save-url', async (_, url: string) => {
    try {
      // First fetch and process the URL content
      const processedContent = await fetchAndProcessUrl(url);
      
      // Then save the URL and its processed content
      const savedUrl = await saveUrl({
        url,
        title: processedContent.title,
        excerpt: processedContent.excerpt,
        content: processedContent.content,
        dateAdded: new Date().toISOString()
      });
      
      return savedUrl;
    } catch (error) {
      console.error('Error saving URL:', error);
      throw error;
    }
  });

  // Handle getting all saved URLs
  ipcMain.handle('get-all-urls', async () => {
    try {
      const urls = await getAllUrls();
      return urls;
    } catch (error) {
      console.error('Error getting URLs:', error);
      throw error;
    }
  });
  
  // Handle getting a single URL with content
  ipcMain.handle('get-url-content', async (_, id: string) => {
    try {
      const urlWithContent = await getUrlWithContent(id);
      if (!urlWithContent) {
        throw new Error(`URL with ID ${id} not found`);
      }
      return urlWithContent;
    } catch (error) {
      console.error(`Error getting URL content for ID ${id}:`, error);
      throw error;
    }
  });
  
  // Handle getting reading settings
  ipcMain.handle('get-reading-settings', () => {
    try {
      return getReadingSettings();
    } catch (error) {
      console.error('Error getting reading settings:', error);
      throw error;
    }
  });
  
  // Handle updating reading settings
  ipcMain.handle('update-reading-settings', (_, settings: Partial<ReadingSettings>) => {
    try {
      return updateReadingSettings(settings);
    } catch (error) {
      console.error('Error updating reading settings:', error);
      throw error;
    }
  });
  
  // Handle URL deletion
  ipcMain.handle('delete-url', async (_, id: string) => {
    try {
      await deleteUrl(id);
    } catch (error) {
      console.error(`Error deleting URL with ID ${id}:`, error);
      throw error;
    }
  });
}
