import { FilePickerContextType } from '@mosaiq/common-ui';
/**
 * Implementation of FilePickerContextType for Electron
 * This service bridges between the React components and the Electron IPC interface
 */
export declare class ElectronFilePickerService implements FilePickerContextType {
    /**
     * Open a file picker dialog to select a single file
     * @param options Options for the file picker
     * @returns Promise resolving to the selected file path, or null if canceled
     */
    openFilePicker(options: any): Promise<string | null>;
    /**
     * Open a file picker dialog to select multiple files
     * @param options Options for the file picker
     * @returns Promise resolving to an array of selected file paths, or empty array if canceled
     */
    openMultipleFilePicker(options: any): Promise<string[]>;
    /**
     * Open a directory picker dialog
     * @param options Options for the directory picker
     * @returns Promise resolving to the selected directory path, or null if canceled
     */
    openDirectoryPicker(options: any): Promise<string | null>;
    /**
     * Open a save file dialog
     * @param options Options for the save dialog
     * @returns Promise resolving to the selected save path, or null if canceled
     */
    saveFilePicker(options: any): Promise<string | null>;
}
//# sourceMappingURL=ElectronFilePickerService.d.ts.map