import { DialogContextType } from '@mosaiq/common-ui';
/**
 * Implementation of DialogContextType for Electron
 * This service bridges between the React components and the Electron IPC interface
 */
export declare class ElectronDialogService implements DialogContextType {
    /**
     * Show a message dialog
     * @param options Options for the dialog
     * @returns Promise resolving to the button index that was clicked
     */
    showMessageDialog(options: any): Promise<number>;
    /**
     * Show a confirmation dialog
     * @param options Options for the dialog
     * @returns Promise resolving to true if confirmed, false otherwise
     */
    showConfirmDialog(options: any): Promise<boolean>;
    /**
     * Show a prompt dialog
     * @param options Options for the dialog
     * @returns Promise resolving to the entered value, or null if canceled
     */
    showPromptDialog(options: any): Promise<string | null>;
}
//# sourceMappingURL=ElectronDialogService.d.ts.map