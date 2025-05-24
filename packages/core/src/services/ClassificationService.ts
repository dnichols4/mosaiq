import { TaxonomyService, TaxonomyConcept, ConceptClassification } from './TaxonomyService';
import { TextBasedClassifier } from './TextBasedClassifier';
import { IVectorStorage } from '@mosaiq/platform-abstractions';
import { EmbeddingServiceFactory } from './embeddings/EmbeddingServiceFactory';
import { IEmbeddingService } from './embeddings/IEmbeddingService';

/**
 * Configuration options for the classification service
 */
export interface ClassificationOptions {
  // Classification thresholds and limits
  confidenceThreshold: number;
  maxConcepts: number;
  
  // Embedding model options
  embeddingModelType: 'minilm' | string;
  embeddingModelPath?: string;
  
  // Fusion weights for combining approaches
  textWeight: number;   // Weight for text-based approach (0-1)
  vectorWeight: number; // Weight for vector-based approach (0-1)
  
  // Performance options
  cacheEmbeddings: boolean;
  batchSize: number;
}

/**
 * Default configuration for the classification service
 */
const DEFAULT_OPTIONS: ClassificationOptions = {
  confidenceThreshold: 0.6,
  maxConcepts: 5,
  embeddingModelType: 'minilm',
  textWeight: 0.5, // Adjusted
  vectorWeight: 0.5, // Adjusted
  cacheEmbeddings: true,
  batchSize: 10
};

/**
 * Service for classifying content using a hybrid approach
 * Combines text-based analysis and vector embeddings
 */
export class ClassificationService {
  private taxonomyService: TaxonomyService;
  private textClassifier: TextBasedClassifier;
  private vectorStorage: IVectorStorage;
  private embeddingService: IEmbeddingService | null = null;
  private options: ClassificationOptions;
  private ready: boolean = false;
  
  /**
   * Create a new ClassificationService
   * 
   * @param taxonomyService The taxonomy service for concept access
   * @param vectorStorage The vector storage for embeddings
   * @param options Configuration options
   */
  constructor(
    taxonomyService: TaxonomyService,
    vectorStorage: IVectorStorage,
    options?: Partial<ClassificationOptions>
  ) {
    this.taxonomyService = taxonomyService;
    this.textClassifier = new TextBasedClassifier(taxonomyService);
    this.vectorStorage = vectorStorage;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  /**
   * Initialize the classification service
   * Loads the embedding model and generates taxonomy concept embeddings
   */
  async initialize(): Promise<void> {
    try {
      // Check if taxonomy is loaded
      const concepts = this.taxonomyService.getAllConcepts();
      if (concepts.length === 0) {
        throw new Error('Taxonomy has not been loaded. Call taxonomyService.loadTaxonomy() first.');
      }
      
      // Initialize embedding service
      const embeddingFactory = EmbeddingServiceFactory.getInstance();
      this.embeddingService = await embeddingFactory.getService(
        this.options.embeddingModelType,
        this.options.embeddingModelPath
      );
      
      // Generate concept embeddings if caching is enabled
      if (this.options.cacheEmbeddings) {
        await this.ensureConceptEmbeddings(concepts);
      }
      
      this.ready = true;
      console.log('Classification service initialized successfully');
    } catch (error) {
      console.error('Error initializing classification service:', error);
      throw error;
    }
  }
  
  /**
   * Check if the service is initialized and ready
   * @returns True if ready, false otherwise
   */
  isReady(): boolean {
    return this.ready;
  }
  
  /**
   * Ensure embeddings exist for all concepts
   * Generates and stores any missing embeddings
   * 
   * @param concepts The concepts to check
   */
  private async ensureConceptEmbeddings(concepts: TaxonomyConcept[]): Promise<void> {
    if (!this.embeddingService) {
      throw new Error('Embedding service not initialized');
    }
    
    // Check which concepts already have embeddings
    const existingEmbeddingIds = await this.vectorStorage.listVectorIds();
    const missingConcepts = concepts.filter(concept => 
      !existingEmbeddingIds.includes(`concept:${concept.id}`)
    );
    
    if (missingConcepts.length === 0) {
      console.log('All concept embeddings are already cached');
      return;
    }
    
    console.log(`Generating embeddings for ${missingConcepts.length} concepts...`);
    
    // Process in batches for better performance
    const batchSize = this.options.batchSize;
    
    for (let i = 0; i < missingConcepts.length; i += batchSize) {
      const batch = missingConcepts.slice(i, i + batchSize);
      
      // Prepare texts for embedding (concept label + definition)
      const textsToEmbed = batch.map(concept => 
        `${concept.prefLabel}: ${concept.definition}`
      );
      
      // Generate embeddings for batch
      const embeddings = await this.embeddingService.generateEmbeddings(textsToEmbed);
      
      // Store embeddings
      for (let j = 0; j < batch.length; j++) {
        const concept = batch[j];
        const embedding = embeddings[j];
        
        await this.vectorStorage.storeVector(
          `concept:${concept.id}`, 
          embedding,
          {
            conceptId: concept.id,
            label: concept.prefLabel
          }
        );
      }
      
      console.log(`Processed batch ${i/batchSize + 1}/${Math.ceil(missingConcepts.length/batchSize)}`);
    }
    
    console.log('Concept embeddings generation complete');
  }
  
  /**
   * Classify content using the hybrid approach
   * Combines text-based analysis and vector embeddings
   * 
   * @param title The content title
   * @param text The content text
   * @param options Optional override of configuration options
   * @returns Array of concept classifications with confidence scores
   */
  async classifyContent(
    title: string,
    text: string,
    options?: Partial<ClassificationOptions>
  ): Promise<ConceptClassification[]> {
    // Check if service is initialized
    if (!this.ready || !this.embeddingService) {
      throw new Error('Classification service not initialized. Call initialize() first.');
    }
    
    // Apply option overrides
    const mergedOptions = { ...this.options, ...options };
    
    // Run both classification approaches
    const textResults = await this.textClassifier.classifyContent(title, text, {
      maxConcepts: mergedOptions.maxConcepts * 2, // Get more initial suggestions
      confidenceThreshold: 1.0 // Placeholder for raw score threshold for TextBasedClassifier
    });

    // Normalize textResults confidence scores
    let normalizedTextResults = textResults;
    if (textResults.length > 0) {
      const maxTextScore = Math.max(...textResults.map(r => r.confidence));
      if (maxTextScore > 0) {
        normalizedTextResults = textResults.map(r => ({
          ...r,
          confidence: r.confidence / maxTextScore
        }));
      } else {
        // Handle case where all scores are 0 or negative
        normalizedTextResults = textResults.map(r => ({
          ...r,
          confidence: 0 // Ensure confidence is 0 if maxTextScore is 0 or less
        }));
      }
    }
    
    const vectorResults = await this.classifyWithVectors(title, text, mergedOptions);
    
    // Fuse the results
    const fusedResults = this.fuseResults(
      normalizedTextResults, // Pass normalized results
      vectorResults, 
      mergedOptions.textWeight, 
      mergedOptions.vectorWeight,
      mergedOptions.confidenceThreshold,
      mergedOptions.maxConcepts
    );
    
    return fusedResults;
  }
  
  /**
   * Classify content using vector embeddings
   * 
   * @param title The content title
   * @param text The content text
   * @param options Configuration options
   * @returns Array of concept classifications
   */
  private async classifyWithVectors(
    title: string,
    text: string,
    options: ClassificationOptions
  ): Promise<ConceptClassification[]> {
    if (!this.embeddingService) {
      throw new Error('Embedding service not initialized');
    }
    
    try {
      // Generate embedding for the content
      // Give more weight to the title by repeating it
      const contentToEmbed = `${title} ${title} ${text}`;
      const contentEmbedding = await this.embeddingService.generateEmbedding(contentToEmbed);
      
      // Find similar concept embeddings
      const similarConcepts = await this.vectorStorage.findSimilar(
        contentEmbedding,
        options.maxConcepts * 2, // Get more initial matches
        options.confidenceThreshold * 0.8 // Lower threshold for initial matches
      );
      
      // Convert to ConceptClassification objects
      return similarConcepts
        .filter(match => match.id.startsWith('concept:'))
        .map(match => ({
          conceptId: match.id.replace('concept:', ''),
          confidence: match.similarity,
          classifiedAt: new Date().toISOString(),
          userVerified: false
        }));
    } catch (error) {
      console.error('Error in vector-based classification:', error);
      // Return empty array if vector classification fails
      return [];
    }
  }
  
  /**
   * Fuse results from text-based and vector-based approaches
   * 
   * @param textResults Text-based classification results
   * @param vectorResults Vector-based classification results
   * @param textWeight Weight for text-based results
   * @param vectorWeight Weight for vector-based results
   * @param threshold Minimum confidence threshold
   * @param maxConcepts Maximum number of concepts
   * @returns Fused classification results
   */
  private fuseResults(
    textResults: ConceptClassification[],
    vectorResults: ConceptClassification[],
    textWeight: number,
    vectorWeight: number,
    threshold: number,
    maxConcepts: number
  ): ConceptClassification[] {
    // Create a map to combine results by concept ID
    const fusedMap = new Map<string, ConceptClassification>();
    
    // Normalize weights
    const totalWeight = textWeight + vectorWeight;
    const normalizedTextWeight = textWeight / totalWeight;
    const normalizedVectorWeight = vectorWeight / totalWeight;
    
    // Process text-based results
    for (const result of textResults) {
      fusedMap.set(result.conceptId, {
        ...result,
        confidence: result.confidence * normalizedTextWeight
      });
    }
    
    // Process vector-based results
    for (const result of vectorResults) {
      if (fusedMap.has(result.conceptId)) {
        // Concept exists in text results, combine scores
        const existing = fusedMap.get(result.conceptId)!;
        existing.confidence += result.confidence * normalizedVectorWeight;
      } else {
        // New concept from vector results
        fusedMap.set(result.conceptId, {
          ...result,
          confidence: result.confidence * normalizedVectorWeight
        });
      }
    }
    
    // Convert to array, filter by threshold, and sort by confidence
    const fusedResults = Array.from(fusedMap.values())
      .filter(result => result.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxConcepts);
    
    // Ensure all results have the current timestamp
    const timestamp = new Date().toISOString();
    for (const result of fusedResults) {
      result.classifiedAt = timestamp;
    }
    
    return fusedResults;
  }
  
  /**
   * Suggest classifications for a batch of content items
   * 
   * @param items Array of content items with titles and text
   * @param options Optional override of configuration options
   * @returns Map of content IDs to classification results
   */
  async batchClassify(
    items: Array<{ id: string, title: string, text: string }>,
    options?: Partial<ClassificationOptions>
  ): Promise<Map<string, ConceptClassification[]>> {
    const results = new Map<string, ConceptClassification[]>();
    
    // Process each item
    for (const item of items) {
      try {
        const classifications = await this.classifyContent(item.title, item.text, options);
        results.set(item.id, classifications);
      } catch (error) {
        console.error(`Error classifying item ${item.id}:`, error);
        results.set(item.id, []);
      }
    }
    
    return results;
  }
  
  /**
   * Release resources used by the classification service
   */
  async dispose(): Promise<void> {
    if (this.embeddingService) {
      const embeddingFactory = EmbeddingServiceFactory.getInstance();
      await embeddingFactory.disposeService(this.options.embeddingModelType);
      this.embeddingService = null;
    }
    
    this.ready = false;
  }
}
