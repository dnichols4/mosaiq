import React from 'react';
import { useFilePicker } from './FilePickerContext';

/**
 * Base props for all file picker buttons
 */
interface BaseFilePickerProps {
  /**
   * Button text
   */
  buttonText: string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

/**
 * Props for the file picker button
 */
export interface FilePickerButtonProps extends BaseFilePickerProps {
  /**
   * Options for the file picker
   */
  options?: any;
  
  /**
   * Callback when a file is selected
   */
  onFileSelected: (filePath: string) => void;
  
  /**
   * Callback when the operation is canceled
   */
  onCancel?: () => void;
}

/**
 * Props for multiple file picker button
 */
export interface MultipleFilePickerButtonProps extends BaseFilePickerProps {
  /**
   * Options for the file picker
   */
  options?: any;
  
  /**
   * Callback when files are selected
   */
  onFilesSelected: (filePaths: string[]) => void;
  
  /**
   * Callback when the operation is canceled
   */
  onCancel?: () => void;
}

/**
 * Props for directory picker button
 */
export interface DirectoryPickerButtonProps extends BaseFilePickerProps {
  /**
   * Options for the directory picker
   */
  options?: any;
  
  /**
   * Callback when a directory is selected
   */
  onDirectorySelected: (directoryPath: string) => void;
  
  /**
   * Callback when the operation is canceled
   */
  onCancel?: () => void;
}

/**
 * Props for save file picker button
 */
export interface SaveFilePickerButtonProps extends BaseFilePickerProps {
  /**
   * Options for the save file picker
   */
  options?: any;
  
  /**
   * Callback when a save location is selected
   */
  onLocationSelected: (filePath: string) => void;
  
  /**
   * Callback when the operation is canceled
   */
  onCancel?: () => void;
}

/**
 * Button component for selecting a single file
 */
export const FilePickerButton: React.FC<FilePickerButtonProps> = ({
  buttonText,
  className,
  disabled,
  options,
  onFileSelected,
  onCancel
}) => {
  const { openFilePicker } = useFilePicker();
  
  const handleClick = async () => {
    try {
      const filePath = await openFilePicker(options || {});
      
      if (filePath) {
        onFileSelected(filePath);
      } else if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error opening file picker:', error);
    }
  };
  
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
};

/**
 * Button component for selecting multiple files
 */
export const MultipleFilePickerButton: React.FC<MultipleFilePickerButtonProps> = ({
  buttonText,
  className,
  disabled,
  options,
  onFilesSelected,
  onCancel
}) => {
  const { openMultipleFilePicker } = useFilePicker();
  
  const handleClick = async () => {
    try {
      const filePaths = await openMultipleFilePicker(options || {});
      
      if (filePaths.length > 0) {
        onFilesSelected(filePaths);
      } else if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error opening multiple file picker:', error);
    }
  };
  
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
};

/**
 * Button component for selecting a directory
 */
export const DirectoryPickerButton: React.FC<DirectoryPickerButtonProps> = ({
  buttonText,
  className,
  disabled,
  options,
  onDirectorySelected,
  onCancel
}) => {
  const { openDirectoryPicker } = useFilePicker();
  
  const handleClick = async () => {
    try {
      const directoryPath = await openDirectoryPicker(options || {});
      
      if (directoryPath) {
        onDirectorySelected(directoryPath);
      } else if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error opening directory picker:', error);
    }
  };
  
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
};

/**
 * Button component for selecting a save location
 */
export const SaveFilePickerButton: React.FC<SaveFilePickerButtonProps> = ({
  buttonText,
  className,
  disabled,
  options,
  onLocationSelected,
  onCancel
}) => {
  const { saveFilePicker } = useFilePicker();
  
  const handleClick = async () => {
    try {
      const filePath = await saveFilePicker(options || {});
      
      if (filePath) {
        onLocationSelected(filePath);
      } else if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error opening save file picker:', error);
    }
  };
  
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
};
