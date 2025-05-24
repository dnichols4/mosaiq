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
  updateThumbnail: (id: string, imageUrl: string) => ipcRenderer.invoke('update-thumbnail', id, imageUrl),
  
  // Classification-related methods
  updateConcepts: (id: string, concepts: any[]) => ipcRenderer.invoke('update-concepts', id, concepts),
  classifyContent: (title: string, text: string, options?: any) => ipcRenderer.invoke('classify-content', title, text, options),
  classifyContentItem: (id: string, options?: { force?: boolean }) => ipcRenderer.invoke('classify-content-item', id, options),
  batchReclassify: (ids: string[], options?: { force?: boolean }) => ipcRenderer.invoke('batch-reclassify', ids, options),
  cancelClassification: (id: string) => ipcRenderer.invoke('cancel-classification', id),
  getClassificationStatus: (id: string) => ipcRenderer.invoke('get-classification-status', id),
  isClassifying: (id: string) => ipcRenderer.invoke('is-classifying', id),
  extractMetadata: (id: string, options?: any) => ipcRenderer.invoke('extract-metadata', id, options),
  setAutoClassification: (enabled: boolean) => ipcRenderer.invoke('set-auto-classification', enabled),
  isAutoClassificationEnabled: () => ipcRenderer.invoke('is-auto-classification-enabled'),
  isClassificationAvailable: () => ipcRenderer.invoke('is-classification-available'),
  getClassificationServiceStatus: () => ipcRenderer.invoke('get-classification-service-status'),
  initializeClassification: (force?: boolean) => ipcRenderer.invoke('initialize-classification', force),
  
  // Event listeners
  onClassificationProcessorProgress: (callback: (event: any) => void) => {
    ipcRenderer.on('classification-processor-progress', (_event, data) => callback(data));
    return () => {
      ipcRenderer.removeAllListeners('classification-processor-progress');
    };
  },
  onClassificationServiceProgress: (callback: (event: any) => void) => {
    ipcRenderer.on('classification-service-progress', (_event, data) => callback(data));
    return () => {
      ipcRenderer.removeAllListeners('classification-service-progress');
    };
  },
  
  // Taxonomy-related methods
  getTaxonomyConcepts: () => ipcRenderer.invoke('get-taxonomy-concepts'),
  getTaxonomyConcept: (conceptId: string) => ipcRenderer.invoke('get-taxonomy-concept', conceptId),
  searchTaxonomyConcepts: (query: string) => ipcRenderer.invoke('search-taxonomy-concepts', query),
  getChildConcepts: (conceptId: string) => ipcRenderer.invoke('get-child-concepts', conceptId),
  
  // Settings-related methods
  getReadingSettings: () => ipcRenderer.invoke('get-reading-settings'),
  updateReadingSettings: (settings: any) => ipcRenderer.invoke('update-reading-settings', settings),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  updateGeneralSettings: (settings: any) => ipcRenderer.invoke('update-general-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  
  // Platform capabilities
  getPlatformCapabilities: () => ipcRenderer.invoke('get-platform-capabilities'),
  
  // Dialog-related methods
  showMessageDialog: (options: any) => ipcRenderer.invoke('show-message-dialog', options),
  showConfirmDialog: (options: any) => ipcRenderer.invoke('show-confirm-dialog', options),
  showPromptDialog: (options: any) => ipcRenderer.invoke('show-prompt-dialog', options),
  
  // File picker methods
  openFilePicker: (options: any) => ipcRenderer.invoke('open-file-picker', options),
  openMultipleFilePicker: (options: any) => ipcRenderer.invoke('open-multiple-file-picker', options),
  openDirectoryPicker: (options: any) => ipcRenderer.invoke('open-directory-picker', options),
  saveFilePicker: (options: any) => ipcRenderer.invoke('save-file-picker', options)
});
