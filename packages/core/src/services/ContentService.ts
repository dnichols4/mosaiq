import { IContentProcessor, ProcessedContent, IStorageProvider } from '@mosaiq/platform-abstractions';
import { ConceptClassification } from './TaxonomyService';

export interface ContentItem {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  featuredImage?: string;
  excerpt: string;
  dateAdded: string;
  tags?: string[];
  concepts?: ConceptClassification[];
}

/**
 * Service responsible for content operations
 */
export class ContentService {
  private contentProcessor: IContentProcessor;
  private metadataStorage: IStorageProvider;
  private contentStorage: IStorageProvider;
  
  constructor(
    contentProcessor: IContentProcessor,
    metadataStorage: IStorageProvider,
    contentStorage: IStorageProvider
  ) {
    this.contentProcessor = contentProcessor;
    this.metadataStorage = metadataStorage;
    this.contentStorage = contentStorage;
  }
  
  /**
   * Process and save content from a URL
   * @param url The URL to process and save
   * @returns The saved content item
   */
  async saveFromUrl(url: string): Promise<ContentItem> {
    try {
      // Process the URL to extract content
      const processedContent = await this.contentProcessor.processUrl(url);
      
      // Generate an ID for the content
      const id = this.generateId();
      
      // Store the content
      await this.contentStorage.set(id, processedContent.content);
      
      // Create and store metadata
      const contentItem: ContentItem = {
        id,
        url,
        title: processedContent.title,
        author: processedContent.author,
        publishDate: processedContent.publishDate,
        featuredImage: processedContent.featuredImage,
        excerpt: processedContent.excerpt,
        dateAdded: new Date().toISOString(),
        tags: [],
        concepts: []
      };
      
      // Get existing items or initialize empty object
      const existingItems = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      
      // Add new item
      existingItems[id] = contentItem;
      
      // Save updated metadata
      await this.metadataStorage.set('contentItems', existingItems);
      
      return contentItem;
    } catch (error) {
      console.error('Error saving content from URL:', error);
      throw error;
    }
  }
  
  /**
   * Get all content items (metadata only)
   * @returns Array of all content items
   */
  async getAllItems(): Promise<ContentItem[]> {
    try {
      const items = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      return Object.values(items);
    } catch (error) {
      console.error('Error getting all content items:', error);
      throw error;
    }
  }
  
  /**
   * Get a content item with its full content
   * @param id The ID of the content item
   * @returns The content item with full content
   */
  async getItemWithContent(id: string): Promise<ContentItem & { content: string }> {
    try {
      // Get metadata
      const items = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      const item = items[id];
      
      if (!item) {
        throw new Error(`Content item with ID ${id} not found`);
      }
      
      // Get content
      const content = await this.contentStorage.get<string>(id);
      
      if (!content) {
        throw new Error(`Content for item with ID ${id} not found`);
      }
      
      return {
        ...item,
        content
      };
    } catch (error) {
      console.error(`Error getting content item with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a content item
   * @param id The ID of the content item to delete
   */
  async deleteItem(id: string): Promise<void> {
    try {
      // Get existing items
      const items = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      
      // Check if item exists
      if (!items[id]) {
        throw new Error(`Content item with ID ${id} not found`);
      }
      
      // Remove item from metadata
      delete items[id];
      
      // Save updated metadata
      await this.metadataStorage.set('contentItems', items);
      
      // Delete content
      await this.contentStorage.delete(id);
    } catch (error) {
      console.error(`Error deleting content item with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update tags for a content item
   * @param id The ID of the content item
   * @param tags The new tags
   * @returns The updated content item
   */
  async updateTags(id: string, tags: string[]): Promise<ContentItem> {
    try {
      // Get existing items
      const items = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      
      // Check if item exists
      if (!items[id]) {
        throw new Error(`Content item with ID ${id} not found`);
      }
      
      // Update tags
      items[id].tags = tags;
      
      // Save updated metadata
      await this.metadataStorage.set('contentItems', items);
      
      return items[id];
    } catch (error) {
      console.error(`Error updating tags for content item with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update the thumbnail image for a content item
   * @param id The ID of the content item
   * @param imageUrl The new featured image URL
   * @returns The updated content item
   */
  async updateThumbnail(id: string, imageUrl: string): Promise<ContentItem> {
    try {
      // Get existing items
      const items = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      
      // Check if item exists
      if (!items[id]) {
        throw new Error(`Content item with ID ${id} not found`);
      }
      
      // Update featured image
      items[id].featuredImage = imageUrl;
      
      // Save updated metadata
      await this.metadataStorage.set('contentItems', items);
      
      return items[id];
    } catch (error) {
      console.error(`Error updating thumbnail for content item with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update concept classifications for a content item
   * @param id The ID of the content item
   * @param concepts The new concept classifications
   * @returns The updated content item
   */
  async updateConcepts(id: string, concepts: ConceptClassification[]): Promise<ContentItem> {
    try {
      // Get existing items
      const items = await this.metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
      
      // Check if item exists
      if (!items[id]) {
        throw new Error(`Content item with ID ${id} not found`);
      }
      
      // Update concepts
      items[id].concepts = concepts;
      
      // Save updated metadata
      await this.metadataStorage.set('contentItems', items);
      
      return items[id];
    } catch (error) {
      console.error(`Error updating concepts for content item with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate a unique ID
   * @returns A unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
