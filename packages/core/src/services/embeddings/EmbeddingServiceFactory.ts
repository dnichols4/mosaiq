import { IEmbeddingService } from './IEmbeddingService';
import { MiniLMEmbeddingService } from './MiniLMEmbeddingService';

/**
 * Factory for creating embedding service instances
 * Supports different model types and manages their lifecycle
 */
export class EmbeddingServiceFactory {
  private static instance: EmbeddingServiceFactory;
  private services: Map<string, IEmbeddingService> = new Map();
  
  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): EmbeddingServiceFactory {
    if (!EmbeddingServiceFactory.instance) {
      EmbeddingServiceFactory.instance = new EmbeddingServiceFactory();
    }
    return EmbeddingServiceFactory.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}
  
  /**
   * Get an embedding service of the specified type
   * Services are cached and reused if already created
   * 
   * @param type The type of embedding service to get
   * @param modelPath Optional path to model files
   * @returns The embedding service instance
   */
  async getService(type: 'minilm' | string, modelPath?: string): Promise<IEmbeddingService> {
    // For 'minilm', modelPath is now mandatory
    if (type.toLowerCase() === 'minilm' && !modelPath) {
      throw new Error('EmbeddingServiceFactory: modelPath is required for MiniLM service.');
    }

    // Check if service already exists
    if (this.services.has(type)) {
      return this.services.get(type)!;
    }
    
    // Create and initialize the service
    let service: IEmbeddingService;
    
    switch (type.toLowerCase()) {
      case 'minilm':
        // modelPath is guaranteed by the check above
        service = new MiniLMEmbeddingService(modelPath!); 
        break;
        
      // Future model types can be added here
      // case 'mpnet':
      //   // if (type.toLowerCase() === 'mpnet' && !modelPath) { // Example for other types
      //   //   throw new Error('EmbeddingServiceFactory: modelPath is required for MPNet service.');
      //   // }
      //   // service = new MPNetEmbeddingService(modelPath!);
      //   break;
        
      default:
        // Default to MiniLM, ensure modelPath is checked if this is the effective default path
        if (!modelPath) { // Check if default also implies minilm and needs a path
          throw new Error('EmbeddingServiceFactory: modelPath is required for the default MiniLM service.');
        }
        service = new MiniLMEmbeddingService(modelPath);
    }
    
    // Initialize the service
    await service.initialize();
    
    // Cache for future use
    this.services.set(type, service);
    
    return service;
  }
  
  /**
   * Dispose of a specific embedding service
   * @param type The type of service to dispose
   */
  async disposeService(type: string): Promise<void> {
    const service = this.services.get(type);
    
    if (service) {
      await service.dispose();
      this.services.delete(type);
    }
  }
  
  /**
   * Dispose of all embedding services
   */
  async disposeAll(): Promise<void> {
    for (const [type, service] of this.services.entries()) {
      await service.dispose();
      this.services.delete(type);
    }
  }
}
