import React from 'react';
import './ContentCard.css';

export interface ContentCardProps {
  id: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  dateAdded: string;
  author?: string;
  onClick?: (id: string) => void;
  onDelete?: (id: string, event: React.MouseEvent) => void;
}

/**
 * Component for displaying a content item as a card
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  excerpt,
  featuredImage,
  dateAdded,
  author,
  onClick,
  onDelete
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  
  // Format date using platform-agnostic approach
  const formattedDate = new Date(dateAdded).toLocaleDateString();
  
  // Handle delete button click
  const handleDelete = (event: React.MouseEvent) => {
    if (onDelete) {
      event.stopPropagation();
      onDelete(id, event);
    }
  };

  return (
    <div 
      className="content-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        margin: '8px',
        borderRadius: '8px',
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--card-shadow)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative'
      }}
    >
      {featuredImage && (
        <div className="content-card-image" style={{ marginBottom: '12px' }}>
          <img 
            src={featuredImage} 
            alt={title}
            style={{
              width: '100%',
              height: '180px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        </div>
      )}
      
      <div className="content-card-content" onClick={handleClick}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: 600
        }}>
          {title}
        </h3>
        
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: 'var(--muted-text)',
          lineHeight: 1.4
        }}>
          {excerpt}
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--muted-text)'
        }}>
          {author && <span>{author}</span>}
          <span>{formattedDate}</span>
        </div>
      </div>
      
      {onDelete && (
        <button
          onClick={handleDelete}
          title="Delete"
          aria-label="Delete article"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'var(--destructive-bg, rgba(255, 255, 255, 0.8))',
            color: 'var(--destructive-text, #d32f2f)',
            border: '1px solid var(--destructive-border, rgba(255, 0, 0, 0.2))',
            borderRadius: '4px',
            width: '28px',
            height: '28px',
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 2,
            opacity: 0,
            transition: 'opacity 0.2s ease, background-color 0.2s ease'
          }}
          className="delete-button"
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
            style={{ display: 'block', color: 'inherit' }} /* Ensure SVG is displayed with proper color */
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </div>
  );
};
