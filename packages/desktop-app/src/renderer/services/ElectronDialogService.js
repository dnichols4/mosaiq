"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronDialogService = void 0;
/**
 * Implementation of DialogContextType for Electron
 * This service bridges between the React components and the Electron IPC interface
 */
class ElectronDialogService {
    /**
     * Show a message dialog
     * @param options Options for the dialog
     * @returns Promise resolving to the button index that was clicked
     */
    async showMessageDialog(options) {
        return window.electronAPI.showMessageDialog(options);
    }
    /**
     * Show a confirmation dialog
     * @param options Options for the dialog
     * @returns Promise resolving to true if confirmed, false otherwise
     */
    async showConfirmDialog(options) {
        return window.electronAPI.showConfirmDialog(options);
    }
    /**
     * Show a prompt dialog
     * @param options Options for the dialog
     * @returns Promise resolving to the entered value, or null if canceled
     */
    async showPromptDialog(options) {
        return window.electronAPI.showPromptDialog(options);
    }
}
exports.ElectronDialogService = ElectronDialogService;
//# sourceMappingURL=ElectronDialogService.js.map