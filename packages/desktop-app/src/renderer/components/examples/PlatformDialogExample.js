"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformDialogExample = void 0;
const react_1 = __importStar(require("react"));
const common_ui_1 = require("@mosaiq/common-ui");
/**
 * Example component that demonstrates the platform dialog and file picker functionality
 */
const PlatformDialogExample = () => {
    const dialog = (0, common_ui_1.useDialog)();
    const filePicker = (0, common_ui_1.useFilePicker)();
    const [selectedFile, setSelectedFile] = (0, react_1.useState)(null);
    const [selectedDirectory, setSelectedDirectory] = (0, react_1.useState)(null);
    const [saveLocation, setSaveLocation] = (0, react_1.useState)(null);
    const [dialogResult, setDialogResult] = (0, react_1.useState)('');
    // Dialog examples
    const handleMessageDialog = async () => {
        const result = await dialog.showMessageDialog({
            title: 'Message Dialog Example',
            message: 'This is an example of a message dialog.',
            type: 'info',
            buttons: ['OK', 'Cancel', 'More Info'],
            defaultButtonIndex: 0
        });
        setDialogResult(`Message dialog result: Button index ${result} clicked`);
    };
    const handleConfirmDialog = async () => {
        const result = await dialog.showConfirmDialog({
            title: 'Confirm Dialog Example',
            message: 'Are you sure you want to proceed?',
            type: 'question',
            confirmLabel: 'Yes, proceed',
            cancelLabel: 'No, cancel'
        });
        setDialogResult(`Confirm dialog result: ${result ? 'Confirmed' : 'Canceled'}`);
    };
    const handlePromptDialog = async () => {
        const result = await dialog.showPromptDialog({
            title: 'Prompt Dialog Example',
            message: 'Please enter your name:',
            placeholder: 'Your name',
            defaultValue: '',
            confirmLabel: 'Submit',
            cancelLabel: 'Skip'
        });
        setDialogResult(`Prompt dialog result: ${result !== null ? `"${result}"` : 'Canceled'}`);
    };
    // File picker examples
    const handleSelectFile = async () => {
        const filePath = await filePicker.openFilePicker({
            title: 'Select a file',
            filters: [
                { name: 'Text Files', extensions: ['txt', 'md'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        setSelectedFile(filePath);
    };
    const handleSelectDirectory = async () => {
        const directoryPath = await filePicker.openDirectoryPicker({
            title: 'Select a directory'
        });
        setSelectedDirectory(directoryPath);
    };
    const handleSaveFile = async () => {
        const savePath = await filePicker.saveFilePicker({
            title: 'Save file as',
            defaultName: 'untitled.txt',
            filters: [
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        setSaveLocation(savePath);
    };
    return (react_1.default.createElement("div", { className: "platform-dialog-example" },
        react_1.default.createElement("h2", null, "Platform Dialog Examples"),
        react_1.default.createElement("div", { className: "dialog-section" },
            react_1.default.createElement("h3", null, "Dialog Examples"),
            react_1.default.createElement("div", { className: "button-group" },
                react_1.default.createElement("button", { onClick: handleMessageDialog }, "Show Message Dialog"),
                react_1.default.createElement("button", { onClick: handleConfirmDialog }, "Show Confirm Dialog"),
                react_1.default.createElement("button", { onClick: handlePromptDialog }, "Show Prompt Dialog")),
            react_1.default.createElement("div", { className: "result" }, dialogResult)),
        react_1.default.createElement("div", { className: "file-picker-section" },
            react_1.default.createElement("h3", null, "File Picker Examples"),
            react_1.default.createElement("div", { className: "button-group" },
                react_1.default.createElement("button", { onClick: handleSelectFile }, "Select File"),
                react_1.default.createElement("button", { onClick: handleSelectDirectory }, "Select Directory"),
                react_1.default.createElement("button", { onClick: handleSaveFile }, "Save File")),
            react_1.default.createElement("div", { className: "result" },
                selectedFile && react_1.default.createElement("div", null,
                    "Selected file: ",
                    selectedFile),
                selectedDirectory && react_1.default.createElement("div", null,
                    "Selected directory: ",
                    selectedDirectory),
                saveLocation && react_1.default.createElement("div", null,
                    "Save location: ",
                    saveLocation))),
        react_1.default.createElement("style", null, `
        .platform-dialog-example {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        h2 {
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .dialog-section, .file-picker-section {
          margin-bottom: 30px;
        }
        
        h3 {
          margin-bottom: 15px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        button {
          padding: 8px 16px;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:hover {
          background-color: #e5e5e5;
        }
        
        .result {
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          min-height: 60px;
        }
      `)));
};
exports.PlatformDialogExample = PlatformDialogExample;
//# sourceMappingURL=PlatformDialogExample.js.map