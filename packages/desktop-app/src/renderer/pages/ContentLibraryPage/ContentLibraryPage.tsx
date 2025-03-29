import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ContentItem } from '@mosaiq/core';
import { SearchIcon, SpotlightInput } from '@mosaiq/common-ui';
import './ContentLibraryPage.css';

interface SortConfig {
  key: keyof ContentItem;
  direction: 'ascending' | 'descending';
}

export const ContentLibraryPage: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dateAdded', direction: 'descending' });
  const [activeThumbnailMenu, setActiveThumbnailMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const fetchContentItems = async () => {
      try {
        setIsLoading(true);
        const items = await window.electronAPI.getAllItems();
        setContentItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error fetching content items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentItems();
  }, []);

  useEffect(() => {
    // Filter items based on search term
    if (searchTerm.trim() === '') {
      setFilteredItems(contentItems);
    } else {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const filtered = contentItems.filter(item => {
        return (
          item.title.toLowerCase().includes(normalizedSearchTerm) ||
          (item.author && item.author.toLowerCase().includes(normalizedSearchTerm)) ||
          (item.excerpt && item.excerpt.toLowerCase().includes(normalizedSearchTerm)) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(normalizedSearchTerm)))
        );
      });
      setFilteredItems(filtered);
    }
  }, [contentItems, searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const handleSearchSubmit = (value: string) => {
    setSearchTerm(value);
  };

  const sortItems = (key: keyof ContentItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });

    // Sort the items
    const sortedItems = [...filteredItems].sort((a, b) => {
      // Handle different property types
      const aValue = a[key] as any;
      const bValue = b[key] as any;

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      // Handle different types of values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      // For dates in ISO string format
      if (key === 'dateAdded' || key === 'publishDate') {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return direction === 'ascending' ? aDate - bDate : bDate - aDate;
      }

      // Fallback for other types
      return direction === 'ascending' 
        ? (aValue > bValue ? 1 : -1) 
        : (bValue > aValue ? 1 : -1);
    });
    
    setFilteredItems(sortedItems);
  };

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await window.electronAPI.deleteItem(id);
      // Remove item from state
      setContentItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };
  
  const handleCustomThumbnailClick = (id: string) => {
    setSelectedItemId(id);
    setActiveThumbnailMenu(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !selectedItemId) {
      return;
    }
    
    const file = e.target.files[0];
    
    try {
      // Create a local file URL
      const objectUrl = URL.createObjectURL(file);
      
      // Update the thumbnail in the database
      const updatedItem = await window.electronAPI.updateThumbnail(selectedItemId, objectUrl);
      
      // Update the item in the state
      setContentItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedItemId ? { ...item, featuredImage: objectUrl } : item
        )
      );
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      alert('Failed to update thumbnail.');
    } finally {
      setSelectedItemId(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleItemClick = (id: string) => {
    window.location.href = `/reader/${id}`;
  };

  const getSourceIcon = (item: ContentItem) => {
    if (item.url?.includes('medium.com')) {
      return "📝";
    } else if (item.url?.includes('github.com')) {
      return "🧑‍💻";
    } else if (item.url?.includes('youtube.com')) {
      return "🎬";
    } else {
      return "📄";
    }
  };

  return (
    <div className="content-library-container">
      {/* Hidden file input for thumbnail upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <header className="library-header">
        <h1>Content Library</h1>
        <div className="library-controls">
          <div className="search-button-container">
            <SearchIcon 
              onClick={() => setShowSpotlight(true)} 
              className={searchTerm ? 'active' : ''}
            />
            {searchTerm && (
              <span className="search-indicator">
                Filtered by: {searchTerm}
                <button className="clear-search-button" onClick={clearSearch}>✕</button>
              </span>
            )}
          </div>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
      </header>

      {/* Spotlight Search Input */}
      <SpotlightInput
        isOpen={showSpotlight}
        onClose={() => setShowSpotlight(false)}
        mode="search"
        onSubmit={handleSearchSubmit}
        placeholder="Search articles by title, author, or tags..."
        initialValue={searchTerm}
      />

      <div className="library-stats">
        Showing {filteredItems.length} of {contentItems.length} articles
      </div>

      {isLoading ? (
        <div className="loading-indicator">Loading content library...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-library">
          <p>No articles found.</p>
          {searchTerm ? <p>Try adjusting your search term.</p> : null}
        </div>
      ) : (
        <div className="content-list">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="list-item"
              onClick={() => handleItemClick(item.id)}
            >
              <div className="list-item-icon">
                {item.featuredImage ? (
                  <img 
                    src={item.featuredImage} 
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="%232c2c2c"/><text x="50%" y="50%" font-family="Arial" font-size="10" fill="%23999" text-anchor="middle" dominant-baseline="middle">📄</text></svg>';
                    }}
                  />
                ) : (
                  <div>{getSourceIcon(item)}</div>
                )}
              </div>
              <div className="list-item-content">
                <div className="item-title">{item.title}</div>
                {item.excerpt && (
                  <div className="item-excerpt">{item.excerpt}</div>
                )}
                <div className="item-metadata">
                  {item.author && (
                    <>
                      {item.author} 
                      <span className="metadata-divider">•</span>
                    </>
                  )}
                  {formatDate(item.dateAdded)}
                  {item.tags && item.tags.length > 0 && (
                    <>
                      <span className="metadata-divider">•</span>
                      {item.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="timestamp">
                {formatTime(item.dateAdded)}
              </div>
              <div className="list-item-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="action-button delete-button"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
