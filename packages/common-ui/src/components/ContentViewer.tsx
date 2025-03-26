import React from 'react';
import './ContentViewer.styles.css';

export interface ContentViewerProps {
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
  settings: {
    fontSize: string;
    lineHeight: string;
    theme: 'light' | 'dark' | 'sepia';
    width: string;
    fontFamily: string;
  };
}

/**
 * Component for displaying content with reading settings applied
 */
export const ContentViewer: React.FC<ContentViewerProps> = ({
  title,
  content,
  author,
  publishDate,
  settings
}) => {
  // No need for local theme class as global theme is used
  
  // Format date if available
  const formattedDate = publishDate ? new Date(publishDate).toLocaleDateString() : undefined;
  
  return (
    <div
      className="content-viewer"
      style={{
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh'
      }}
    >
      <div
        style={{
          width: settings.width,
          maxWidth: '100%'
        }}
      >
        <article>
          <h1 style={{ 
            fontSize: 'calc(' + settings.fontSize + ' * 1.8)',
            lineHeight: '1.2',
            marginBottom: '0.5em'
          }}>
            {title}
          </h1>
          
          {(author || formattedDate) && (
            <div style={{ 
              marginBottom: '2em',
              fontSize: 'calc(' + settings.fontSize + ' * 0.8)',
              opacity: 0.7
            }}>
              {author && <span>{author}</span>}
              {author && formattedDate && <span> • </span>}
              {formattedDate && <span>{formattedDate}</span>}
            </div>
          )}
          
          <div
            className="content-body"
            style={{
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
              fontFamily: settings.fontFamily
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </div>
    </div>
  );
};
