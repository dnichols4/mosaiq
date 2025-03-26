import React from 'react';

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
    <div className="reading-settings-panel" style={{ padding: '16px' }}>
      <h3 style={{ marginTop: 0 }}>Reading Settings</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="font-size" style={{ display: 'block', marginBottom: '4px' }}>
          Font Size
        </label>
        <select
          id="font-size"
          value={settings.fontSize}
          onChange={handleFontSizeChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="14px">Small</option>
          <option value="16px">Medium</option>
          <option value="18px">Large</option>
          <option value="20px">Extra Large</option>
          <option value="24px">Huge</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="line-height" style={{ display: 'block', marginBottom: '4px' }}>
          Line Height
        </label>
        <select
          id="line-height"
          value={settings.lineHeight}
          onChange={handleLineHeightChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="1.4">Compact</option>
          <option value="1.6">Comfortable</option>
          <option value="1.8">Spacious</option>
          <option value="2.0">Very Spacious</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Theme
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleThemeChange('light')}
            style={{
              flex: 1,
              padding: '8px',
              background: settings.theme === 'light' ? '#e0e0e0' : '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange('sepia')}
            style={{
              flex: 1,
              padding: '8px',
              background: settings.theme === 'sepia' ? '#e0e0e0' : '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sepia
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            style={{
              flex: 1,
              padding: '8px',
              background: settings.theme === 'dark' ? '#e0e0e0' : '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Dark
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="width" style={{ display: 'block', marginBottom: '4px' }}>
          Content Width
        </label>
        <select
          id="width"
          value={settings.width}
          onChange={handleWidthChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="600px">Narrow</option>
          <option value="800px">Medium</option>
          <option value="1000px">Wide</option>
          <option value="100%">Full</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="font-family" style={{ display: 'block', marginBottom: '4px' }}>
          Font
        </label>
        <select
          id="font-family"
          value={settings.fontFamily}
          onChange={handleFontFamilyChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
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
