import React, { useEffect, useState } from 'react';
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

  return (
    <div className="content-library-container">
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
