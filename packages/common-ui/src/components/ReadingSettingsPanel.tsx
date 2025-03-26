import React from 'react';
import './ReadingSettingsPanel.styles.css';

export interface ReadingSettings {
  fontSize: string;
  lineHeight: string;
  theme: 'light' | 'dark' | 'sepia';
  width: string;
  fontFamily: string;
}

export interface ReadingSettingsPanelProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: Partial<ReadingSettings>) => void;
}

/**
 * Component for adjusting reading view settings
 */
export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ fontSize: e.target.value });
  };
  
  const handleLineHeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ lineHeight: e.target.value });
  };
  
  const handleThemeChange = (theme: ReadingSettings['theme']) => {
    onSettingsChange({ theme });
  };
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ width: e.target.value });
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ fontFamily: e.target.value });
  };
  
  return (
    <div className="reading-settings-panel">
      <h3>Reading Settings</h3>
      
      <div className="setting-group">
        <label htmlFor="font-size">
          Font Size
        </label>
        <select
          id="font-size"
          value={settings.fontSize}
          onChange={handleFontSizeChange}
        >
          <option value="14px">Small</option>
          <option value="16px">Medium</option>
          <option value="18px">Large</option>
          <option value="20px">Extra Large</option>
          <option value="24px">Huge</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label htmlFor="line-height">
          Line Height
        </label>
        <select
          id="line-height"
          value={settings.lineHeight}
          onChange={handleLineHeightChange}
        >
          <option value="1.4">Compact</option>
          <option value="1.6">Comfortable</option>
          <option value="1.8">Spacious</option>
          <option value="2.0">Very Spacious</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>
          Theme
        </label>
        <div className="button-group">
          <button
            onClick={() => handleThemeChange('light')}
            className={settings.theme === 'light' ? 'active' : ''}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange('sepia')}
            className={settings.theme === 'sepia' ? 'active' : ''}
          >
            Sepia
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={settings.theme === 'dark' ? 'active' : ''}
          >
            Dark
          </button>
        </div>
      </div>
      
      <div className="setting-group">
        <label htmlFor="width">
          Content Width
        </label>
        <select
          id="width"
          value={settings.width}
          onChange={handleWidthChange}
        >
          <option value="600px">Narrow</option>
          <option value="800px">Medium</option>
          <option value="1000px">Wide</option>
          <option value="100%">Full</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label htmlFor="font-family">
          Font
        </label>
        <select
          id="font-family"
          value={settings.fontFamily}
          onChange={handleFontFamilyChange}
        >
          <option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
            System
          </option>
          <option value="'Merriweather', serif">Serif</option>
          <option value="'Open Sans', sans-serif">Sans-serif</option>
          <option value="'JetBrains Mono', monospace">Monospace</option>
        </select>
      </div>
    </div>
  );
};
