import { TaxonomyService, ClassificationService, ConceptClassification } from '..';
import { IVectorStorage } from '@mosaiq/platform-abstractions';

// Mock vector storage implementation for testing
class MockVectorStorage implements IVectorStorage {
  private vectors: Map<string, { vector: number[], metadata?: Record<string, any> }> = new Map();
  
  async storeVector(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    this.vectors.set(id, { vector, metadata });
  }
  
  async getVector(id: string): Promise<{ vector: number[], metadata?: Record<string, any> } | null> {
    const entry = this.vectors.get(id);
    return entry || null;
  }
  
  async deleteVector(id: string): Promise<void> {
    this.vectors.delete(id);
  }
  
  async findSimilar(
    queryVector: number[],
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<Array<{ id: string, similarity: number, metadata?: Record<string, any> }>> {
    // Simplified similarity computation for testing
    const results: Array<{ id: string, similarity: number, metadata?: Record<string, any> }> = [];
    
    for (const [id, entry] of this.vectors.entries()) {
      // Calculate a mock similarity score
      const similarity = 0.5 + Math.random() * 0.5; // Random score between 0.5 and 1.0
      
      if (similarity >= threshold) {
        results.push({
          id,
          similarity,
          metadata: entry.metadata
        });
      }
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  async listVectorIds(): Promise<string[]> {
    return Array.from(this.vectors.keys());
  }
  
  async getCount(): Promise<number> {
    return this.vectors.size;
  }
  
  async clearAll(): Promise<void> {
    this.vectors.clear();
  }
}

// Mock taxonomy service for testing
class MockTaxonomyService extends TaxonomyService {
  private mockConcepts: Record<string, any> = {
    "concept1": {
      id: "concept1",
      prefLabel: "Machine Learning",
      definition: "A field of artificial intelligence that uses statistical techniques to give computers the ability to learn from data.",
      narrower: ["concept2", "concept3"],
      inScheme: "taxonomy1"
    },
    "concept2": {
      id: "concept2",
      prefLabel: "Neural Networks",
      definition: "Computing systems inspired by the biological neural networks that constitute animal brains.",
      broader: "concept1",
      inScheme: "taxonomy1"
    },
    "concept3": {
      id: "concept3",
      prefLabel: "Decision Trees",
      definition: "A decision support tool that uses a tree-like model of decisions and their possible consequences.",
      broader: "concept1",
      inScheme: "taxonomy1"
    }
  };
  
  constructor() {
    super();
    // Override the regular loading mechanism
    this.loaded = true;
  }
  
  async loadTaxonomy(): Promise<void> {
    this.loaded = true;
    return Promise.resolve();
  }
  
  getConcept(id: string): any {
    return this.mockConcepts[id];
  }
  
  getAllConcepts(): any[] {
    return Object.values(this.mockConcepts);
  }
  
  getTopLevelConcepts(): any[] {
    return [this.mockConcepts["concept1"]];
  }
  
  getChildConcepts(conceptId: string): any[] {
    const concept = this.mockConcepts[conceptId];
    if (!concept || !concept.narrower) return [];
    
    return concept.narrower.map((id: string) => this.mockConcepts[id]);
  }
  
  getParentConcept(conceptId: string): any {
    const concept = this.mockConcepts[conceptId];
    if (!concept || !concept.broader) return undefined;
    
    return this.mockConcepts[concept.broader];
  }
  
  searchConcepts(query: string): any[] {
    return Object.values(this.mockConcepts).filter(concept => 
      concept.prefLabel.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Mock EmbeddingService
jest.mock('../services/embeddings/EmbeddingServiceFactory', () => {
  return {
    EmbeddingServiceFactory: {
      getInstance: jest.fn().mockImplementation(() => ({
        getService: jest.fn().mockResolvedValue({
          initialize: jest.fn().mockResolvedValue(undefined),
          generateEmbedding: jest.fn().mockResolvedValue(new Array(384).fill(0).map(() => Math.random())),
          generateEmbeddings: jest.fn().mockImplementation(async (texts: string[]) => {
            return texts.map(() => new Array(384).fill(0).map(() => Math.random()));
          }),
          getDimension: jest.fn().mockReturnValue(384),
          getModelName: jest.fn().mockReturnValue('mock-minilm'),
          isReady: jest.fn().mockReturnValue(true),
          dispose: jest.fn().mockResolvedValue(undefined)
        }),
        disposeService: jest.fn().mockResolvedValue(undefined)
      }))
    }
  };
});

describe('ClassificationService', () => {
  let taxonomyService: TaxonomyService;
  let vectorStorage: IVectorStorage;
  let classificationService: ClassificationService;
  
  beforeEach(async () => {
    // Set up fresh instances for each test
    taxonomyService = new MockTaxonomyService();
    vectorStorage = new MockVectorStorage();
    
    // Create and initialize the classification service
    classificationService = new ClassificationService(
      taxonomyService,
      vectorStorage,
      {
        confidenceThreshold: 0.5,
        maxConcepts: 3,
        textWeight: 0.6,
        vectorWeight: 0.4,
        embeddingModelType: 'minilm',
        cacheEmbeddings: true,
        batchSize: 2
      }
    );
    
    await classificationService.initialize();
  });
  
  test('initializes successfully', () => {
    expect(classificationService.isReady()).toBe(true);
  });
  
  test('classifies content using hybrid approach', async () => {
    const title = 'Introduction to Neural Networks';
    const text = 'Neural networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns. They can be trained to recognize patterns in data and are used in applications like image and speech recognition.';
    
    const classifications = await classificationService.classifyContent(title, text);
    
    // Verify results
    expect(classifications).toBeDefined();
    expect(Array.isArray(classifications)).toBe(true);
    
    // Check structure of classifications
    if (classifications.length > 0) {
      const classification = classifications[0];
      expect(classification).toHaveProperty('conceptId');
      expect(classification).toHaveProperty('confidence');
      expect(classification).toHaveProperty('classifiedAt');
      expect(classification).toHaveProperty('userVerified');
      expect(classification.userVerified).toBe(false);
    }
  });
  
  test('respects max concepts limit', async () => {
    const title = 'Machine Learning and Decision Trees';
    const text = 'This text discusses various machine learning techniques including neural networks and decision trees.';
    
    const classifications = await classificationService.classifyContent(title, text, {
      maxConcepts: 2
    });
    
    expect(classifications.length).toBeLessThanOrEqual(2);
  });
  
  test('filters by confidence threshold', async () => {
    const title = 'Data Science Overview';
    const text = 'A brief overview of data science concepts and techniques.';
    
    const classifications = await classificationService.classifyContent(title, text, {
      confidenceThreshold: 0.9 // Very high threshold
    });
    
    // Since our mock gives max 0.5 for text and random for vector, we expect few or no results
    for (const classification of classifications) {
      expect(classification.confidence).toBeGreaterThanOrEqual(0.9);
    }
  });
  
  test('handles batch classification', async () => {
    const items = [
      {
        id: 'item1',
        title: 'Neural Networks',
        text: 'Introduction to neural networks and deep learning.'
      },
      {
        id: 'item2',
        title: 'Decision Trees',
        text: 'How decision trees work in machine learning.'
      }
    ];
    
    const results = await classificationService.batchClassify(items);
    
    expect(results).toBeInstanceOf(Map);
    expect(results.has('item1')).toBe(true);
    expect(results.has('item2')).toBe(true);
    expect(Array.isArray(results.get('item1'))).toBe(true);
    expect(Array.isArray(results.get('item2'))).toBe(true);
  });
});
