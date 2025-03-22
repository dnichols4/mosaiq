# Mosaiq Project Status

## Current Implementation

### Project Overview
Mosaiq is a personal knowledge management application with a local-first architecture that focuses on content consumption, annotation, and concept relationship discovery.

### Technology Stack
- **Frontend**: Electron + React
- **State Management**: Zustand
- **Content Processing**: Cheerio
- **Storage**: Electron-store + filesystem

### Architecture
The project follows a layered architecture:
- **UI Layer**: React components
- **Application Logic Layer**: State management with Zustand
- **Content Processing Layer**: HTML parsing and cleanup
- **Data Management Layer**: Local storage using Electron-store and filesystem

### Current Features
- URL saving with basic content extraction
- Simple list view of saved resources
- Content viewing capability
- Local-first storage of content and metadata

### Project Structure
```
mosaiq/
│
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main entry point
│   │   ├── ipc.ts      # IPC handlers
│   │   └── preload.ts  # Preload script
│   │
│   ├── renderer/       # React UI components
│   │   ├── components/ # UI components
│   │   │   ├── AddUrlForm.tsx
│   │   │   ├── ContentViewer.tsx
│   │   │   └── UrlList.tsx
│   │   │
│   │   ├── store/      # State management
│   │   │   └── urlStore.ts
│   │   │
│   │   ├── App.tsx     # Main React component
│   │   ├── index.html  # HTML template
│   │   ├── renderer.tsx # React entry point
│   │   └── styles.css  # Global styles
│   │
│   ├── content/        # Content processing
│   │   └── contentProcessor.ts
│   │
│   └── data/           # Data storage
│       └── urlStorage.ts
│
├── storage/            # Local content storage
│
├── docs/               # Documentation
│
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript config
├── tsconfig.main.json  # Main process TS config
└── webpack.config.js   # Webpack configuration
```

### Build Setup
- TypeScript compilation for main process
- Webpack bundling for renderer process
- Development setup with hot reloading
- Production build process

### Current Limitations
- Basic content extraction with poor readability
- Minimal styling of saved content
- No annotation capabilities
- No tagging or search functionality

## Planned Improvements

### Content Parsing Enhancements

#### Better Content Extraction
- Replace simple DOM selection with readability algorithm
- Implement proper heuristics for main content identification
- Filter out navigation, sidebars, comments, ads, and other non-content elements
- Add specific handling for common site formats

#### Content Cleanup
- Remove extraneous divs, spans with no semantic value
- Preserve important semantic HTML (headings, lists, blockquotes)
- Handle image elements properly (preserve but make responsive)
- Sanitize HTML to prevent XSS issues
- Normalize Unicode characters

#### Metadata Extraction
- Better title extraction (article title vs. page title)
- Extract author information when available
- Extract published date when available
- Grab featured image if present
- Extract categories/tags when available

### Reader Mode Display Improvements

#### Typography Enhancements
- Readable font size and line height (18px/1.6)
- Optimal line length (65-75 characters per line)
- Proper paragraph spacing
- Hierarchical heading styles
- Font family selection for better readability

#### Layout & UI Improvements
- Clean, distraction-free reading container
- Proper image handling (responsive, centered)
- Article metadata display (author, date, source)
- Reading progress indicator
- Proper code block formatting
- Better handling of tables

#### Reading Experience Features
- Light/dark mode toggle
- Font size adjustment controls
- Text justification options
- Line spacing adjustment
- Margin width adjustment

### Implementation Details

#### Content Processing Updates
1. Integrate readability library:
   - Mozilla's Readability.js (used in Firefox)
   - Or Postlight's Parser
   - Remove current simplistic DOM selection

2. Enhanced HTML processing:
   - Normalize heading structure
   - Process images for local caching
   - Handle relative URL conversion to absolute
   - Add proper sanitization step

#### UI Component Updates
1. Create a dedicated article view component:
   ```tsx
   // ArticleViewer.tsx
   import React from 'react';
   
   interface ArticleViewerProps {
     content: {
       title: string;
       author?: string;
       date?: string;
       featuredImage?: string;
       content: string;
     };
     settings: {
       fontSize: string;
       lineHeight: string;
       theme: 'light' | 'dark';
       width: string;
     };
     onSettingsChange: (settings: any) => void;
   }
   
   const ArticleViewer: React.FC<ArticleViewerProps> = ({
     content,
     settings,
     onSettingsChange,
   }) => {
     // Component implementation
   };
   ```

2. Create article header component:
   ```tsx
   // ArticleHeader.tsx
   import React from 'react';
   
   interface ArticleHeaderProps {
     title: string;
     url: string;
     author?: string;
     date?: string;
     featuredImage?: string;
   }
   
   const ArticleHeader: React.FC<ArticleHeaderProps> = ({
     title,
     url,
     author,
     date,
     featuredImage,
   }) => {
     // Component implementation
   };
   ```

3. Create reading control panel:
   ```tsx
   // ReadingControls.tsx
   import React from 'react';
   
   interface ReadingControlsProps {
     settings: {
       fontSize: string;
       lineHeight: string;
       theme: 'light' | 'dark';
       width: string;
     };
     onSettingsChange: (settings: any) => void;
   }
   
   const ReadingControls: React.FC<ReadingControlsProps> = ({
     settings,
     onSettingsChange,
   }) => {
     // Component implementation
   };
   ```

#### CSS Styling Updates
Create dedicated reader mode CSS with variables for customization:

```css
.reader-view {
  --reader-bg: #ffffff;
  --reader-text: #333333;
  --reader-font: 'Merriweather', Georgia, serif;
  --reader-font-size: 18px;
  --reader-line-height: 1.6;
  --reader-width: 680px;
  
  background-color: var(--reader-bg);
  color: var(--reader-text);
  font-family: var(--reader-font);
  font-size: var(--reader-font-size);
  line-height: var(--reader-line-height);
  margin: 0 auto;
  max-width: var(--reader-width);
  padding: 24px;
}

.reader-view.dark {
  --reader-bg: #121212;
  --reader-text: #e0e0e0;
}

/* Article typography */
.reader-view h1, 
.reader-view h2, 
.reader-view h3, 
.reader-view h4, 
.reader-view h5, 
.reader-view h6 {
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.reader-view p {
  margin-bottom: 1em;
}

.reader-view img {
  max-width: 100%;
  height: auto;
  margin: 1.5em auto;
  display: block;
}

/* Article metadata */
.article-metadata {
  margin-bottom: 2em;
  font-size: 0.9em;
  color: #666;
}

/* Reading controls */
.reading-controls {
  position: fixed;
  top: 1em;
  right: 1em;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 0.5em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
```

#### Data Model Updates
Enhanced URL data structure:

```typescript
export interface UrlData {
  id?: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  featuredImage?: string;
  excerpt: string;
  content: string;
  dateAdded: string;
  tags?: string[];
}
```

### Implementation Plan
1. Integrate Mozilla's Readability or Postlight's Parser
2. Update content processor to extract enhanced metadata
3. Create reader mode CSS file
4. Build article header component for metadata display
5. Implement reading control UI
6. Update content viewer component with new functionality
7. Add settings persistence for reading preferences

## Next Steps After Reader Mode
1. Implement annotation capabilities
2. Add tagging functionality
3. Build search features
4. Implement content relationships
