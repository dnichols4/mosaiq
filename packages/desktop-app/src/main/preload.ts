import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose protected methods that allow the renderer process to use
 * the ipcRenderer without exposing the entire object
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Content-related methods
  saveUrl: (url: string) => ipcRenderer.invoke('save-url', url),
  getAllItems: () => ipcRenderer.invoke('get-all-items'),
  getItemWithContent: (id: string) => ipcRenderer.invoke('get-item-with-content', id),
  deleteItem: (id: string) => ipcRenderer.invoke('delete-item', id),
  updateTags: (id: string, tags: string[]) => ipcRenderer.invoke('update-tags', id, tags),
  
  // Settings-related methods
  getReadingSettings: () => ipcRenderer.invoke('get-reading-settings'),
  updateReadingSettings: (settings: any) => ipcRenderer.invoke('update-reading-settings', settings),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  updateGeneralSettings: (settings: any) => ipcRenderer.invoke('update-general-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  
  // Platform capabilities
  getPlatformCapabilities: () => ipcRenderer.invoke('get-platform-capabilities')
});
