import React, { useEffect } from 'react';
import { UrlData, ReadingSettings } from '../../data/urlStorage';
import ArticleHeader from './ArticleHeader';
import ReadingControls from './ReadingControls';

// Import shared types
import '../types/api';

interface ArticleViewerProps {
  article: UrlData;
  settings: ReadingSettings;
  onSettingsChange: (settings: Partial<ReadingSettings>) => void;
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({
  article,
  settings,
  onSettingsChange,
}) => {
  useEffect(() => {
    // Scroll to top when article changes
    window.scrollTo(0, 0);
  }, [article.id]);
  
  return (
    <div 
      className={`reader-view ${settings.theme}`}
      style={{
        fontSize: settings.fontSize,
        lineHeight: settings.lineHeight,
        width: settings.width,
        margin: '0 auto',
      }}
    >
      <ArticleHeader
        title={article.title}
        url={article.url}
        author={article.author}
        publishDate={article.publishDate}
        featuredImage={article.featuredImage}
      />
      
      <div 
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      <ReadingControls
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
};

export default ArticleViewer;
