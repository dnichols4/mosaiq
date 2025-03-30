import React, { useState } from 'react';
import { ContentItem } from '@mosaiq/core';
import './GridViewItem.css';

interface GridViewItemProps {
  item: ContentItem;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => Promise<void>;
  formatDate: (dateString: string) => string;
  getSourceIcon: (item: ContentItem) => string;
}

export const GridViewItem: React.FC<GridViewItemProps> = ({
  item,
  onClick,
  onDelete,
  formatDate,
  getSourceIcon
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div 
      className="grid-item"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="grid-item-image">
        {item.featuredImage ? (
          <img 
            src={item.featuredImage} 
            alt={item.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="%232c2c2c"/><text x="50%" y="50%" font-family="Arial" font-size="48" fill="%23999" text-anchor="middle" dominant-baseline="middle">📄</text></svg>';
            }}
          />
        ) : (
          <div className="default-image">{getSourceIcon(item)}</div>
        )}
        
        {isHovering && (
          <div className="grid-item-actions">
            <button 
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
              title="Delete"
              aria-label="Delete item"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="18" 
                height="18" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="grid-item-content">
        <h3 className="grid-item-title">{item.title}</h3>
        {item.excerpt && (
          <p className="grid-item-excerpt">{item.excerpt}</p>
        )}
        <div className="grid-item-footer">
          <div className="grid-item-meta">
            {item.author && <span className="grid-item-author">{item.author}</span>}
            <span className="grid-item-date">{formatDate(item.dateAdded)}</span>
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="grid-item-tags">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="grid-tag">{tag}</span>
              ))}
              {item.tags.length > 3 && (
                <span className="grid-tag-more">+{item.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
