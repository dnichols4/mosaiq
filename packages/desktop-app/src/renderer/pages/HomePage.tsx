import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentCard } from '@mosaiq/common-ui';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';

interface HomePageProps {
  platformCapabilities: IPlatformCapabilities | null;
}

export const HomePage: React.FC<HomePageProps> = ({ platformCapabilities }) => {
  const [url, setUrl] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();
  
  // Load all items on component mount
  useEffect(() => {
    loadItems();
    
    // Check online status if platformCapabilities is available
    if (platformCapabilities) {
      checkOnlineStatus();
    }
  }, [platformCapabilities]);
  
  // Check online status
  const checkOnlineStatus = async () => {
    if (platformCapabilities && typeof platformCapabilities.isOnline === 'function') {
      try {
        const online = await platformCapabilities.isOnline();
        setIsOnline(online);
      } catch (error) {
        console.error('Error checking online status:', error);
        setIsOnline(false);
      }
    }
  };
  
  // Load all items from storage
  const loadItems = async () => {
    try {
      const allItems = await window.electronAPI.getAllItems();
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };
  
  // Handle URL submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    
    try {
      await window.electronAPI.saveUrl(url);
      setUrl('');
      loadItems();
    } catch (error) {
      console.error('Error saving URL:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle item click
  const handleItemClick = (id: string) => {
    navigate(`/reader/${id}`);
  };
  
  // Navigate to settings
  const goToSettings = () => {
    navigate('/settings');
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Mosaiq</h1>
        <button onClick={goToSettings}>Settings</button>
      </header>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to save"
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--app-text)' }}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{ padding: '8px 16px', borderRadius: '4px', background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none' }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      
      {platformCapabilities && (
        <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--muted-text)' }}>
          Platform: {platformCapabilities.type}
          {isOnline && ' • Online'}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {items.map((item) => (
          <ContentCard
            key={item.id}
            id={item.id}
            title={item.title}
            excerpt={item.excerpt}
            featuredImage={item.featuredImage}
            dateAdded={item.dateAdded}
            author={item.author}
            onClick={handleItemClick}
          />
        ))}
      </div>
      
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-text)' }}>
          <p>No content saved yet. Enter a URL above to get started.</p>
        </div>
      )}
    </div>
  );
};
