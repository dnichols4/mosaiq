import { ContentService, ContentItem } from './ContentService';
import { IContentProcessor, ProcessedContent, IStorageProvider } from '@mosaiq/platform-abstractions';
import { ConceptClassification } from '@mosaiq/platform-abstractions';

// Mock dependencies
// Note: jest.Mocked<T> is a helper type, actual mocking is done via jest.fn() or jest.mock()
// For this setup, we'll define objects that match the mocked interface structure.

const mockContentProcessor: jest.Mocked<IContentProcessor> = {
  processUrl: jest.fn(),
  processHtml: jest.fn(),
  processFile: jest.fn(),
  extractMetadata: jest.fn(),
  classifyContent: jest.fn(),
  initializeClassification: jest.fn(),
};

const mockMetadataStorage: jest.Mocked<IStorageProvider> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn(),
  keys: jest.fn(),
  clear: jest.fn(),
};

const mockContentStorage: jest.Mocked<IStorageProvider> = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn(),
  keys: jest.fn(),
  clear: jest.fn(),
};

// Define the METADATA_KEY_PREFIX as it's used in ContentService
const METADATA_KEY_PREFIX = 'contentItem:';

describe('ContentService', () => {
  let contentService: ContentService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks(); 
    contentService = new ContentService(
      mockContentProcessor,
      mockMetadataStorage,
      mockContentStorage
    );
  });

  describe('saveFromUrl', () => {
    it('should process URL, store content and metadata, and return the content item', async () => {
      const url = 'http://example.com';
      const processedData: ProcessedContent = {
        title: 'Test Title',
        content: 'Test content.',
        excerpt: 'Test excerpt.',
        author: 'Test Author',
        publishDate: new Date().toISOString(), // Example date
        featuredImage: 'http://example.com/image.jpg'
        //publication: 'Test Publication', // Example publication
        //readingTimeMinutes: 5, // Example reading time
      };
      mockContentProcessor.processUrl.mockResolvedValue(processedData);
      // Assuming IStorageProvider.set returns Promise<void>
      mockMetadataStorage.set.mockResolvedValue(undefined); 
      mockContentStorage.set.mockResolvedValue(undefined);

      const result = await contentService.saveFromUrl(url);

      expect(mockContentProcessor.processUrl).toHaveBeenCalledWith(url);
      expect(mockContentStorage.set).toHaveBeenCalledWith(result.id, processedData.content);
      expect(mockMetadataStorage.set).toHaveBeenCalledWith(
        `${METADATA_KEY_PREFIX}${result.id}`,
        expect.objectContaining({
          id: result.id,
          url,
          title: processedData.title,
          author: processedData.author,
          publishDate: processedData.publishDate,
          featuredImage: processedData.featuredImage,
          excerpt: processedData.excerpt,
          // dateAdded is set internally, tags and concepts initialized as empty arrays
          tags: [],
          concepts: [],
        })
      );
      expect(result.title).toBe(processedData.title);
      expect(result.url).toBe(url);
      // Verify other properties are set as expected
      expect(result.id).toBeDefined();
      expect(result.dateAdded).toBeDefined();
    });

    it('should throw an error if content processing fails', async () => {
      const url = 'http://example.com/fail';
      mockContentProcessor.processUrl.mockRejectedValue(new Error('Processing failed'));

      await expect(contentService.saveFromUrl(url)).rejects.toThrow('Processing failed');
      expect(mockMetadataStorage.set).not.toHaveBeenCalled();
      expect(mockContentStorage.set).not.toHaveBeenCalled();
    });
  });

  describe('getAllItems', () => {
    it('should return all content items when items exist', async () => {
      const item1Id = 'id1';
      const item2Id = 'id2';
      const item1: ContentItem = { id: item1Id, url: 'url1', title: 'title1', excerpt: 'e1', dateAdded: 'd1' };
      const item2: ContentItem = { id: item2Id, url: 'url2', title: 'title2', excerpt: 'e2', dateAdded: 'd2' };
      
      mockMetadataStorage.keys.mockResolvedValue([`${METADATA_KEY_PREFIX}${item1Id}`, `${METADATA_KEY_PREFIX}${item2Id}`, 'otherKey']);
      mockMetadataStorage.get.mockImplementation(async (key: string) => {
        if (key === `${METADATA_KEY_PREFIX}${item1Id}`) return item1;
        if (key === `${METADATA_KEY_PREFIX}${item2Id}`) return item2;
        return null;
      });

      const results = await contentService.getAllItems();
      expect(results).toHaveLength(2);
      expect(results).toContainEqual(item1);
      expect(results).toContainEqual(item2);
      expect(mockMetadataStorage.keys).toHaveBeenCalledTimes(1);
      expect(mockMetadataStorage.get).toHaveBeenCalledTimes(2);
    });
    
    it('should return an empty array when no content items exist (no keys with prefix)', async () => {
      mockMetadataStorage.keys.mockResolvedValue(['otherKey1', 'otherKey2']); // No keys with prefix
      const results = await contentService.getAllItems();
      expect(results).toHaveLength(0);
      expect(mockMetadataStorage.get).not.toHaveBeenCalled();
    });

    it('should return an empty array when storage is empty (keys returns empty array)', async () => {
      mockMetadataStorage.keys.mockResolvedValue([]);
      const results = await contentService.getAllItems();
      expect(results).toHaveLength(0);
      expect(mockMetadataStorage.get).not.toHaveBeenCalled();
    });

    it('should handle null items returned from storage during iteration', async () => {
      const item1Id = 'id1';
      mockMetadataStorage.keys.mockResolvedValue([`${METADATA_KEY_PREFIX}${item1Id}`, `${METADATA_KEY_PREFIX}id2ActuallyNull`]);
      mockMetadataStorage.get.mockImplementation(async (key: string) => {
        if (key === `${METADATA_KEY_PREFIX}${item1Id}`) {
            return { id: item1Id, url: 'url1', title: 'title1', excerpt: 'e1', dateAdded: 'd1' };
        }
        return null; // Simulate a case where a key exists but item is null (e.g. data corruption)
      });
      const results = await contentService.getAllItems();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(item1Id);
    });
  });

  describe('getItemWithContent', () => {
    it('should return the item with content if both metadata and content exist', async () => {
      const itemId = 'testId';
      const metadata: ContentItem = { id: itemId, url: 'url', title: 'title', excerpt: 'ex', dateAdded: 'da' };
      const content = 'Full content here';

      mockMetadataStorage.get.mockResolvedValue(metadata);
      mockContentStorage.get.mockResolvedValue(content);

      const result = await contentService.getItemWithContent(itemId);

      expect(mockMetadataStorage.get).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`);
      expect(mockContentStorage.get).toHaveBeenCalledWith(itemId);
      expect(result).toEqual({ ...metadata, content });
    });

    it('should throw an error if metadata is not found', async () => {
      const itemId = 'testId';
      mockMetadataStorage.get.mockResolvedValue(null);

      await expect(contentService.getItemWithContent(itemId)).rejects.toThrow(`Content item with ID ${itemId} not found`);
      expect(mockContentStorage.get).not.toHaveBeenCalled();
    });

    it('should throw an error if content is not found (metadata exists)', async () => {
      const itemId = 'testId';
      const metadata: ContentItem = { id: itemId, url: 'url', title: 'title', excerpt: 'ex', dateAdded: 'da' };
      mockMetadataStorage.get.mockResolvedValue(metadata);
      mockContentStorage.get.mockResolvedValue(null); // Content not found

      await expect(contentService.getItemWithContent(itemId)).rejects.toThrow(`Content for item with ID ${itemId} not found`);
    });
  });

  describe('deleteItem', () => {
    it('should delete metadata and content if item exists', async () => {
      const itemId = 'testId';
      // Simulate item existing for the check in deleteItem
      mockMetadataStorage.get.mockResolvedValue({ id: itemId, url: 'url', title: 'title', excerpt: 'ex', dateAdded: 'da' }); 
      mockMetadataStorage.delete.mockResolvedValue(undefined);
      mockContentStorage.delete.mockResolvedValue(undefined);

      await contentService.deleteItem(itemId);

      expect(mockMetadataStorage.get).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`); // For the existence check
      expect(mockMetadataStorage.delete).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`);
      expect(mockContentStorage.delete).toHaveBeenCalledWith(itemId);
    });

    it('should attempt to delete content even if metadata is not found (and log warning)', async () => {
      const itemId = 'testId';
      mockMetadataStorage.get.mockResolvedValue(null); // Simulate item not existing for the check
      
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await contentService.deleteItem(itemId);

      expect(mockMetadataStorage.get).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`);
      expect(mockMetadataStorage.delete).not.toHaveBeenCalled(); // Not called because item did not exist
      expect(mockContentStorage.delete).toHaveBeenCalledWith(itemId); // Content deletion still attempted
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Content item with ID ${itemId} not found for deletion.`);
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('updateTags', () => {
    const itemId = 'testId';
    const originalItem: ContentItem = { id: itemId, url: 'u', title: 't', excerpt: 'e', dateAdded: 'd', tags: ['old'] };
    const newTags = ['newTag1', 'newTag2'];

    it('should update tags for an existing item and return the updated item', async () => {
      mockMetadataStorage.get.mockResolvedValue({...originalItem}); // Return a copy
      mockMetadataStorage.set.mockResolvedValue(undefined);

      const result = await contentService.updateTags(itemId, newTags);

      expect(mockMetadataStorage.get).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`);
      const expectedUpdatedItem = { ...originalItem, tags: newTags };
      expect(mockMetadataStorage.set).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`, expectedUpdatedItem);
      expect(result).toEqual(expectedUpdatedItem);
    });

    it('should throw an error if item to update is not found', async () => {
      mockMetadataStorage.get.mockResolvedValue(null);
      await expect(contentService.updateTags(itemId, newTags)).rejects.toThrow(`Content item with ID ${itemId} not found`);
      expect(mockMetadataStorage.set).not.toHaveBeenCalled();
    });
  });

  // Placeholder describe blocks for other update methods
  describe('updateThumbnail', () => {
    const itemId = 'testId';
    const originalItem: ContentItem = { id: itemId, url: 'u', title: 't', excerpt: 'e', dateAdded: 'd', featuredImage: 'old.jpg' };
    const newImageUrl = 'new.jpg';

    it('should update thumbnail for an existing item', async () => {
      mockMetadataStorage.get.mockResolvedValue({...originalItem});
      mockMetadataStorage.set.mockResolvedValue(undefined);

      const result = await contentService.updateThumbnail(itemId, newImageUrl);
      
      expect(mockMetadataStorage.get).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`);
      const expectedUpdatedItem = { ...originalItem, featuredImage: newImageUrl };
      expect(mockMetadataStorage.set).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`, expectedUpdatedItem);
      expect(result).toEqual(expectedUpdatedItem);
    });

    it('should throw an error if item to update thumbnail is not found', async () => {
      mockMetadataStorage.get.mockResolvedValue(null);
      await expect(contentService.updateThumbnail(itemId, newImageUrl)).rejects.toThrow(`Content item with ID ${itemId} not found`);
    });
  });

  describe('updateConcepts', () => {
    const itemId = 'testId';
    const originalItem: ContentItem = { id: itemId, url: 'u', title: 't', excerpt: 'e', dateAdded: 'd', concepts: [] };
    const newConcepts: ConceptClassification[] = [{ conceptId: 'c1', confidence: 0.9, classifiedAt: new Date().toISOString() }];

    it('should update concepts for an existing item', async () => {
      mockMetadataStorage.get.mockResolvedValue({...originalItem});
      mockMetadataStorage.set.mockResolvedValue(undefined);

      const result = await contentService.updateConcepts(itemId, newConcepts);

      expect(mockMetadataStorage.get).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`);
      const expectedUpdatedItem = { ...originalItem, concepts: newConcepts };
      expect(mockMetadataStorage.set).toHaveBeenCalledWith(`${METADATA_KEY_PREFIX}${itemId}`, expectedUpdatedItem);
      expect(result).toEqual(expectedUpdatedItem);
    });
    
    it('should throw an error if item to update concepts is not found', async () => {
      mockMetadataStorage.get.mockResolvedValue(null);
      await expect(contentService.updateConcepts(itemId, newConcepts)).rejects.toThrow(`Content item with ID ${itemId} not found`);
    });
  });
});

// Helper for generating ProcessedContent if needed for more tests
// function createMockProcessedContent(override: Partial<ProcessedContent> = {}): ProcessedContent {
//   return {
//     title: 'Default Title',
//     content: 'Default content.',
//     excerpt: 'Default excerpt.',
//     author: 'Default Author',
//     publishDate: new Date().toISOString(),
//     featuredImage: 'http://example.com/default.jpg',
//     language: 'en',
//     publication: 'Default Publication',
//     readingTimeMinutes: 10,
//     ...override,
//   };
// }
//
// Helper for ContentItem if needed
// function createMockContentItem(id: string, override: Partial<ContentItem> = {}): ContentItem {
//   return {
//     id,
//     url: `http://example.com/${id}`,
//     title: `Title for ${id}`,
//     excerpt: `Excerpt for ${id}`,
//     dateAdded: new Date().toISOString(),
//     tags: [],
//     concepts: [],
//     ...override
//   };
// }
