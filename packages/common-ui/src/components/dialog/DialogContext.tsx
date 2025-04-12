import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Interface for the DialogContext
 */
export interface DialogContextType {
  /**
   * Show a message dialog
   * @param options Options for the dialog
   * @returns Promise resolving to the button index that was clicked
   */
  showMessageDialog: (options: any) => Promise<number>;
  
  /**
   * Show a confirmation dialog
   * @param options Options for the dialog
   * @returns Promise resolving to true if confirmed, false otherwise
   */
  showConfirmDialog: (options: any) => Promise<boolean>;
  
  /**
   * Show a prompt dialog
   * @param options Options for the dialog
   * @returns Promise resolving to the entered value, or null if canceled
   */
  showPromptDialog: (options: any) => Promise<string | null>;
}

// Create the context with a default undefined value
const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Props for the DialogProvider component
 */
export interface DialogProviderProps {
  /**
   * The dialog service implementation
   */
  service: DialogContextType;
  
  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * Component for providing dialog functionality to the application
 */
export const DialogProvider: React.FC<DialogProviderProps> = ({ service, children }) => {
  return (
    <DialogContext.Provider value={service}>
      {children}
    </DialogContext.Provider>
  );
};

/**
 * Hook for using the dialog context
 * @returns The dialog context
 * @throws Error if used outside of a DialogProvider
 */
export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  
  return context;
};
