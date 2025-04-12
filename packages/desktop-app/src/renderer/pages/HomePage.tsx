import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentCard, SpotlightInput, SearchIcon, AddIcon, SettingsIcon, GridIcon, ListIcon } from '@mosaiq/common-ui';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';
import { ListView } from '../components/ListView/ListView';
import { GridView } from '../components/GridView/GridView';
import { PlatformDialogExample } from '../components/examples/PlatformDialogExample';
import './HomePage.css';

interface HomePageProps {
  platformCapabilities: IPlatformCapabilities | null;
}

export const HomePage: React.FC<HomePageProps> = ({ platformCapabilities }) => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [spotlightMode, setSpotlightMode] = useState<'search' | 'url' | null>(null);
  const navigate = useNavigate();
  
  // Load all items on component mount
  useEffect(() => {
    loadItems();
    
    // Check online status if platformCapabilities is available
    if (platformCapabilities) {
      checkOnlineStatus();
    }
  }, [platformCapabilities]);
  
  // Filter items when search term or items change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const filtered = items.filter(item => {
        return (
          item.title.toLowerCase().includes(normalizedSearchTerm) ||
          (item.author && item.author.toLowerCase().includes(normalizedSearchTerm)) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(normalizedSearchTerm)) ||
          (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(normalizedSearchTerm)))
        );
      });
      setFilteredItems(filtered);
    }
  }, [items, searchTerm]);
  
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
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };
  
  // Handle URL submission
  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    
    try {
      await window.electronAPI.saveUrl(url);
      loadItems();
    } catch (error) {
      console.error('Error saving URL:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search submission
  const handleSearchSubmit = (term: string) => {
    setSearchTerm(term);
  };
  
  // Handle item click
  const handleItemClick = (id: string) => {
    navigate(`/reader/${id}`);
  };
  
  // Handle item deletion
  const handleItemDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await window.electronAPI.deleteItem(id);
        // Reload items after deletion
        loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };
  
  // Navigate to settings
  const goToSettings = () => {
    navigate('/settings');
  };

  // Format date for list view
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };
  
  // Format time for list view
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };
  
  // Get source icon based on URL
  const getSourceIcon = (item: any) => {
    if (item.source?.includes('medium.com')) {
      return "📝";
    } else if (item.source?.includes('github.com')) {
      return "🧑‍💻";
    } else if (item.source?.includes('youtube.com')) {
      return "🎬";
    } else {
      return "📄";
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>mosaiq</h1>
        <div className="header-controls">
          <SearchIcon 
            onClick={() => setSpotlightMode('search')} 
            className={searchTerm ? 'active' : ''}
          />
          <AddIcon onClick={() => setSpotlightMode('url')} />
          <div className="view-toggle">
            <GridIcon 
              onClick={() => setViewMode('grid')} 
              className={viewMode === 'grid' ? 'active' : ''}
            />
            <ListIcon 
              onClick={() => setViewMode('list')} 
              className={viewMode === 'list' ? 'active' : ''}
            />
          </div>
          <SettingsIcon onClick={goToSettings} />
        </div>
      </header>
      
      {platformCapabilities && (
        <div className="platform-info">
          Platform: {platformCapabilities.type}
          {isOnline && ' • Online'}
        </div>
      )}

      {/* Spotlight Input for Search and URL */}
      <SpotlightInput
        isOpen={spotlightMode !== null}
        onClose={() => setSpotlightMode(null)}
        mode={spotlightMode || 'search'}
        onSubmit={spotlightMode === 'search' ? handleSearchSubmit : handleUrlSubmit}
        placeholder={spotlightMode === 'search' ? 'Search articles...' : 'Enter URL to save'}
        initialValue={spotlightMode === 'search' ? searchTerm : ''}
      />
      
      {searchTerm && (
        <div className="search-results-info">
          Showing {filteredItems.length} of {items.length} articles matching "{searchTerm}"
          <button 
            className="clear-search-button"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            Clear
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-indicator">Saving content...</div>
      )}
      
      {viewMode === 'grid' ? (
        <GridView 
          items={filteredItems}
          onItemClick={handleItemClick}
          onDeleteItem={(id, e) => handleItemDelete(id, e)}
          formatDate={formatDate}
          getSourceIcon={getSourceIcon}
        />
      ) : (
        <ListView 
          items={filteredItems}
          onItemClick={handleItemClick}
          onDeleteItem={(id, e) => handleItemDelete(id, e)}
          formatDate={formatDate}
          formatTime={formatTime}
          getSourceIcon={getSourceIcon}
        />
      )}
      
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <p>{searchTerm ? 'No articles match your search.' : 'No content saved yet.'}</p>
          {!searchTerm && (
            <p>Click the + button to add content from a URL.</p>
          )}
        </div>
      )}
      
      {/* Example section for platform dialogs */}
      <div className="platform-examples-section">
        <h2>Platform UI Examples</h2>
        <p>This section demonstrates the platform dialog and file picker abstractions.</p>
        <PlatformDialogExample />
      </div>
      
      <style>{`
        .platform-examples-section {
          margin-top: 40px;
          padding: 20px;
          border-top: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};
