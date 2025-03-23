import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  saveUrl: (url: string) => ipcRenderer.invoke('save-url', url),
  getAllUrls: () => ipcRenderer.invoke('get-all-urls'),
  getUrlContent: (id: string) => ipcRenderer.invoke('get-url-content', id),
  getReadingSettings: () => ipcRenderer.invoke('get-reading-settings'),
  updateReadingSettings: (settings: any) => ipcRenderer.invoke('update-reading-settings', settings),
  deleteUrl: (id: string) => ipcRenderer.invoke('delete-url', id)
});
