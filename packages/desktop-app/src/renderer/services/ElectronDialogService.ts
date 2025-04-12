import { DialogContextType } from '@mosaiq/common-ui';

/**
 * Implementation of DialogContextType for Electron
 * This service bridges between the React components and the Electron IPC interface
 */
export class ElectronDialogService implements DialogContextType {
  /**
   * Show a message dialog
   * @param options Options for the dialog
   * @returns Promise resolving to the button index that was clicked
   */
  async showMessageDialog(options: any): Promise<number> {
    return window.electronAPI.showMessageDialog(options);
  }
  
  /**
   * Show a confirmation dialog
   * @param options Options for the dialog
   * @returns Promise resolving to true if confirmed, false otherwise
   */
  async showConfirmDialog(options: any): Promise<boolean> {
    return window.electronAPI.showConfirmDialog(options);
  }
  
  /**
   * Show a prompt dialog
   * @param options Options for the dialog
   * @returns Promise resolving to the entered value, or null if canceled
   */
  async showPromptDialog(options: any): Promise<string | null> {
    return window.electronAPI.showPromptDialog(options);
  }
}
