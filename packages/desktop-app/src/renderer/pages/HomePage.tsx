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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
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
  
  // Filter items based on search term
  const filteredItems = searchTerm.trim() === '' 
    ? items 
    : items.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          (item.author && item.author.toLowerCase().includes(searchLower)) ||
          (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
        );
      });

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
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Mosaiq</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setViewMode('grid')} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              background: viewMode === 'grid' ? 'var(--button-bg)' : 'var(--control-bg)', 
              color: viewMode === 'grid' ? 'var(--button-text)' : 'var(--app-text)', 
              border: viewMode === 'grid' ? 'none' : '1px solid var(--border-color)',
            }}
          >
            Grid
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              background: viewMode === 'list' ? 'var(--button-bg)' : 'var(--control-bg)', 
              color: viewMode === 'list' ? 'var(--button-text)' : 'var(--app-text)', 
              border: viewMode === 'list' ? 'none' : '1px solid var(--border-color)',
            }}
          >
            List
          </button>
          <button 
            onClick={goToSettings} 
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              background: 'var(--control-bg)',
              color: 'var(--app-text)',
              border: '1px solid var(--border-color)',
              fontSize: '16px'
            }}
            aria-label="Settings"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
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

        {viewMode === 'list' && (
          <div style={{ width: '300px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--app-text)' }}
            />
          </div>
        )}
      </div>
      
      {platformCapabilities && (
        <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--muted-text)' }}>
          Platform: {platformCapabilities.type}
          {isOnline && ' • Online'}
        </div>
      )}
      
      {viewMode === 'grid' ? (
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
              onDelete={handleItemDelete}
            />
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: 'var(--card-bg, #ffffff)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--table-header-bg, #f9fafb)' }}>
              <tr>
                <th style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted-text, #4b5563)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }} className="image-column">Thumbnail</th>
                <th style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted-text, #4b5563)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>Title</th>
                <th style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted-text, #4b5563)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>Author</th>
                <th style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted-text, #4b5563)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>Date Added</th>
                <th style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted-text, #4b5563)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', color: 'var(--app-text, #1f2937)', textAlign: 'center', width: '100px' }}>
                    {item.featuredImage ? (
                      <img 
                        src={item.featuredImage} 
                        alt={item.title} 
                        style={{ 
                          width: '80px', 
                          height: '60px', 
                          objectFit: 'cover',
                          borderRadius: '4px', 
                          border: '1px solid var(--border-color, #e5e7eb)'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '80px', 
                        height: '60px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--placeholder-bg, #f0f0f0)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        fontSize: '0.7rem',
                        color: 'var(--muted-text, #9ca3af)'
                      }}>
                        <span>No Image</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', color: 'var(--app-text, #1f2937)' }}>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handleItemClick(item.id); }}
                      style={{ color: 'var(--link-color, #2563eb)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {item.title}
                    </a>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', color: 'var(--app-text, #1f2937)' }}>{item.author || 'Unknown'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', color: 'var(--app-text, #1f2937)' }}>{formatDate(item.dateAdded)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', color: 'var(--app-text, #1f2937)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleItemClick(item.id)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          color: 'var(--link-color, #2563eb)'
                        }}
                        title="Read"
                      >
                        📖
                      </button>
                      <button
                        onClick={(e) => handleItemDelete(item.id, e)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          color: 'var(--destructive-text, #ef4444)'
                        }}
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
      
      {(viewMode === 'grid' && items.length === 0) || (viewMode === 'list' && filteredItems.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-text)' }}>
          <p>{searchTerm ? 'No articles match your search.' : 'No content saved yet. Enter a URL above to get started.'}</p>
        </div>
      ) : null}
    </div>
  );
};
