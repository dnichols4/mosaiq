import React from 'react';

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
            background: 'var(--destructive-bg, #cccccc)',
            color: 'var(--destructive-text, #d32f2f)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
