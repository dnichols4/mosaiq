import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ReaderPage } from './pages/ReaderPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReadingSettings } from '@mosaiq/common-ui';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';

// Declare the electron API type
declare global {
  interface Window {
    electronAPI: {
      saveUrl: (url: string) => Promise<any>;
      getAllItems: () => Promise<any[]>;
      getItemWithContent: (id: string) => Promise<any>;
      deleteItem: (id: string) => Promise<void>;
      updateTags: (id: string, tags: string[]) => Promise<any>;
      
      getReadingSettings: () => Promise<ReadingSettings>;
      updateReadingSettings: (settings: Partial<ReadingSettings>) => Promise<ReadingSettings>;
      getAllSettings: () => Promise<any>;
      updateGeneralSettings: (settings: any) => Promise<any>;
      resetSettings: () => Promise<any>;
      
      getPlatformCapabilities: () => Promise<IPlatformCapabilities>;
    };
  }
}

export const App: React.FC = () => {
  const [platformCapabilities, setPlatformCapabilities] = useState<IPlatformCapabilities | null>(null);
  
  useEffect(() => {
    // Get platform capabilities
    const fetchPlatformCapabilities = async () => {
      try {
        const capabilities = await window.electronAPI.getPlatformCapabilities();
        setPlatformCapabilities(capabilities);
      } catch (error) {
        console.error('Error fetching platform capabilities:', error);
      }
    };
    
    fetchPlatformCapabilities();
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage platformCapabilities={platformCapabilities} />} />
        <Route path="/reader/:id" element={<ReaderPage />} />
        <Route path="/settings" element={<SettingsPage platformCapabilities={platformCapabilities} />} />
      </Routes>
    </Router>
  );
};
