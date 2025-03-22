import React, { useState } from 'react';
import { ReadingSettings } from '../../data/urlStorage';

interface ReadingControlsProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: Partial<ReadingSettings>) => void;
}

const ReadingControls: React.FC<ReadingControlsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  const handleFontSizeChange = (change: number) => {
    const currentSize = parseInt(settings.fontSize);
    const newSize = Math.max(12, Math.min(24, currentSize + change));
    onSettingsChange({ fontSize: `${newSize}px` });
  };
  
  const handleLineHeightChange = (change: number) => {
    const currentHeight = parseFloat(settings.lineHeight);
    const newHeight = Math.max(1.2, Math.min(2, currentHeight + change)).toFixed(1);
    onSettingsChange({ lineHeight: newHeight });
  };
  
  const handleWidthChange = (change: number) => {
    const currentWidth = parseInt(settings.width);
    const newWidth = Math.max(400, Math.min(1000, currentWidth + change));
    onSettingsChange({ width: `${newWidth}px` });
  };
  
  const toggleTheme = () => {
    onSettingsChange({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };
  
  return (
    <div className="reading-controls">
      <button 
        className="reading-controls-toggle" 
        onClick={togglePanel}
        aria-label="Toggle reading controls"
      >
        ⚙️
      </button>
      
      {isOpen && (
        <div className="reading-controls-panel">
          <div className="control-group">
            <label className="control-label">Font Size</label>
            <div className="font-size-controls">
              <button 
                className="control-button" 
                onClick={() => handleFontSizeChange(-1)}
                aria-label="Decrease font size"
              >
                -
              </button>
              <span className="control-value">
                {parseInt(settings.fontSize)}
              </span>
              <button 
                className="control-button" 
                onClick={() => handleFontSizeChange(1)}
                aria-label="Increase font size"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label className="control-label">Line Spacing</label>
            <div className="line-height-controls">
              <button 
                className="control-button" 
                onClick={() => handleLineHeightChange(-0.1)}
                aria-label="Decrease line spacing"
              >
                -
              </button>
              <span className="control-value">
                {parseFloat(settings.lineHeight).toFixed(1)}
              </span>
              <button 
                className="control-button" 
                onClick={() => handleLineHeightChange(0.1)}
                aria-label="Increase line spacing"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label className="control-label">Width</label>
            <div className="width-controls">
              <button 
                className="control-button" 
                onClick={() => handleWidthChange(-40)}
                aria-label="Decrease width"
              >
                -
              </button>
              <span className="control-value">
                {parseInt(settings.width)}
              </span>
              <button 
                className="control-button" 
                onClick={() => handleWidthChange(40)}
                aria-label="Increase width"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label className="control-label">Theme</label>
            <div className="theme-toggle">
              <button 
                className="control-button" 
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {settings.theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingControls;