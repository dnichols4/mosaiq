import { 
  IStorageProvider, 
  IContentProcessor, 
  IPlatformCapabilities, 
  IVectorStorage, 
  IDialogService,
  IFilePickerService
} from '@mosaiq/platform-abstractions';
import { TaxonomyService, EmbeddingServiceFactory, IEmbeddingService } from '@mosaiq/core';
import { ElectronStorageAdapter } from './ElectronStorageAdapter';
import { FileSystemContentAdapter } from './FileSystemContentAdapter';
import { ElectronContentProcessor } from './ElectronContentProcessor';
import { ElectronPlatformCapabilities } from './ElectronPlatformCapabilities';
import { ElectronDialogService } from './dialog/ElectronDialogService';
import { ElectronFilePickerService } from './file/ElectronFilePickerService';
import { LocalVectorAdapter } from './LocalVectorAdapter';
import * as path from 'path';
import { app } from 'electron';

/**
 * Factory for creating adapters in the Electron environment
 */
export class AdapterFactory {
  private static taxonomyService: TaxonomyService | null = null;
  private static vectorStorage: IVectorStorage | null = null;
  private static embeddingService: IEmbeddingService | null = null;
  
  /**
   * Create a metadata storage adapter
   */
  static createMetadataStorage(): IStorageProvider {
    return new ElectronStorageAdapter({ name: 'metadata' });
  }
  
  /**
   * Create a settings storage adapter
   */
  static createSettingsStorage(): IStorageProvider {
    return new ElectronStorageAdapter({ name: 'settings' });
  }
  
  /**
   * Create a content storage adapter
   */
  static createContentStorage(): IStorageProvider {
    return new FileSystemContentAdapter({ storageDirName: 'content' });
  }
  
  /**
   * Create a taxonomy service
   */
  static async createTaxonomyService(): Promise<TaxonomyService> {
    if (!this.taxonomyService) {
      // Use the existing taxonomy file from the resources directory
      const taxonomyPath = path.join(app.getAppPath(), 'resources', 'taxonomy', 'custom_knowledge_taxonomy.json');
      this.taxonomyService = new TaxonomyService(taxonomyPath);
      
      try {
        await this.taxonomyService.loadTaxonomy();
        console.log(`Taxonomy loaded with ${this.taxonomyService.getAllConcepts().length} concepts`);
      } catch (error) {
        console.error('Error loading taxonomy:', error);
        throw error;
      }
    }
    return this.taxonomyService;
  }
  
  /**
   * Create vector storage adapter
   */
  static createVectorStorage(): IVectorStorage {
    if (!this.vectorStorage) {
      this.vectorStorage = new LocalVectorAdapter({ storageDirName: 'vectors' });
    }
    return this.vectorStorage;
  }
  
  /**
   * Create a content processor
   * @param withClassification Whether to enable automatic classification
   */
  static async createContentProcessor(withClassification: boolean = true): Promise<IContentProcessor> {
    // Basic processor without classification
    if (!withClassification) {
      return new ElectronContentProcessor();
    }
    
    // Enhanced processor with classification capabilities
    try {
      const taxonomyService = await this.createTaxonomyService();
      const vectorStorage = this.createVectorStorage();
      const processor = new ElectronContentProcessor(taxonomyService, vectorStorage);
      
      // Initialize classification in background
      processor.initializeClassification().catch(error => {
        console.error('Failed to initialize classification in background:', error);
      });
      
      return processor;
    } catch (error) {
      console.error('Error creating content processor with classification:', error);
      
      // Fall back to basic processor if classification setup fails
      return new ElectronContentProcessor();
    }
  }
  
  /**
   * Create platform capabilities
   */
  static createPlatformCapabilities(): IPlatformCapabilities {
    return new ElectronPlatformCapabilities();
  }
  
  /**
   * Create dialog service
   */
  static createDialogService(): IDialogService {
    return new ElectronDialogService();
  }
  
  /**
   * Create file picker service
   */
  static createFilePickerService(): IFilePickerService {
    return new ElectronFilePickerService();
  }
  
  /**
   * Release resources used by adapters
   */
  static async releaseResources(): Promise<void> {
    if (this.taxonomyService) {
      this.taxonomyService = null;
    }
    
    if (this.vectorStorage) {
      await this.vectorStorage.clearAll();
      this.vectorStorage = null;
    }

    if (this.embeddingService) {
      await this.embeddingService.dispose();
      this.embeddingService = null;
    }
  }

  /**
   * Create an embedding service
   */
  static async createEmbeddingService(): Promise<IEmbeddingService> {
    if (!this.embeddingService) {
      // Determine the model path using Electron's app.getAppPath()
      // This is the correct place for platform-specific path resolution
      const modelBasePath = path.join(app.getAppPath(), 'resources', 'models');
      const miniLmModelPath = path.join(modelBasePath, 'minilm');

      // Get the EmbeddingServiceFactory instance
      const factory = EmbeddingServiceFactory.getInstance();
      
      // Get the MiniLM service, providing the mandatory modelPath
      this.embeddingService = await factory.getService('minilm', miniLmModelPath);
    }
    return this.embeddingService;
  }
}
