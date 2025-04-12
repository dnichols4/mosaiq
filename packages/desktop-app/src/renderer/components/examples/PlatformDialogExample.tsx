import React, { useState } from 'react';
import { useDialog, useFilePicker } from '@mosaiq/common-ui';

/**
 * Example component that demonstrates the platform dialog and file picker functionality
 */
export const PlatformDialogExample: React.FC = () => {
  const dialog = useDialog();
  const filePicker = useFilePicker();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [saveLocation, setSaveLocation] = useState<string | null>(null);
  const [dialogResult, setDialogResult] = useState<string>('');
  
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
  
  return (
    <div className="platform-dialog-example">
      <h2>Platform Dialog Examples</h2>
      
      <div className="dialog-section">
        <h3>Dialog Examples</h3>
        <div className="button-group">
          <button onClick={handleMessageDialog}>Show Message Dialog</button>
          <button onClick={handleConfirmDialog}>Show Confirm Dialog</button>
          <button onClick={handlePromptDialog}>Show Prompt Dialog</button>
        </div>
        <div className="result">{dialogResult}</div>
      </div>
      
      <div className="file-picker-section">
        <h3>File Picker Examples</h3>
        <div className="button-group">
          <button onClick={handleSelectFile}>Select File</button>
          <button onClick={handleSelectDirectory}>Select Directory</button>
          <button onClick={handleSaveFile}>Save File</button>
        </div>
        <div className="result">
          {selectedFile && <div>Selected file: {selectedFile}</div>}
          {selectedDirectory && <div>Selected directory: {selectedDirectory}</div>}
          {saveLocation && <div>Save location: {saveLocation}</div>}
        </div>
      </div>
      
      <style>{`
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
      `}</style>
    </div>
  );
};
