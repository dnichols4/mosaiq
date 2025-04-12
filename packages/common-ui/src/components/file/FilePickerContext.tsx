import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Interface for the FilePickerContext
 */
export interface FilePickerContextType {
  /**
   * Open a file picker dialog to select a single file
   * @param options Options for the file picker
   * @returns Promise resolving to the selected file path, or null if canceled
   */
  openFilePicker: (options: any) => Promise<string | null>;
  
  /**
   * Open a file picker dialog to select multiple files
   * @param options Options for the file picker
   * @returns Promise resolving to an array of selected file paths, or empty array if canceled
   */
  openMultipleFilePicker: (options: any) => Promise<string[]>;
  
  /**
   * Open a directory picker dialog
   * @param options Options for the directory picker
   * @returns Promise resolving to the selected directory path, or null if canceled
   */
  openDirectoryPicker: (options: any) => Promise<string | null>;
  
  /**
   * Open a save file dialog
   * @param options Options for the save dialog
   * @returns Promise resolving to the selected save path, or null if canceled
   */
  saveFilePicker: (options: any) => Promise<string | null>;
}

// Create the context with a default undefined value
const FilePickerContext = createContext<FilePickerContextType | undefined>(undefined);

/**
 * Props for the FilePickerProvider component
 */
export interface FilePickerProviderProps {
  /**
   * The file picker service implementation
   */
  service: FilePickerContextType;
  
  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * Component for providing file picker functionality to the application
 */
export const FilePickerProvider: React.FC<FilePickerProviderProps> = ({ service, children }) => {
  return (
    <FilePickerContext.Provider value={service}>
      {children}
    </FilePickerContext.Provider>
  );
};

/**
 * Hook for using the file picker context
 * @returns The file picker context
 * @throws Error if used outside of a FilePickerProvider
 */
export const useFilePicker = (): FilePickerContextType => {
  const context = useContext(FilePickerContext);
  
  if (context === undefined) {
    throw new Error('useFilePicker must be used within a FilePickerProvider');
  }
  
  return context;
};
