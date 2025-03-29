import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentViewer, ReadingSettingsPanel, ReadingSettings } from '@mosaiq/common-ui';
import { useTheme } from '../providers/ThemeProvider';
import '../styles/reader.css';

export const ReaderPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<{
    id: string;
    title: string;
    content: string;
    author?: string;
    publishDate?: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    fontSize: '18px',
    lineHeight: '1.6',
    theme: 'light',
    width: '800px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });
  
  // Load content and settings on component mount
  useEffect(() => {
    if (!id) return;
    
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Load content
        const contentData = await window.electronAPI.getItemWithContent(id);
        setContent(contentData);
        
        // Load reading settings
        const settings = await window.electronAPI.getReadingSettings();
        setReadingSettings(settings);
        
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Error loading content. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [id]);
  
  // Handle reading settings changes
  const handleSettingsChange = async (settings: Partial<ReadingSettings>) => {
    try {
      const updatedSettings = await window.electronAPI.updateReadingSettings(settings);
      setReadingSettings(updatedSettings);
      
      // Update global theme if theme setting changed
      if (settings.theme && settings.theme !== theme) {
        setTheme(settings.theme);
      }
    } catch (error) {
      console.error('Error updating reading settings:', error);
    }
  };
  
  // Go back to home page
  const goBack = () => {
    navigate('/');
  };
  
  // Delete current article
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await window.electronAPI.deleteItem(id);
        goBack();
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading content...</p>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>{error || 'Content not found'}</p>
        <button onClick={goBack} style={{ marginTop: '16px' }}>Go Back</button>
      </div>
    );
  }
  
  // Apply reader page class
  const readerPageClass = 'reader-page';

  return (
    <div className={readerPageClass} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="reader-header" style={{ 
        padding: '8px 16px', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button onClick={goBack} style={{ padding: '4px 8px' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleSettings} style={{ padding: '4px 8px' }}>
            {showSettings ? 'Hide Settings' : 'Settings'}
          </button>
          <button 
            onClick={handleDelete} 
            style={{ 
              padding: '4px 8px',
              backgroundColor: 'var(--destructive-bg, rgba(255, 0, 0, 0.1))',
              color: 'var(--destructive-text, #d32f2f)',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Delete
          </button>
        </div>
      </header>
      
      <div className="reader-body" style={{ 
        display: 'flex', 
        flexGrow: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="reader-content" style={{
          flexGrow: 1,
          overflow: 'auto',
        }}>
          <ContentViewer
            title={content.title}
            content={content.content}
            author={content.author}
            publishDate={content.publishDate}
            settings={readingSettings}
          />
        </div>
        
        {showSettings && (
          <div className="settings-sidebar" style={{
            overflow: 'auto',
          }}>
            <ReadingSettingsPanel
              settings={readingSettings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
