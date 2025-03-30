# DBpedia Article Categories Integration Plan
## Implementation Document v1.0

| Version | Date | Changes | 
|---------|------|---------|
| 1.0 | 2025-03-29 | Initial document creation |

## Table of Contents
1. [Introduction](#introduction)
2. [File Storage Strategy](#file-storage-strategy)
3. [Platform Abstraction Layer](#platform-abstraction-layer)
4. [Core Implementation](#core-implementation)
5. [Electron-specific Implementation](#electron-specific-implementation)
6. [Performance Optimizations](#performance-optimizations)
7. [IPC Integration](#ipc-integration)
8. [Preload Script Updates](#preload-script-updates)
9. [React Hook for Taxonomy Integration](#react-hook-for-taxonomy-integration)
10. [Phase 2: LLM Integration](#phase-2-llm-integration)
11. [UI Component for Category Selection](#ui-component-for-category-selection)
12. [CSS for Category Selector](#css-for-category-selector)
13. [Usage Example](#usage-example)

## Introduction

This document outlines the implementation plan for integrating the DBpedia article-categories dataset into the Mosaiq application. The plan uses the TTL (Turtle) format for the dataset, which offers better JavaScript/TypeScript ecosystem support, human readability, simplicity, processing efficiency, and compatibility with the application's local-first architecture.

## File Storage Strategy

### Development Environment
```
mosaiq/
└── resources/
    └── taxonomy/
        └── dbpedia-article-categories.ttl  # The TTL file
```

### Production Environment
Store the file in the application's user data directory:

```typescript
// In main process initialization
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const appDataPath = app.getPath('userData');
const taxonomyDataPath = path.join(appDataPath, 'taxonomy');

// Create directory if needed
if (!fs.existsSync(taxonomyDataPath)) {
  fs.mkdirSync(taxonomyDataPath, { recursive: true });
}

// Copy TTL file from resources if it doesn't exist in user data
const sourceTtlPath = path.join(__dirname, '..', 'resources', 'taxonomy', 'dbpedia-article-categories.ttl');
const destTtlPath = path.join(taxonomyDataPath, 'dbpedia-article-categories.ttl');

if (!fs.existsSync(destTtlPath)) {
  fs.copyFileSync(sourceTtlPath, destTtlPath);
}
```

## Platform Abstraction Layer

First, add interfaces to the platform-abstractions package:

```typescript
// packages/platform-abstractions/src/taxonomy/ITaxonomyStorage.ts
export interface ITaxonomyStorage {
  getTaxonomyFile(): Promise<string>;
}

// packages/platform-abstractions/src/taxonomy/ITaxonomyService.ts
export interface ICategoryNode {
  id: string;
  label: string;
  parentId?: string;
  children?: string[];
}

export interface ITaxonomyService {
  initialize(): Promise<void>;
  getCategory(id: string): ICategoryNode | null;
  searchCategories(query: string): ICategoryNode[];
  getRootCategories(): ICategoryNode[];
  getChildCategories(categoryId: string): ICategoryNode[];
  suggestCategoriesForContent(content: string): Promise<ICategoryNode[]>;
}
```

## Core Implementation

```typescript
// packages/core/src/services/TaxonomyService.ts
import { ITaxonomyService, ICategoryNode } from '@mosaiq/platform-abstractions/src/taxonomy/ITaxonomyService';
import { ITaxonomyStorage } from '@mosaiq/platform-abstractions/src/taxonomy/ITaxonomyStorage';
import N3 from 'n3';

export class TaxonomyService implements ITaxonomyService {
  private categories: Map<string, ICategoryNode> = new Map();
  private rootCategories: string[] = [];
  private initialized: boolean = false;

  constructor(private taxonomyStorage: ITaxonomyStorage) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Get the TTL file content
      const ttlContent = await this.taxonomyStorage.getTaxonomyFile();
      
      // Parse the TTL file using N3.js
      const parser = new N3.Parser();
      const quads = parser.parse(ttlContent);
      
      // Process the quads to build the category hierarchy
      this.processTaxonomyQuads(quads);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize taxonomy:', error);
      throw error;
    }
  }

  private processTaxonomyQuads(quads: N3.Quad[]): void {
    // Process RDF quads to build category hierarchy
    // Implementation details would depend on the exact structure of your TTL data
    // This is a simplified example
    
    for (const quad of quads) {
      const subject = quad.subject.value;
      const predicate = quad.predicate.value;
      const object = quad.object.value;
      
      // Handle category labels
      if (predicate === 'http://www.w3.org/2000/01/rdf-schema#label') {
        if (!this.categories.has(subject)) {
          this.categories.set(subject, { id: subject, label: object });
        } else {
          this.categories.get(subject)!.label = object;
        }
      } 
      // Handle hierarchy relationships
      else if (predicate === 'http://www.w3.org/2004/02/skos/core#broader') {
        // Child-parent relationship
        if (!this.categories.has(subject)) {
          this.categories.set(subject, { id: subject, parentId: object });
        } else {
          this.categories.get(subject)!.parentId = object;
        }
        
        // Add child to parent's children array
        if (!this.categories.has(object)) {
          this.categories.set(object, { id: object, children: [subject] });
        } else {
          const parent = this.categories.get(object)!;
          if (!parent.children) parent.children = [];
          if (!parent.children.includes(subject)) {
            parent.children.push(subject);
          }
        }
      }
    }
    
    // Identify root categories (those without a parent)
    this.rootCategories = Array.from(this.categories.values())
      .filter(category => !category.parentId)
      .map(category => category.id);
  }

  // Service interface implementations
  getCategory(id: string): ICategoryNode | null {
    return this.categories.get(id) || null;
  }

  searchCategories(query: string): ICategoryNode[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.categories.values())
      .filter(category => category.label.toLowerCase().includes(lowerQuery));
  }

  getRootCategories(): ICategoryNode[] {
    return this.rootCategories.map(id => this.categories.get(id)!);
  }

  getChildCategories(categoryId: string): ICategoryNode[] {
    const category = this.categories.get(categoryId);
    if (!category || !category.children) return [];
    return category.children.map(id => this.categories.get(id)!);
  }

  async suggestCategoriesForContent(content: string): Promise<ICategoryNode[]> {
    // Phase 1: Simple keyword matching
    // Phase 2: LLM integration will enhance this
    const keywords = content.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const categoryScores = new Map<string, number>();
    
    // Calculate simple relevance scores
    for (const category of this.categories.values()) {
      const categoryLower = category.label.toLowerCase();
      let score = 0;
      
      for (const keyword of keywords) {
        if (categoryLower.includes(keyword)) score += 1;
      }
      
      if (score > 0) categoryScores.set(category.id, score);
    }
    
    // Return top 5 matches
    return Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => this.categories.get(id)!);
  }
}
```

## Electron-specific Implementation

```typescript
// packages/desktop-app/src/main/adapters/ElectronTaxonomyStorage.ts
import { ITaxonomyStorage } from '@mosaiq/platform-abstractions/src/taxonomy/ITaxonomyStorage';
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export class ElectronTaxonomyStorage implements ITaxonomyStorage {
  private taxonomyFilePath: string;

  constructor() {
    const appDataPath = app.getPath('userData');
    const taxonomyDataPath = path.join(appDataPath, 'taxonomy');
    this.taxonomyFilePath = path.join(taxonomyDataPath, 'dbpedia-article-categories.ttl');
  }

  async getTaxonomyFile(): Promise<string> {
    return fs.readFile(this.taxonomyFilePath, 'utf-8');
  }
}
```

## Performance Optimizations

DBpedia's article categories is a large dataset. Implement these optimizations:

```typescript
// packages/core/src/services/TaxonomyCache.ts
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

export class TaxonomyCache {
  private cachePath: string;
  
  constructor() {
    const appDataPath = app.getPath('userData');
    this.cachePath = path.join(appDataPath, 'taxonomy', 'cache');
  }
  
  async getCachedData(key: string): Promise<any | null> {
    try {
      const data = await fs.readFile(path.join(this.cachePath, `${key}.json`), 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  
  async setCachedData(key: string, data: any): Promise<void> {
    await fs.mkdir(path.dirname(path.join(this.cachePath, `${key}.json`)), { recursive: true });
    await fs.writeFile(
      path.join(this.cachePath, `${key}.json`), 
      JSON.stringify(data)
    );
  }
}
```

Update the TaxonomyService to use the cache:

```typescript
export class TaxonomyService implements ITaxonomyService {
  // Add to constructor
  constructor(
    private taxonomyStorage: ITaxonomyStorage,
    private taxonomyCache: TaxonomyCache
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Try to load from cache first
      const cachedData = await this.taxonomyCache.getCachedData('taxonomy');
      
      if (cachedData) {
        this.categories = new Map(cachedData.categories);
        this.rootCategories = cachedData.rootCategories;
        this.initialized = true;
        return;
      }
      
      // Otherwise, process from the TTL file
      const ttlContent = await this.taxonomyStorage.getTaxonomyFile();
      
      // Process in chunks for large files
      await this.processLargeTaxonomyFile(ttlContent);
      
      // Cache the processed data
      await this.taxonomyCache.setCachedData('taxonomy', {
        categories: Array.from(this.categories.entries()),
        rootCategories: this.rootCategories
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize taxonomy:', error);
      throw error;
    }
  }

  private async processLargeTaxonomyFile(ttlContent: string): Promise<void> {
    // Process large files in chunks to avoid memory issues
    const chunkSize = 100000; // lines
    const lines = ttlContent.split('\n');
    const chunks = [];
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }
    
    for (const chunk of chunks) {
      const parser = new N3.Parser();
      const quads = parser.parse(chunk);
      this.processTaxonomyQuads(quads);
      
      // Allow other operations to proceed (prevent UI blocking)
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

## IPC Integration

```typescript
// packages/desktop-app/src/main/ipc.ts
import { ipcMain } from 'electron';

export function setupTaxonomyIpcHandlers(taxonomyService) {
  ipcMain.handle('taxonomy:get-root-categories', async () => {
    return taxonomyService.getRootCategories();
  });
  
  ipcMain.handle('taxonomy:get-category', async (_, categoryId) => {
    return taxonomyService.getCategory(categoryId);
  });
  
  ipcMain.handle('taxonomy:get-children', async (_, categoryId) => {
    return taxonomyService.getChildCategories(categoryId);
  });
  
  ipcMain.handle('taxonomy:search', async (_, query) => {
    return taxonomyService.searchCategories(query);
  });
  
  ipcMain.handle('taxonomy:suggest', async (_, content) => {
    return taxonomyService.suggestCategoriesForContent(content);
  });
}
```

## Preload Script Updates

```typescript
// packages/desktop-app/src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('taxonomy', {
  getRootCategories: () => ipcRenderer.invoke('taxonomy:get-root-categories'),
  getCategory: (id) => ipcRenderer.invoke('taxonomy:get-category', id),
  getChildCategories: (id) => ipcRenderer.invoke('taxonomy:get-children', id),
  searchCategories: (query) => ipcRenderer.invoke('taxonomy:search', query),
  suggestCategories: (content) => ipcRenderer.invoke('taxonomy:suggest', content)
});
```

## React Hook for Taxonomy Integration

```typescript
// packages/desktop-app/src/renderer/hooks/useTaxonomy.ts
import { useState, useEffect, useCallback } from 'react';

export function useTaxonomy() {
  const [rootCategories, setRootCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadRootCategories() {
      try {
        const categories = await window.taxonomy.getRootCategories();
        setRootCategories(categories);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadRootCategories();
  }, []);
  
  const getCategory = useCallback((id) => {
    return window.taxonomy.getCategory(id);
  }, []);
  
  const getChildCategories = useCallback((id) => {
    return window.taxonomy.getChildCategories(id);
  }, []);
  
  const searchCategories = useCallback((query) => {
    return window.taxonomy.searchCategories(query);
  }, []);
  
  const suggestCategoriesForContent = useCallback((content) => {
    return window.taxonomy.suggestCategories(content);
  }, []);
  
  return {
    rootCategories,
    isLoading,
    getCategory,
    getChildCategories,
    searchCategories,
    suggestCategoriesForContent
  };
}
```

## Phase 2: LLM Integration

In Phase 2, enhance the `suggestCategoriesForContent` method with LLM:

```typescript
// Updated method in TaxonomyService.ts for Phase 2
async suggestCategoriesForContent(content: string): Promise<ICategoryNode[]> {
  try {
    // Get LLM service from your service container
    const llmService = this.serviceLocator.get('llmService');
    
    // Create prompt for the LLM
    const prompt = `
    Analyze the following content and suggest the most relevant DBpedia categories:
    
    ${content.substring(0, 1500)}...
    
    Return a JSON array of category IDs that best match this content.
    `;
    
    // Get LLM response
    const response = await llmService.generateCompletion(prompt);
    
    // Parse response to get category IDs
    let categoryIds = [];
    try {
      categoryIds = JSON.parse(response.trim());
    } catch (e) {
      console.error('Failed to parse LLM response:', e);
      // Fallback to regex extraction
      const matches = response.match(/["']([^"']+)["']/g);
      if (matches) {
        categoryIds = matches.map(m => m.replace(/["']/g, ''));
      }
    }
    
    // Get the actual category objects
    return categoryIds
      .map(id => this.getCategory(id))
      .filter(cat => cat !== null);
  } catch (error) {
    console.error('Error using LLM for category suggestions:', error);
    // Fall back to the simpler keyword-based approach
    return this.fallbackSuggestCategories(content);
  }
}
```

## UI Component for Category Selection

Create a reusable component in the common-ui package:

```typescript
// packages/common-ui/src/components/CategorySelector.tsx
import React, { useState, useEffect } from 'react';
import './CategorySelector.css';

interface Category {
  id: string;
  label: string;
}

interface CategorySelectorProps {
  onCategoriesChange: (categories: Category[]) => void;
  initialCategories?: Category[];
  contentText?: string;
  searchCategories: (query: string) => Promise<Category[]>;
  suggestCategories?: (content: string) => Promise<Category[]>;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategoriesChange,
  initialCategories = [],
  contentText,
  searchCategories,
  suggestCategories
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchCategories(searchQuery);
        setSearchResults(results);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchCategories]);

  // Load suggested categories if content is provided
  useEffect(() => {
    if (!contentText || !suggestCategories) return;

    const loadSuggestions = async () => {
      setIsLoading(true);
      try {
        const suggestions = await suggestCategories(contentText);
        setSuggestedCategories(suggestions);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [contentText, suggestCategories]);

  // Add a category
  const addCategory = (category: Category) => {
    if (!selectedCategories.some(c => c.id === category.id)) {
      const updated = [...selectedCategories, category];
      setSelectedCategories(updated);
      onCategoriesChange(updated);
    }
  };

  // Remove a category
  const removeCategory = (categoryId: string) => {
    const updated = selectedCategories.filter(c => c.id !== categoryId);
    setSelectedCategories(updated);
    onCategoriesChange(updated);
  };

  return (
    <div className="category-selector">
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="search-input"
        />
        {isLoading && <div className="loading-indicator">Loading...</div>}
      </div>

      {/* Selected categories */}
      {selectedCategories.length > 0 && (
        <div className="selected-categories">
          <h3>Selected Categories</h3>
          <div className="category-tags">
            {selectedCategories.map(category => (
              <div key={category.id} className="category-tag">
                <span>{category.label}</span>
                <button 
                  onClick={() => removeCategory(category.id)}
                  className="remove-button"
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested categories */}
      {suggestedCategories.length > 0 && (
        <div className="suggested-categories">
          <h3>Suggested Categories</h3>
          <div className="category-list">
            {suggestedCategories.map(category => (
              <div 
                key={category.id} 
                className="category-item"
                onClick={() => addCategory(category)}
              >
                {category.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="category-list">
            {searchResults.map(category => (
              <div 
                key={category.id} 
                className="category-item"
                onClick={() => addCategory(category)}
              >
                {category.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## CSS for Category Selector

```css
/* packages/common-ui/src/components/CategorySelector.css */
.category-selector {
  width: 100%;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
}

.loading-indicator {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.selected-categories,
.suggested-categories,
.search-results {
  margin-bottom: 1.5rem;
}

h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: #e0f0ff;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.remove-button {
  background: none;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
}

.remove-button:hover {
  color: #f00;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-item {
  padding: 0.5rem 0.75rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: #f0f0f0;
}
```

## Usage Example

Here's how you'd use the CategorySelector component in a content creation/editing page:

```typescript
// Example usage in a content editor component
import React, { useState } from 'react';
import { CategorySelector } from '@mosaiq/common-ui/src/components/CategorySelector';
import { useTaxonomy } from '../hooks/useTaxonomy';

const ContentEditor = () => {
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { searchCategories, suggestCategoriesForContent } = useTaxonomy();
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const handleCategoriesChange = (categories) => {
    setSelectedCategories(categories);
  };
  
  return (
    <div className="content-editor">
      <textarea 
        value={content}
        onChange={handleContentChange}
        placeholder="Enter your content here..."
        rows={10}
      />
      
      <div className="categories-section">
        <h2>Categories</h2>
        <CategorySelector
          onCategoriesChange={handleCategoriesChange}
          contentText={content}
          searchCategories={searchCategories}
          suggestCategories={suggestCategoriesForContent}
        />
      </div>
      
      <button className="save-button">Save Content</button>
    </div>
  );
};
```

## Conclusion

This implementation plan provides a complete roadmap for integrating the DBpedia article-categories dataset with the Mosaiq application. The approach aligns with the modular architecture and local-first philosophy while providing a foundation for future LLM integration. The plan covers everything from storage strategy to performance optimizations and UI components.

Next steps:
1. Create the taxonomy directories and structure
2. Implement the platform abstraction interfaces
3. Build the core taxonomy service
4. Add the Electron-specific implementations
5. Create the UI components
6. Test with sample DBpedia data before using the full dataset
