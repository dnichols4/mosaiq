import React from 'react';
import './ReadingSettingsPanel.styles.css';
import { SettingsSlider } from './SettingsSlider';

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
  { value: '14px', label: '1' },
  { value: '16px', label: '2' },
  { value: '18px', label: '3' },
  { value: '20px', label: '4' },
  { value: '24px', label: '5' }
];

// Line height options
const LINE_HEIGHTS = [
  { value: '1.4', label: '1' },
  { value: '1.6', label: '2' },
  { value: '1.8', label: '3' },
  { value: '2.0', label: '4' }
];

// Content width options
const CONTENT_WIDTHS = [
  { value: '600px', label: '1' },
  { value: '800px', label: '2' },
  { value: '1000px', label: '3' },
  { value: '100%', label: '4' }
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
      
      <div className="setting-group" style={{ marginBottom: '32px' }}>
        <SettingsSlider
          label="Font Size"
          options={FONT_SIZES}
          value={settings.fontSize}
          onChange={handleFontSizeChange}
        />
      </div>
      
      <div className="setting-group" style={{ marginBottom: '32px' }}>
        <SettingsSlider
          label="Line Height"
          options={LINE_HEIGHTS}
          value={settings.lineHeight}
          onChange={handleLineHeightChange}
        />
      </div>
      
      <div className="setting-group" style={{ marginBottom: '32px' }}>
        <SettingsSlider
          label="Content Width"
          options={CONTENT_WIDTHS}
          value={settings.width}
          onChange={handleWidthChange}
        />
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
