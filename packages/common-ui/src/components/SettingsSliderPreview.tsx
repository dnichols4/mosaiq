import React, { useState } from 'react';
import { SettingsSlider } from './SettingsSlider';
import './SettingsSlider.styles.css';

// Sample options for demonstration
const FONT_SIZES = [
  { value: '14px', label: 'Small' },
  { value: '16px', label: 'Medium' },
  { value: '18px', label: 'Large' },
  { value: '20px', label: 'Extra Large' },
  { value: '24px', label: 'Huge' }
];

const LINE_HEIGHTS = [
  { value: '1.4', label: 'Compact' },
  { value: '1.6', label: 'Comfortable' },
  { value: '1.8', label: 'Spacious' },
  { value: '2.0', label: 'Very Spacious' }
];

const CONTENT_WIDTHS = [
  { value: '600px', label: 'Narrow' },
  { value: '800px', label: 'Medium' },
  { value: '1000px', label: 'Wide' },
  { value: '100%', label: 'Full' }
];

/**
 * Preview component to demonstrate the SettingsSlider in isolation
 */
export const SettingsSliderPreview: React.FC = () => {
  // State for each setting
  const [fontSize, setFontSize] = useState('18px');
  const [lineHeight, setLineHeight] = useState('1.6');
  const [contentWidth, setContentWidth] = useState('800px');
  
  // Sample text for demonstration
  const sampleText = 'This is a sample text to demonstrate the reading settings.';
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Settings Slider Preview</h1>
      
      <div style={{ marginBottom: '32px' }}>
        <h2>Sliders</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <SettingsSlider
            label="Font Size"
            options={FONT_SIZES}
            value={fontSize}
            onChange={setFontSize}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <SettingsSlider
            label="Line Height"
            options={LINE_HEIGHTS}
            value={lineHeight}
            onChange={setLineHeight}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <SettingsSlider
            label="Content Width"
            options={CONTENT_WIDTHS}
            value={contentWidth}
            onChange={setContentWidth}
          />
        </div>
      </div>
      
      <div>
        <h2>Preview</h2>
        <div 
          style={{ 
            fontSize,
            lineHeight,
            maxWidth: contentWidth,
            padding: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          <p>{sampleText}</p>
          <p>Font Size: {fontSize}</p>
          <p>Line Height: {lineHeight}</p>
          <p>Content Width: {contentWidth}</p>
        </div>
      </div>
    </div>
  );
};
