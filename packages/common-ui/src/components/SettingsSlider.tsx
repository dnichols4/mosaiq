import React from 'react';
import './SettingsSlider.styles.css';

export interface SliderOption {
  value: string;
  label: string;
}

export interface SettingsSliderProps {
  options: SliderOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * A slider component for selecting from a range of predefined options
 */
export const SettingsSlider: React.FC<SettingsSliderProps> = ({
  options,
  value,
  onChange,
  label
}) => {
  // Find the index of the current value in the options array
  const currentIndex = options.findIndex(option => option.value === value);
  
  // Calculate the percentage for positioning the thumb
  const percentage = options.length > 1 
    ? (currentIndex / (options.length - 1)) * 100 
    : 0;
    
  // Constrain percentage to avoid extending beyond track
  const constrainedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Handle slider click to select the closest option
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const sliderWidth = rect.width;
    
    // Calculate which option is closest to the click position
    const clickPercentage = clickPosition / sliderWidth;
    const optionIndex = Math.round(clickPercentage * (options.length - 1));
    
    // Ensure the index is within bounds
    const safeIndex = Math.max(0, Math.min(optionIndex, options.length - 1));
    onChange(options[safeIndex].value);
  };
  
  return (
    <div className="settings-slider-container" style={{ marginBottom: options.length > 4 ? '32px' : '24px' }}>
      {label && <label className="settings-slider-label">{label}</label>}
      
      <div className="settings-slider" onClick={handleSliderClick}>
        <div className="settings-slider-track">
          {/* Position markers for each option */}
          {options.map((option, index) => (
            <div 
              key={option.value}
              className={`settings-slider-marker ${value === option.value ? 'active' : ''}`}
              style={{
                left: `${(index / (options.length - 1)) * 100}%`
              }}
            />
          ))}
          
          {/* Filled portion of the track */}
          <div 
            className="settings-slider-track-fill"
            style={{ width: `${constrainedPercentage}%` }}
          />
        </div>
        
        {/* Slider thumb */}
        <div 
          className="settings-slider-thumb"
          style={{ left: `${constrainedPercentage}%` }}
        />
      </div>
      
      {/* Labels under the slider */}
      <div className="settings-slider-labels">
        {options.map((option, index) => {
          // Define position class for special handling of first and last elements
          const positionClass = 
            index === 0 ? 'first-option' : 
            index === options.length - 1 ? 'last-option' : '';
            
          return (
            <div 
              key={option.value}
              className={`settings-slider-option-label ${value === option.value ? 'active' : ''} ${positionClass}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
