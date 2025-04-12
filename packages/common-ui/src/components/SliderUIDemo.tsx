import React, { useState } from 'react';
import { ReadingSettingsPanel, ReadingSettings } from './ReadingSettingsPanel';

/**
 * Demo component to showcase the updated Reading Settings Sliders
 */
export const SliderUIDemo: React.FC = () => {
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: '18px',
    lineHeight: '1.6',
    theme: 'light',
    width: '800px',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  });
  
  const handleSettingsChange = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: 'var(--app-bg, #f7f7f7)',
      color: 'var(--app-text, #333333)'
    }}>
      <h1>Reading Settings Slider Demo</h1>
      
      <div style={{ 
        backgroundColor: 'var(--card-bg, #ffffff)', 
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <ReadingSettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
      
      <div style={{ 
        marginTop: '32px',
        backgroundColor: 'var(--card-bg, #ffffff)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h2>Preview</h2>
        <div style={{ 
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          fontFamily: settings.fontFamily,
          maxWidth: settings.width === '100%' ? '100%' : settings.width,
          margin: '0 auto'
        }}>
          <h3>Current Settings</h3>
          <ul>
            <li><strong>Font Size:</strong> {settings.fontSize}</li>
            <li><strong>Line Height:</strong> {settings.lineHeight}</li>
            <li><strong>Content Width:</strong> {settings.width}</li>
            <li><strong>Font Family:</strong> {settings.fontFamily.split(',')[0]}</li>
          </ul>
          
          <p>
            This is a sample paragraph that demonstrates how the text will appear with the
            current reading settings. The sliders above allow you to adjust the font size,
            line height, and content width to your preference.
          </p>
          
          <p>
            The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </div>
  );
};
