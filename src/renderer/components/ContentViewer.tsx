import React, { useState, useEffect } from 'react';
import { ReadingSettings } from '../../data/urlStorage';
import ArticleViewer from './ArticleViewer';
import '../styles/readerMode.css';
import '../types/api';

interface ContentViewerProps {
  urlId: string | null;
  onClose: () => void;
}

interface UrlContent {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  featuredImage?: string;
  excerpt: string;
  content: string;
  dateAdded: string;
  tags?: string[];
}

const ContentViewer: React.FC<ContentViewerProps> = ({ urlId, onClose }) => {
  const [content, setContent] = useState<UrlContent | null>(null);
  
  // Initialize settings state using local defaults
  // We'll fetch the actual settings via IPC
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: '18px',
    lineHeight: '1.6',
    theme: 'light',
    width: '680px'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from main process when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await window.api.getReadingSettings();
        setSettings(storedSettings);
      } catch (err) {
        console.error('Error loading reading settings:', err);
        // Continue with defaults if there's an error
      }
    };
    
    loadSettings();
  }, []);

  useEffect(() => {
    if (!urlId) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await window.api.getUrlContent(urlId);
        setContent(data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [urlId]);

  if (!urlId) return null;

  if (loading) {
    return (
      <div className="content-viewer">
        <div className="content-viewer-header">
          <h2>Loading...</h2>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-viewer">
        <div className="content-viewer-header">
          <h2>Error</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="content-viewer-body">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-viewer">
        <div className="content-viewer-header">
          <h2>Content not found</h2>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSettingsChange = async (newSettings: Partial<ReadingSettings>) => {
    try {
      // Update settings through IPC
      const updatedSettings = await window.api.updateReadingSettings(newSettings);
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      // Apply changes locally even if save fails
      setSettings({...settings, ...newSettings});
    }
  };
  
  return (
    <div className={`content-viewer-container ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="content-viewer-header">
        <button onClick={onClose} className="back-button">
          ← Close
        </button>
      </div>
      <div className="content-viewer-body">
        <ArticleViewer 
          article={content} 
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
};

export default ContentViewer;
