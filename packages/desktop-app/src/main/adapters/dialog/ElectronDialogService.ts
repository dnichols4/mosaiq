import { dialog, BrowserWindow } from 'electron';

/**
 * Electron implementation of the dialog service
 */
export class ElectronDialogService {
  /**
   * Show a message dialog using Electron's dialog API
   * @param options Options for the dialog
   * @returns Promise resolving to the button index that was clicked
   */
  async showMessageDialog(options: any): Promise<number> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    const result = await dialog.showMessageBox(focusedWindow!, {
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      buttons: options.buttons || ['OK'],
      defaultId: options.defaultButtonIndex || 0,
      cancelId: options.buttons ? options.buttons.length - 1 : 0,
      // modal option is not available in Electron's MessageBoxOptions
      // but we handle it by showing the dialog on the focused window
    });
    
    return result.response;
  }
  
  /**
   * Show a confirmation dialog using Electron's dialog API
   * @param options Options for the dialog
   * @returns Promise resolving to true if confirmed, false otherwise
   */
  async showConfirmDialog(options: any): Promise<boolean> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    const result = await dialog.showMessageBox(focusedWindow!, {
      title: options.title,
      message: options.message,
      type: options.type || 'question',
      buttons: [options.confirmLabel || 'OK', options.cancelLabel || 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      // modal option is not available in Electron's MessageBoxOptions
      // but we handle it by showing the dialog on the focused window
    });
    
    return result.response === 0;
  }
  
  /**
   * Show a prompt dialog using Electron's dialog API
   * Note: Electron doesn't have a built-in prompt dialog, so we implement it using HTML
   * and BrowserWindow. In a real implementation, you'd create a custom prompt window.
   * For simplicity, we'll use a basic implementation here.
   * @param options Options for the dialog
   * @returns Promise resolving to the entered value, or null if canceled
   */
  async showPromptDialog(options: any): Promise<string | null> {
    // For a fully-featured implementation, you would create a custom BrowserWindow
    // with an HTML form. This is a simplified version that uses a message dialog.
    // In a real application, replace this with a proper implementation.
    
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    const result = await dialog.showMessageBox(focusedWindow!, {
      title: options.title,
      message: `${options.message}\n\nNote: In a real implementation, this would be a proper prompt dialog.`,
      type: 'info',
      buttons: [options.confirmLabel || 'OK', options.cancelLabel || 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      // modal option is not available in Electron's MessageBoxOptions
      // but we handle it by showing the dialog on the focused window
    });
    
    if (result.response === 0) {
      // In a real implementation, this would return the value entered by the user
      return options.defaultValue || '';
    }
    
    return null;
  }
}
