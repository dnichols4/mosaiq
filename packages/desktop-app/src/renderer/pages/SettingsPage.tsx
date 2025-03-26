import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReadingSettingsPanel, ReadingSettings } from '@mosaiq/common-ui';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';

interface SettingsPageProps {
  platformCapabilities: IPlatformCapabilities | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ platformCapabilities }) => {
  const navigate = useNavigate();
  
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    fontSize: '18px',
    lineHeight: '1.6',
    theme: 'light',
    width: '800px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });
  
  const [generalSettings, setGeneralSettings] = useState({
    defaultView: 'list',
    enableAI: false,
    syncEnabled: false
  });
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load reading settings
        const settings = await window.electronAPI.getReadingSettings();
        setReadingSettings(settings);
        
        // Load general settings
        const appSettings = await window.electronAPI.getAllSettings();
        if (appSettings && appSettings.general) {
          setGeneralSettings(appSettings.general);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle reading settings changes
  const handleReadingSettingsChange = async (settings: Partial<ReadingSettings>) => {
    try {
      const updatedSettings = await window.electronAPI.updateReadingSettings(settings);
      setReadingSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating reading settings:', error);
    }
  };
  
  // Handle view type change
  const handleDefaultViewChange = async (viewType: 'list' | 'grid' | 'graph') => {
    try {
      const updatedSettings = await window.electronAPI.updateGeneralSettings({
        ...generalSettings,
        defaultView: viewType
      });
      
      setGeneralSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating general settings:', error);
    }
  };
  
  // Handle AI toggle
  const handleAIToggle = async () => {
    try {
      const updatedSettings = await window.electronAPI.updateGeneralSettings({
        ...generalSettings,
        enableAI: !generalSettings.enableAI
      });
      
      setGeneralSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating AI settings:', error);
    }
  };
  
  // Handle sync toggle
  const handleSyncToggle = async () => {
    try {
      const updatedSettings = await window.electronAPI.updateGeneralSettings({
        ...generalSettings,
        syncEnabled: !generalSettings.syncEnabled
      });
      
      setGeneralSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating sync settings:', error);
    }
  };
  
  // Reset all settings
  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        const defaultSettings = await window.electronAPI.resetSettings();
        
        setReadingSettings(defaultSettings.reading);
        setGeneralSettings(defaultSettings.general);
      } catch (error) {
        console.error('Error resetting settings:', error);
      }
    }
  };
  
  // Go back to home page
  const goBack = () => {
    navigate('/');
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Settings</h1>
        <button onClick={goBack} style={{ padding: '8px 16px' }}>
          ← Back
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <section>
          <h2>Reading Settings</h2>
          <ReadingSettingsPanel
            settings={readingSettings}
            onSettingsChange={handleReadingSettingsChange}
          />
        </section>
        
        <section>
          <h2>General Settings</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Default View</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleDefaultViewChange('list')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: generalSettings.defaultView === 'list' ? '#e0e0e0' : '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                List
              </button>
              <button
                onClick={() => handleDefaultViewChange('grid')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: generalSettings.defaultView === 'grid' ? '#e0e0e0' : '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Grid
              </button>
              <button
                onClick={() => handleDefaultViewChange('graph')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: generalSettings.defaultView === 'graph' ? '#e0e0e0' : '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Graph
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={generalSettings.enableAI}
                onChange={handleAIToggle}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Enable AI features</span>
              {platformCapabilities && !platformCapabilities.hasLocalAIProcessing && (
                <span style={{ fontSize: '14px', color: '#666' }}>(Requires cloud processing)</span>
              )}
            </label>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={generalSettings.syncEnabled}
                onChange={handleSyncToggle}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Enable sync across devices</span>
              <span style={{ fontSize: '14px', color: '#666' }}>(Coming soon)</span>
            </label>
          </div>
        </section>
        
        {platformCapabilities && (
          <section>
            <h2>System Information</h2>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <p><strong>Platform:</strong> {platformCapabilities.type}</p>
              <p><strong>File System Access:</strong> {platformCapabilities.hasFileSystemAccess ? 'Yes' : 'No'}</p>
              <p><strong>Local AI Processing:</strong> {platformCapabilities.hasLocalAIProcessing ? 'Yes' : 'No'}</p>
              <p><strong>Native Notifications:</strong> {platformCapabilities.hasNativeNotifications ? 'Yes' : 'No'}</p>
            </div>
          </section>
        )}
        
        <section>
          <h2>Reset</h2>
          <button
            onClick={handleResetSettings}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset All Settings to Defaults
          </button>
        </section>
      </div>
    </div>
  );
};
