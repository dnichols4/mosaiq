import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentCard, SpotlightInput, SearchIcon, AddIcon, SettingsIcon, GridIcon, ListIcon } from '@mosaiq/common-ui';
import { IPlatformCapabilities } from '@mosaiq/platform-abstractions';
import './HomePage.css';

interface HomePageProps {
  platformCapabilities: IPlatformCapabilities | null;
}

export const HomePage: React.FC<HomePageProps> = ({ platformCapabilities }) => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Mosaiq</h1>
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
        <div className="grid-container">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              excerpt={item.excerpt}
              featuredImage={item.featuredImage}
              dateAdded={item.dateAdded}
              author={item.author}
              onClick={handleItemClick}
              onDelete={handleItemDelete}
            />
          ))}
        </div>
      ) : (
        <div className="list-container">
          <table className="content-table">
            <thead>
              <tr>
                <th className="thumbnail-column">Thumbnail</th>
                <th>Title</th>
                <th>Author</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="thumbnail-column">
                    {item.featuredImage ? (
                      <img 
                        src={item.featuredImage} 
                        alt={item.title} 
                        className="article-thumbnail" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="placeholder-thumbnail">
                        <span>No Image</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleItemClick(item.id)}
                      className="title-link"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td>{item.author || 'Unknown'}</td>
                  <td>{formatDate(item.dateAdded)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleItemClick(item.id)}
                        className="action-button read-button"
                        title="Read"
                      >
                        📖
                      </button>
                      <button
                        onClick={(e) => handleItemDelete(item.id, e)}
                        className="action-button delete-button"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <p>{searchTerm ? 'No articles match your search.' : 'No content saved yet.'}</p>
          {!searchTerm && (
            <p>Click the + button to add content from a URL.</p>
          )}
        </div>
      )}
    </div>
  );
};
