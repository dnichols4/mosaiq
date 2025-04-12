/**
 * Interface for platform-specific dialog services
 */
export interface IDialogService {
  /**
   * Show a message dialog
   * @param options Options for the dialog
   * @returns Promise resolving to the button index that was clicked
   */
  showMessageDialog(options: MessageDialogOptions): Promise<number>;
  
  /**
   * Show a confirmation dialog
   * @param options Options for the dialog
   * @returns Promise resolving to true if confirmed, false otherwise
   */
  showConfirmDialog(options: ConfirmDialogOptions): Promise<boolean>;
  
  /**
   * Show a prompt dialog
   * @param options Options for the dialog
   * @returns Promise resolving to the entered value, or null if canceled
   */
  showPromptDialog(options: PromptDialogOptions): Promise<string | null>;
}

/**
 * Options for a message dialog
 */
export interface MessageDialogOptions {
  /**
   * The title of the dialog
   */
  title: string;
  
  /**
   * The message to display
   */
  message: string;
  
  /**
   * The type of dialog
   */
  type?: 'info' | 'warning' | 'error' | 'question';
  
  /**
   * The button labels to display
   * If not provided, a single "OK" button will be shown
   */
  buttons?: string[];
  
  /**
   * The index of the default button
   * @default 0
   */
  defaultButtonIndex?: number;
  
  /**
   * Whether the dialog is modal
   * @default true
   */
  modal?: boolean;
}

/**
 * Options for a confirmation dialog
 */
export interface ConfirmDialogOptions {
  /**
   * The title of the dialog
   */
  title: string;
  
  /**
   * The message to display
   */
  message: string;
  
  /**
   * The label for the confirm button
   * @default "OK"
   */
  confirmLabel?: string;
  
  /**
   * The label for the cancel button
   * @default "Cancel"
   */
  cancelLabel?: string;
  
  /**
   * Whether the dialog is modal
   * @default true
   */
  modal?: boolean;
  
  /**
   * The type of confirmation dialog
   */
  type?: 'info' | 'warning' | 'error' | 'question';
}

/**
 * Options for a prompt dialog
 */
export interface PromptDialogOptions {
  /**
   * The title of the dialog
   */
  title: string;
  
  /**
   * The message to display
   */
  message: string;
  
  /**
   * The placeholder text for the input field
   */
  placeholder?: string;
  
  /**
   * The default value for the input field
   */
  defaultValue?: string;
  
  /**
   * The label for the confirm button
   * @default "OK"
   */
  confirmLabel?: string;
  
  /**
   * The label for the cancel button
   * @default "Cancel"
   */
  cancelLabel?: string;
  
  /**
   * Whether the dialog is modal
   * @default true
   */
  modal?: boolean;
}
