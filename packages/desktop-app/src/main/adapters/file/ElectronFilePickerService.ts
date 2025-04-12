import { dialog, BrowserWindow } from 'electron';
import path from 'path';

/**
 * Electron implementation of the file picker service
 */
export class ElectronFilePickerService {
  /**
   * Open a file picker dialog to select a single file using Electron's dialog API
   * @param options Options for the file picker
   * @returns Promise resolving to the selected file path, or null if canceled
   */
  async openFilePicker(options: any): Promise<string | null> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    const result = await dialog.showOpenDialog(focusedWindow!, {
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
      properties: ['openFile'],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    
    return result.filePaths[0];
  }
  
  /**
   * Open a file picker dialog to select multiple files using Electron's dialog API
   * @param options Options for the file picker
   * @returns Promise resolving to an array of selected file paths, or empty array if canceled
   */
  async openMultipleFilePicker(options: any): Promise<string[]> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    const result = await dialog.showOpenDialog(focusedWindow!, {
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
      properties: ['openFile', 'multiSelections'],
    });
    
    if (result.canceled) {
      return [];
    }
    
    return result.filePaths;
  }
  
  /**
   * Open a directory picker dialog using Electron's dialog API
   * @param options Options for the directory picker
   * @returns Promise resolving to the selected directory path, or null if canceled
   */
  async openDirectoryPicker(options: any): Promise<string | null> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    const result = await dialog.showOpenDialog(focusedWindow!, {
      title: options.title,
      defaultPath: options.defaultPath,
      properties: ['openDirectory'],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    
    return result.filePaths[0];
  }
  
  /**
   * Open a save file dialog using Electron's dialog API
   * @param options Options for the save dialog
   * @returns Promise resolving to the selected save path, or null if canceled
   */
  async saveFilePicker(options: any): Promise<string | null> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    let defaultPath = options.defaultPath;
    
    // If defaultName is provided, append it to the defaultPath
    if (options.defaultName && defaultPath) {
      defaultPath = path.join(defaultPath, options.defaultName);
    } else if (options.defaultName) {
      defaultPath = options.defaultName;
    }
    
    const result = await dialog.showSaveDialog(focusedWindow!, {
      title: options.title,
      defaultPath: defaultPath,
      filters: options.filters,
      properties: options.showOverwriteConfirmation === false ? [] : ['showOverwriteConfirmation'],
    });
    
    if (result.canceled || !result.filePath) {
      return null;
    }
    
    return result.filePath;
  }
}
