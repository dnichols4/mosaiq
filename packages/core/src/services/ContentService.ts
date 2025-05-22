import { IContentProcessor, ProcessedContent, IStorageProvider, ConceptClassification } from '@mosaiq/platform-abstractions';
// Removed: import { ConceptClassification } from './TaxonomyService';

// TODO: Implement a data migration strategy to move existing content items
// from the old single-object storage to the new individual-item storage.
// This service now expects items to be stored with keys like 'contentItem:ID'.
const METADATA_KEY_PREFIX = 'contentItem:';

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
      
      // Store the individual content item's metadata
      await this.metadataStorage.set(METADATA_KEY_PREFIX + id, contentItem);
      
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
      const allKeys = await this.metadataStorage.keys();
      const itemKeys = allKeys.filter(key => key.startsWith(METADATA_KEY_PREFIX));
      
      const items: ContentItem[] = [];
      for (const key of itemKeys) {
        const item = await this.metadataStorage.get<ContentItem>(key);
        if (item) {
          items.push(item);
        }
      }
      return items;
    } catch (error) {
      console.error('Error getting all content items:', error);
      // Consider how to handle partial failures, for now, rethrow or return empty
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
      const item = await this.metadataStorage.get<ContentItem>(METADATA_KEY_PREFIX + id);
      
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
      // Check if item exists before attempting to delete its metadata
      // This also ensures we don't try to delete content for a non-existent metadata entry.
      const itemKey = METADATA_KEY_PREFIX + id;
      const itemExists = await this.metadataStorage.get<ContentItem>(itemKey);

      if (!itemExists) {
        // Optional: Log a warning or simply return if non-existence is acceptable for delete.
        // For now, let's maintain an error if trying to delete something not there,
        // though this behavior could be debated (e.g., delete should be idempotent).
        console.warn(`Content item with ID ${id} not found for deletion.`);
        // throw new Error(`Content item with ID ${id} not found for deletion.`); 
        // Depending on desired strictness, you might throw or just proceed to delete content.
      } else {
        // Remove item from metadata
        await this.metadataStorage.delete(itemKey);
      }
      
      // Delete content (this part remains the same)
      // Note: Consider if content should be deleted if metadata was not found.
      // Current logic: will attempt to delete content regardless of metadata presence.
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
      const itemKey = METADATA_KEY_PREFIX + id;
      const item = await this.metadataStorage.get<ContentItem>(itemKey);
      
      if (!item) {
        throw new Error(`Content item with ID ${id} not found`);
      }
      
      item.tags = tags;
      await this.metadataStorage.set(itemKey, item);
      
      return item;
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
      const itemKey = METADATA_KEY_PREFIX + id;
      const item = await this.metadataStorage.get<ContentItem>(itemKey);

      if (!item) {
        throw new Error(`Content item with ID ${id} not found`);
      }

      item.featuredImage = imageUrl;
      await this.metadataStorage.set(itemKey, item);

      return item;
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
      const itemKey = METADATA_KEY_PREFIX + id;
      const item = await this.metadataStorage.get<ContentItem>(itemKey);

      if (!item) {
        throw new Error(`Content item with ID ${id} not found`);
      }

      item.concepts = concepts;
      await this.metadataStorage.set(itemKey, item);
      
      return item;
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
