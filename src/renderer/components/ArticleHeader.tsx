import React from 'react';

interface ArticleHeaderProps {
  title: string;
  url: string;
  author?: string;
  publishDate?: string;
  featuredImage?: string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  title,
  url,
  author,
  publishDate,
  featuredImage,
}) => {
  // Format the date if it exists
  const formattedDate = publishDate ? new Date(publishDate).toLocaleDateString() : null;
  
  // Get domain from URL
  let source = '';
  try {
    source = url ? new URL(url).hostname.replace('www.', '') : '';
  } catch (e) {
    // Invalid URL, use as is
    source = url;
  }
  
  return (
    <div className="article-metadata">
      <h1 className="article-title">{title}</h1>
      
      <div className="article-meta-info">
        {source && (
          <span className="article-source">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {source}
            </a>
          </span>
        )}
        
        {author && <span className="article-author">By {author}</span>}
        
        {formattedDate && (
          <span className="article-date">
            Published on {formattedDate}
          </span>
        )}
      </div>
      
      {featuredImage && (
        <img 
          className="article-featured-image" 
          src={featuredImage} 
          alt={`Featured image for ${title}`} 
        />
      )}
    </div>
  );
};

export default ArticleHeader;
