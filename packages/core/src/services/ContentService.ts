import { IContentProcessor, ProcessedContent, IStorageProvider, ContentMetadata } from '@mosaiq/platform-abstractions';
import { ConceptClassification } from './TaxonomyService';
import { EventEmitter } from 'events';

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
 * Classification progress event data
 */
export interface ClassificationProgressEvent {
  contentId: string;
  progress: number; // 0-100
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

/**
 * Service responsible for content operations
 */
export class ContentService extends EventEmitter {
  private contentProcessor: IContentProcessor;
  private metadataStorage: IStorageProvider;
  private contentStorage: IStorageProvider;
  
  // Keeps track of classification in progress
  private classificationQueue: Set<string> = new Set();
  private classificationAbortControllers: Map<string, AbortController> = new Map();
  
  /**
   * Creates a new ContentService instance
   * @param contentProcessor The content processor to use
   * @param metadataStorage The storage provider for metadata
   * @param contentStorage The storage provider for content
   * @param autoClassifyContent Whether to automatically classify content (default: true)
   */
  constructor(
    contentProcessor: IContentProcessor,
    metadataStorage: IStorageProvider,
    contentStorage: IStorageProvider,
    private autoClassifyContent: boolean = true
  ) {
    super();
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
      
      // Trigger automatic classification if enabled
      if (this.autoClassifyContent) {
        this.classifyContentItem(id).catch(error => {
          console.error(`Error during automatic classification for item ${id}:`, error);
        });
      }
      
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
   * Classify a content item using the content processor
   * @param id The ID of the content item to classify
   * @param options Optional classification options
   * @returns The updated content item with classifications
   */
  async classifyContentItem(id: string, options?: { force?: boolean }): Promise<ContentItem> {
    const force = options?.force ?? false;
    
    try {
      // Check if the item is already being classified
      if (this.classificationQueue.has(id) && !force) {
        throw new Error(`Content item with ID ${id} is already being classified`);
      }
      
      // Get the content item with its content
      const item = await this.getItemWithContent(id);
      
      // Skip if already classified and not forced
      if (!force && item.concepts && item.concepts.length > 0) {
        return item;
      }
      
      // Add to classification queue
      this.classificationQueue.add(id);
      
      // Create abort controller for cancellation
      const abortController = new AbortController();
      this.classificationAbortControllers.set(id, abortController);
      
      // Emit progress event
      this.emit('classification-progress', {
        contentId: id,
        progress: 0,
        status: 'pending'
      } as ClassificationProgressEvent);
      
      // Start classification
      this.emit('classification-progress', {
        contentId: id,
        progress: 25,
        status: 'processing'
      } as ClassificationProgressEvent);
      
      // Extract text content from HTML
      const textContent = item.content.replace(/<[^>]*>/g, ' ');
      
      // Check if aborted
      if (abortController.signal.aborted) {
        throw new Error('Classification was aborted');
      }
      
      // Perform classification
      const concepts = await this.contentProcessor.classifyContent(item.title, textContent);
      
      // Check if aborted
      if (abortController.signal.aborted) {
        throw new Error('Classification was aborted');
      }
      
      this.emit('classification-progress', {
        contentId: id,
        progress: 75,
        status: 'processing'
      } as ClassificationProgressEvent);
      
      // Update the content item with the classifications
      const updatedItem = await this.updateConcepts(id, concepts);
      
      // Remove from queue and controller map
      this.classificationQueue.delete(id);
      this.classificationAbortControllers.delete(id);
      
      // Emit completion event
      this.emit('classification-progress', {
        contentId: id,
        progress: 100,
        status: 'completed'
      } as ClassificationProgressEvent);
      
      return updatedItem;
    } catch (error) {
      // Remove from queue and controller map
      this.classificationQueue.delete(id);
      this.classificationAbortControllers.delete(id);
      
      // Emit error event
      this.emit('classification-progress', {
        contentId: id,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      } as ClassificationProgressEvent);
      
      console.error(`Error classifying content item with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cancel an in-progress classification
   * @param id The ID of the content item being classified
   * @returns True if classification was canceled, false if not found
   */
  cancelClassification(id: string): boolean {
    const controller = this.classificationAbortControllers.get(id);
    
    if (controller) {
      controller.abort();
      this.classificationQueue.delete(id);
      this.classificationAbortControllers.delete(id);
      
      // Emit cancellation event
      this.emit('classification-progress', {
        contentId: id,
        progress: 0,
        status: 'error',
        error: 'Classification was canceled'
      } as ClassificationProgressEvent);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if a content item is currently being classified
   * @param id The ID of the content item
   * @returns True if the item is being classified, false otherwise
   */
  isClassifying(id: string): boolean {
    return this.classificationQueue.has(id);
  }
  
  /**
   * Get the classification status for a content item
   * @param id The ID of the content item
   * @returns The classification status or null if not being classified
   */
  getClassificationStatus(id: string): 'pending' | 'processing' | null {
    if (!this.classificationQueue.has(id)) {
      return null;
    }
    
    // Simplified status - in a real implementation, you might store the actual status
    return 'processing';
  }
  
  /**
   * Batch reclassify multiple content items
   * @param ids Array of content item IDs to reclassify
   * @param options Optional classification options
   * @returns Map of content item IDs to success/failure status
   */
  async batchReclassify(ids: string[], options?: { force?: boolean }): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const force = options?.force ?? true;
    
    // Process each item sequentially to avoid overloading the system
    for (const id of ids) {
      try {
        await this.classifyContentItem(id, { force });
        results.set(id, true);
      } catch (error) {
        console.error(`Error reclassifying item ${id}:`, error);
        results.set(id, false);
      }
    }
    
    return results;
  }
  
  /**
   * Extract metadata from a content item
   * @param id The ID of the content item
   * @returns The extracted metadata
   */
  async extractMetadata(id: string): Promise<ContentMetadata> {
    try {
      const item = await this.getItemWithContent(id);
      return await this.contentProcessor.extractMetadata({
        title: item.title,
        author: item.author,
        publishDate: item.publishDate,
        featuredImage: item.featuredImage,
        excerpt: item.excerpt,
        content: item.content
      });
    } catch (error) {
      console.error(`Error extracting metadata for item ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Set auto-classification mode
   * @param enabled Whether to enable auto-classification
   */
  setAutoClassification(enabled: boolean): void {
    this.autoClassifyContent = enabled;
  }
  
  /**
   * Check if auto-classification is enabled
   * @returns True if auto-classification is enabled, false otherwise
   */
  isAutoClassificationEnabled(): boolean {
    return this.autoClassifyContent;
  }
  
  /**
   * Generate a unique ID
   * @returns A unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
