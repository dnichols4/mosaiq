import React, { useEffect, useRef, useState } from 'react';
import './SpotlightInput.css';

export interface SpotlightInputProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'search' | 'url';
  onSubmit: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SpotlightInput: React.FC<SpotlightInputProps> = ({
  isOpen,
  onClose,
  mode,
  onSubmit,
  placeholder,
  initialValue = '',
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="spotlight-overlay">
      <div className="spotlight-container" ref={containerRef}>
        <form onSubmit={handleSubmit}>
          <div className="spotlight-input-wrapper">
            <span className="spotlight-icon">
              {mode === 'search' ? '🔍' : '🔗'}
            </span>
            <input
              ref={inputRef}
              type={mode === 'url' ? 'url' : 'text'}
              className="spotlight-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder || (mode === 'search' ? 'Search...' : 'Enter URL...')}
              required={mode === 'url'}
            />
            {value && (
              <button 
                type="button" 
                className="spotlight-clear-button" 
                onClick={() => setValue('')}
                aria-label="Clear input"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="spotlight-submit-button">
            {mode === 'search' ? 'Search' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};
