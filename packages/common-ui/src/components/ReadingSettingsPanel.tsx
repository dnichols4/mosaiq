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

// Font size options
const FONT_SIZES = [
  { value: '14px', label: 'Small' },
  { value: '16px', label: 'Medium' },
  { value: '18px', label: 'Large' },
  { value: '20px', label: 'Extra Large' },
  { value: '24px', label: 'Huge' }
];

// Line height options
const LINE_HEIGHTS = [
  { value: '1.4', label: 'Compact' },
  { value: '1.6', label: 'Comfortable' },
  { value: '1.8', label: 'Spacious' },
  { value: '2.0', label: 'Very Spacious' }
];

// Content width options
const CONTENT_WIDTHS = [
  { value: '600px', label: 'Narrow' },
  { value: '800px', label: 'Medium' },
  { value: '1000px', label: 'Wide' },
  { value: '100%', label: 'Full' }
];

// Font family options
const FONT_FAMILIES = [
  { value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: 'System' },
  { value: "'Merriweather', serif", label: 'Serif' },
  { value: "'Open Sans', sans-serif", label: 'Sans-serif' },
  { value: "'JetBrains Mono', monospace", label: 'Monospace' }
];

/**
 * Component for adjusting reading view settings
 */
export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleFontSizeChange = (value: string) => {
    onSettingsChange({ fontSize: value });
  };
  
  const handleLineHeightChange = (value: string) => {
    onSettingsChange({ lineHeight: value });
  };
  
  const handleWidthChange = (value: string) => {
    onSettingsChange({ width: value });
  };
  
  const handleFontFamilyChange = (value: string) => {
    onSettingsChange({ fontFamily: value });
  };
  
  return (
    <div className="reading-settings-panel">
      <h3>Reading Settings</h3>
      
      <div className="setting-group">
        <label>Font Size</label>
        <div className="button-group">
          {FONT_SIZES.map((option) => (
            <button
              key={option.value}
              className={settings.fontSize === option.value ? 'active' : ''}
              onClick={() => handleFontSizeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="setting-group">
        <label>Line Height</label>
        <div className="button-group">
          {LINE_HEIGHTS.map((option) => (
            <button
              key={option.value}
              className={settings.lineHeight === option.value ? 'active' : ''}
              onClick={() => handleLineHeightChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="setting-group">
        <label>Content Width</label>
        <div className="button-group">
          {CONTENT_WIDTHS.map((option) => (
            <button
              key={option.value}
              className={settings.width === option.value ? 'active' : ''}
              onClick={() => handleWidthChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="setting-group">
        <label>Font</label>
        <div className="button-group">
          {FONT_FAMILIES.map((option) => (
            <button
              key={option.value}
              className={settings.fontFamily === option.value ? 'active' : ''}
              onClick={() => handleFontFamilyChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
