import React, { useState } from 'react';
import { ContentItem } from '@mosaiq/core';
import './ListViewItem.css';

interface ListViewItemProps {
  item: ContentItem;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  getSourceIcon: (item: ContentItem) => string;
}

export const ListViewItem: React.FC<ListViewItemProps> = ({
  item,
  onClick,
  onDelete,
  formatDate,
  formatTime,
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
      className="list-item"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          <div className="default-icon">{getSourceIcon(item)}</div>
        )}
      </div>
      <div className="list-item-title">
        <div className="item-title-text">{item.title}</div>
        {item.excerpt && (
          <div className="item-excerpt">{item.excerpt}</div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="item-tags">
            {item.tags.map((tag, index) => (
              <span key={index} className="item-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="list-item-author">
        {item.author || 'Unknown'}
      </div>
      <div className="list-item-date">
        {formatDate(item.dateAdded)}
      </div>
      <div className="list-item-time">
        {formatTime(item.dateAdded)}
      </div>
      <div className="list-item-actions">
        {isHovering && (
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
        )}
      </div>
    </div>
  );
};
