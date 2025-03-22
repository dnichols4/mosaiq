import React, { useState, useEffect } from 'react';
// No need to import electron anymore

interface ContentViewerProps {
  urlId: string | null;
  onClose: () => void;
}

interface UrlContent {
  id: string;
  url: string;
  title: string;
  content: string;
  dateAdded: string;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ urlId, onClose }) => {
  const [content, setContent] = useState<UrlContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!urlId) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await window.api.getUrlContent(urlId);
        setContent(data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [urlId]);

  if (!urlId) return null;

  if (loading) {
    return (
      <div className="content-viewer">
        <div className="content-viewer-header">
          <h2>Loading...</h2>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-viewer">
        <div className="content-viewer-header">
          <h2>Error</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="content-viewer-body">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-viewer">
        <div className="content-viewer-header">
          <h2>Content not found</h2>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-viewer" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="content-viewer-header" style={{
        padding: '15px 20px',
        borderBottom: '1px solid #eaeaea',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>{content.title}</h2>
          <a href={content.url} target="_blank" rel="noopener noreferrer" style={{
            color: '#4a6cf7',
            textDecoration: 'none'
          }}>
            {content.url}
          </a>
        </div>
        <button onClick={onClose} style={{
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Close
        </button>
      </div>
      <div className="content-viewer-body" style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        lineHeight: 1.6
      }}>
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>
    </div>
  );
};

export default ContentViewer;
