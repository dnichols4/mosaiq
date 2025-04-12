import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ReaderPage } from './pages/ReaderPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReadingSettings, DialogProvider, FilePickerProvider } from '@mosaiq/common-ui';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';
import { ThemeProvider } from './providers/ThemeProvider';
import { ElectronDialogService } from './services/ElectronDialogService';
import { ElectronFilePickerService } from './services/ElectronFilePickerService';
import './styles/main.css';

// Declare the electron API type
declare global {
  interface Window {
    electronAPI: {
      // Content-related methods
      saveUrl: (url: string) => Promise<any>;
      getAllItems: () => Promise<any[]>;
      getItemWithContent: (id: string) => Promise<any>;
      deleteItem: (id: string) => Promise<void>;
      updateTags: (id: string, tags: string[]) => Promise<any>;
      updateThumbnail: (id: string, imageUrl: string) => Promise<any>;
      
      // Settings-related methods
      getReadingSettings: () => Promise<ReadingSettings>;
      updateReadingSettings: (settings: Partial<ReadingSettings>) => Promise<ReadingSettings>;
      getAllSettings: () => Promise<any>;
      updateGeneralSettings: (settings: any) => Promise<any>;
      resetSettings: () => Promise<any>;
      
      // Platform capabilities
      getPlatformCapabilities: () => Promise<IPlatformCapabilities>;
      
      // Dialog-related methods
      showMessageDialog: (options: any) => Promise<number>;
      showConfirmDialog: (options: any) => Promise<boolean>;
      showPromptDialog: (options: any) => Promise<string | null>;
      
      // File picker methods
      openFilePicker: (options: any) => Promise<string | null>;
      openMultipleFilePicker: (options: any) => Promise<string[]>;
      openDirectoryPicker: (options: any) => Promise<string | null>;
      saveFilePicker: (options: any) => Promise<string | null>;
    };
  }
}

export const App: React.FC = () => {
  const [platformCapabilities, setPlatformCapabilities] = useState<IPlatformCapabilities | null>(null);
  const [initialTheme, setInitialTheme] = useState<string | null>(null);
  
  // Create instances of the platform-specific services
  const dialogService = new ElectronDialogService();
  const filePickerService = new ElectronFilePickerService();
  
  useEffect(() => {
    // Get platform capabilities and theme settings
    const fetchInitialData = async () => {
      try {
        // Load platform capabilities
        const capabilities = await window.electronAPI.getPlatformCapabilities();
        setPlatformCapabilities(capabilities);
        
        // Load theme settings
        const settings = await window.electronAPI.getReadingSettings();
        if (settings && settings.theme) {
          setInitialTheme(settings.theme);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);
  
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <DialogProvider service={dialogService}>
        <FilePickerProvider service={filePickerService}>
          <Router>
            <Routes>
            <Route path="/" element={<HomePage platformCapabilities={platformCapabilities} />} />
            <Route path="/reader/:id" element={<ReaderPage />} />
            <Route path="/settings" element={<SettingsPage platformCapabilities={platformCapabilities} />} />
            </Routes>
          </Router>
        </FilePickerProvider>
      </DialogProvider>
    </ThemeProvider>
  );
};
