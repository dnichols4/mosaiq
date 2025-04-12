/**
 * Interface for platform-specific file picker services
 */
export interface IFilePickerService {
  /**
   * Open a file picker dialog to select a single file
   * @param options Options for the file picker
   * @returns Promise resolving to the selected file path, or null if canceled
   */
  openFilePicker(options: FilePickerOptions): Promise<string | null>;
  
  /**
   * Open a file picker dialog to select multiple files
   * @param options Options for the file picker
   * @returns Promise resolving to an array of selected file paths, or empty array if canceled
   */
  openMultipleFilePicker(options: FilePickerOptions): Promise<string[]>;
  
  /**
   * Open a directory picker dialog
   * @param options Options for the directory picker
   * @returns Promise resolving to the selected directory path, or null if canceled
   */
  openDirectoryPicker(options: DirectoryPickerOptions): Promise<string | null>;
  
  /**
   * Open a save file dialog
   * @param options Options for the save dialog
   * @returns Promise resolving to the selected save path, or null if canceled
   */
  saveFilePicker(options: SaveFileOptions): Promise<string | null>;
}

/**
 * Options for a file picker dialog
 */
export interface FilePickerOptions {
  /**
   * The title of the dialog
   */
  title?: string;
  
  /**
   * The allowed file types
   * Format: { name: string, extensions: string[] }
   * Example: { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
   */
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  
  /**
   * The default directory to open
   */
  defaultPath?: string;
  
  /**
   * Whether to allow selecting multiple files
   * @default false
   */
  multiSelections?: boolean;
}

/**
 * Options for a directory picker dialog
 */
export interface DirectoryPickerOptions {
  /**
   * The title of the dialog
   */
  title?: string;
  
  /**
   * The default directory to open
   */
  defaultPath?: string;
}

/**
 * Options for a save file dialog
 */
export interface SaveFileOptions {
  /**
   * The title of the dialog
   */
  title?: string;
  
  /**
   * The allowed file types
   * Format: { name: string, extensions: string[] }
   * Example: { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
   */
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  
  /**
   * The default directory to open
   */
  defaultPath?: string;
  
  /**
   * The default name of the file
   */
  defaultName?: string;
  
  /**
   * Whether to show a warning if the file exists
   * @default true
   */
  showOverwriteConfirmation?: boolean;
}
