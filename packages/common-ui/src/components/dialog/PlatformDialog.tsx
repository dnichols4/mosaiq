import React from 'react';
import { useDialog } from './DialogContext';

/**
 * Props for message dialog
 */
export interface MessageDialogProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'question';
  buttons?: string[];
  defaultButtonIndex?: number;
  onClose?: (buttonIndex: number) => void;
}

/**
 * Props for confirmation dialog
 */
export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'info' | 'warning' | 'error' | 'question';
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Props for prompt dialog
 */
export interface PromptDialogProps {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
}

/**
 * Function to show a message dialog
 * @param props Dialog properties
 */
export const showMessageDialog = async (props: MessageDialogProps): Promise<number> => {
  const { showMessageDialog } = useDialog();
  
  const result = await showMessageDialog({
    title: props.title,
    message: props.message,
    type: props.type,
    buttons: props.buttons,
    defaultButtonIndex: props.defaultButtonIndex,
    modal: true
  });
  
  if (props.onClose) {
    props.onClose(result);
  }
  
  return result;
};

/**
 * Function to show a confirmation dialog
 * @param props Dialog properties
 */
export const showConfirmDialog = async (props: ConfirmDialogProps): Promise<boolean> => {
  const { showConfirmDialog } = useDialog();
  
  const result = await showConfirmDialog({
    title: props.title,
    message: props.message,
    confirmLabel: props.confirmLabel,
    cancelLabel: props.cancelLabel,
    type: props.type,
    modal: true
  });
  
  if (result && props.onConfirm) {
    props.onConfirm();
  } else if (!result && props.onCancel) {
    props.onCancel();
  }
  
  return result;
};

/**
 * Function to show a prompt dialog
 * @param props Dialog properties
 */
export const showPromptDialog = async (props: PromptDialogProps): Promise<string | null> => {
  const { showPromptDialog } = useDialog();
  
  const result = await showPromptDialog({
    title: props.title,
    message: props.message,
    placeholder: props.placeholder,
    defaultValue: props.defaultValue,
    confirmLabel: props.confirmLabel,
    cancelLabel: props.cancelLabel,
    modal: true
  });
  
  if (result !== null && props.onSubmit) {
    props.onSubmit(result);
  } else if (result === null && props.onCancel) {
    props.onCancel();
  }
  
  return result;
};

/**
 * React component for message dialog
 */
export const MessageDialog: React.FC<MessageDialogProps> = (props) => {
  // This is just a wrapper around the function
  // No actual rendering happens here since the dialog is shown by the native platform
  React.useEffect(() => {
    showMessageDialog(props);
  }, []);
  
  return null;
};

/**
 * React component for confirmation dialog
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  // This is just a wrapper around the function
  // No actual rendering happens here since the dialog is shown by the native platform
  React.useEffect(() => {
    showConfirmDialog(props);
  }, []);
  
  return null;
};

/**
 * React component for prompt dialog
 */
export const PromptDialog: React.FC<PromptDialogProps> = (props) => {
  // This is just a wrapper around the function
  // No actual rendering happens here since the dialog is shown by the native platform
  React.useEffect(() => {
    showPromptDialog(props);
  }, []);
  
  return null;
};
