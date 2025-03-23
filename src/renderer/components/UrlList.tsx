import React from 'react';
import { UrlMetadata } from '../types/api';
import { useUrlStore } from '../store/urlStore';

// Import shared types
import '../types/api';

interface UrlListProps {
  urls: UrlMetadata[];
  onSelectUrl: (id: string) => void;
}

const UrlList: React.FC<UrlListProps> = ({ urls, onSelectUrl }) => {
  const { deleteUrl } = useUrlStore();
  
  if (urls.length === 0) {
    return (
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p>No saved URLs yet. Add your first one above!</p>
      </div>
    );
  }

  const handleViewContent = (id: string) => {
    onSelectUrl(id);
  };
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering onClick of the parent div
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteUrl(id);
    }
  };
  
  return (
    <div>
      <h2>Saved Resources</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        {urls.map((url) => (
          <div
            key={url.id}
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => handleViewContent(url.id)}
          >
            <h3 style={{ margin: '0 0 10px 0' }}>{url.title}</h3>
            <p style={{ color: '#666', margin: '0 0 10px 0' }}>{url.excerpt}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={url.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4a6cf7', textDecoration: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                {url.url}
              </a>
              <span style={{ color: '#999', fontSize: '0.9em' }}>
                {new Date(url.dateAdded).toLocaleDateString()}
              </span>
            </div>
            <button 
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#f44336',
                cursor: 'pointer',
                padding: '5px',
                fontSize: '14px',
                borderRadius: '4px'
              }}
              onClick={(e) => handleDelete(e, url.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrlList;
