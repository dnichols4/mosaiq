"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronFilePickerService = void 0;
/**
 * Implementation of FilePickerContextType for Electron
 * This service bridges between the React components and the Electron IPC interface
 */
class ElectronFilePickerService {
    /**
     * Open a file picker dialog to select a single file
     * @param options Options for the file picker
     * @returns Promise resolving to the selected file path, or null if canceled
     */
    async openFilePicker(options) {
        return window.electronAPI.openFilePicker(options);
    }
    /**
     * Open a file picker dialog to select multiple files
     * @param options Options for the file picker
     * @returns Promise resolving to an array of selected file paths, or empty array if canceled
     */
    async openMultipleFilePicker(options) {
        return window.electronAPI.openMultipleFilePicker(options);
    }
    /**
     * Open a directory picker dialog
     * @param options Options for the directory picker
     * @returns Promise resolving to the selected directory path, or null if canceled
     */
    async openDirectoryPicker(options) {
        return window.electronAPI.openDirectoryPicker(options);
    }
    /**
     * Open a save file dialog
     * @param options Options for the save dialog
     * @returns Promise resolving to the selected save path, or null if canceled
     */
    async saveFilePicker(options) {
        return window.electronAPI.saveFilePicker(options);
    }
}
exports.ElectronFilePickerService = ElectronFilePickerService;
//# sourceMappingURL=ElectronFilePickerService.js.map