import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ContentItem } from '@mosaiq/core';
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const requestSort = (key: keyof ContentItem) => {
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

  const getSortIndicator = (key: keyof ContentItem) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const handleDeleteItem = async (id: string) => {
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
  
  const toggleThumbnailMenu = (id: string) => {
    if (activeThumbnailMenu === id) {
      setActiveThumbnailMenu(null);
    } else {
      setActiveThumbnailMenu(id);
    }
  };
  
  const handleThumbnailClick = (e: React.MouseEvent, id: string) => {
    // Prevent navigation when clicking the thumbnail itself
    e.preventDefault();
    e.stopPropagation();
    toggleThumbnailMenu(id);
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
  
  const handleRemoveThumbnail = async (id: string) => {
    try {
      // Update the thumbnail to null/empty in the database
      await window.electronAPI.updateThumbnail(id, '');
      
      // Update the item in the state
      setContentItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, featuredImage: '' } : item
        )
      );
      
      setActiveThumbnailMenu(null);
    } catch (error) {
      console.error('Error removing thumbnail:', error);
      alert('Failed to remove thumbnail.');
    }
  };
  
  const handleProvideUrlThumbnail = async (id: string) => {
    const url = prompt('Enter the URL for the thumbnail image:');
    if (!url) return;
    
    try {
      // Update the thumbnail with the provided URL
      await window.electronAPI.updateThumbnail(id, url);
      
      // Update the item in the state
      setContentItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, featuredImage: url } : item
        )
      );
      
      setActiveThumbnailMenu(null);
    } catch (error) {
      console.error('Error updating thumbnail with URL:', error);
      alert('Failed to update thumbnail.');
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
        <div className="search-container">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </header>

      <div className="library-controls">
        <div className="stats">
          Showing {filteredItems.length} of {contentItems.length} articles
        </div>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>

      {isLoading ? (
        <div className="loading-indicator">Loading content library...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-library">
          <p>No articles found.</p>
          {searchTerm ? <p>Try adjusting your search term.</p> : null}
        </div>
      ) : (
        <div className="table-container">
          <table className="content-table">
            <thead>
              <tr>
                <th className="image-column">Thumbnail</th>
                <th onClick={() => requestSort('title')}>
                  Title {getSortIndicator('title')}
                </th>
                <th onClick={() => requestSort('author')}>
                  Author {getSortIndicator('author')}
                </th>
                <th onClick={() => requestSort('publishDate')}>
                  Publish Date {getSortIndicator('publishDate')}
                </th>
                <th onClick={() => requestSort('dateAdded')}>
                  Date Added {getSortIndicator('dateAdded')}
                </th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="image-column">
                    <div className="thumbnail-container">
                      <div 
                        onClick={(e) => handleThumbnailClick(e, item.id)}
                        className="thumbnail-wrapper"
                      >
                        {item.featuredImage ? (
                          <img 
                            src={item.featuredImage} 
                            alt={item.title} 
                            className="article-thumbnail" 
                            onError={(e) => {
                              // Fallback to placeholder on image load error
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="placeholder-thumbnail">
                            <span>No Image</span>
                          </div>
                        )}
                        <div className="thumbnail-overlay">
                          <span className="edit-icon">✏️</span>
                        </div>
                      </div>
                      {activeThumbnailMenu === item.id && (
                        <div className="thumbnail-menu">
                          <button onClick={() => handleCustomThumbnailClick(item.id)}>Upload image</button>
                          <button onClick={() => handleProvideUrlThumbnail(item.id)}>Use image URL</button>
                          {item.featuredImage && (
                            <button onClick={() => handleRemoveThumbnail(item.id)}>Remove image</button>
                          )}
                          <button onClick={() => setActiveThumbnailMenu(null)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <Link to={`/reader/${item.id}`} className="title-link">
                      {item.title}
                    </Link>
                  </td>
                  <td>{item.author || 'Unknown'}</td>
                  <td>{item.publishDate ? formatDate(item.publishDate) : 'Unknown'}</td>
                  <td>{formatDate(item.dateAdded)}</td>
                  <td>
                    <div className="tags-container">
                      {item.tags && item.tags.length > 0 ? (
                        item.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="no-tags">No tags</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/reader/${item.id}`} 
                        className="action-button read-button"
                        title="Read"
                      >
                        📖
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
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
    </div>
  );
};
