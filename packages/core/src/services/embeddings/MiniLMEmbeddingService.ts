import { IEmbeddingService } from './IEmbeddingService';
import * as path from 'path';
import { app } from 'electron';

/**
 * Embedding service that uses the MiniLM model for generating text embeddings
 * Implements a lightweight embedding model that can run locally
 */
export class MiniLMEmbeddingService implements IEmbeddingService {
  private modelPath: string;
  private ort: any = null;
  private tokenizer: any = null;
  private session: any = null;
  private ready: boolean = false;
  private dimension: number = 384; // MiniLM-L6 has 384 dimensions
  private modelName: string = 'all-MiniLM-L6-v2';
  private maxSequenceLength: number = 128;
  
  /**
   * Create a new MiniLM embedding service
   * @param modelPath Optional custom path to the model directory
   */
  constructor(modelPath?: string) {
    // Default path is in the app's resources directory
    this.modelPath = modelPath || path.join(app.getAppPath(), 'resources', 'models', 'minilm');
  }
  
  /**
   * Initialize the embedding service by loading the ONNX model and tokenizer
   */
  async initialize(): Promise<void> {
    try {
      // Load the ONNX runtime
      this.ort = await import('onnxruntime-node');
      
      // Load the tokenizer (using a custom tokenizer implementation for MiniLM)
      const { BertTokenizer } = await import('./tokenizers/BertTokenizer');
      const vocabPath = path.join(this.modelPath, 'vocab.txt');
      this.tokenizer = new BertTokenizer(vocabPath);
      
      // Create the session
      this.session = await this.ort.InferenceSession.create(
        path.join(this.modelPath, 'model.onnx')
      );
      
      this.ready = true;
      console.log('MiniLM embedding model initialized successfully');
    } catch (error) {
      console.error('Error initializing MiniLM embedding model:', error);
      throw error;
    }
  }
  
  /**
   * Check if the service is initialized and ready to use
   * @returns True if the service is ready, false otherwise
   */
  isReady(): boolean {
    return this.ready;
  }
  
  /**
   * Get the dimension size of the generated embeddings
   * @returns The embedding dimension (384 for MiniLM-L6)
   */
  getDimension(): number {
    return this.dimension;
  }
  
  /**
   * Get the name of the embedding model
   * @returns The model name
   */
  getModelName(): string {
    return this.modelName;
  }
  
  /**
   * Generate an embedding vector for a text
   * @param text The text to generate an embedding for
   * @returns The embedding vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    this.ensureReady();
    
    try {
      // Tokenize the input text
      const tokenized = this.tokenizer.tokenize(text, this.maxSequenceLength);
      
      // Create input tensors
      const inputIds = new this.ort.Tensor('int64', tokenized.inputIds, [1, tokenized.inputIds.length]);
      const attentionMask = new this.ort.Tensor('int64', tokenized.attentionMask, [1, tokenized.attentionMask.length]);
      const tokenTypeIds = new this.ort.Tensor('int64', tokenized.tokenTypeIds, [1, tokenized.tokenTypeIds.length]);
      
      // Run inference
      const feeds = {
        'input_ids': inputIds,
        'attention_mask': attentionMask,
        'token_type_ids': tokenTypeIds
      };
      
      const results = await this.session.run(feeds);
      
      // Extract and process the embedding
      // MiniLM uses mean pooling of the last hidden state
      const lastHiddenState = results['last_hidden_state'].data;
      const embedding = this.meanPooling(
        lastHiddenState, 
        tokenized.attentionMask, 
        tokenized.inputIds.length, 
        this.dimension
      );
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
  
  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of text strings
   * @returns Array of embedding vectors
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Process each text sequentially
    // In a future optimization, this could be batched for better performance
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
  
  /**
   * Release resources used by the embedding service
   */
  async dispose(): Promise<void> {
    if (this.session) {
      try {
        await this.session.release();
        this.session = null;
        this.ready = false;
      } catch (error) {
        console.error('Error disposing MiniLM session:', error);
        throw error;
      }
    }
  }
  
  /**
   * Ensure the service is ready before use
   * @throws Error if the service is not initialized
   */
  private ensureReady(): void {
    if (!this.ready) {
      throw new Error('MiniLM embedding service is not initialized. Call initialize() first.');
    }
  }
  
  /**
   * Perform mean pooling on the last hidden state
   * This averages the token embeddings, weighted by the attention mask
   * 
   * @param hiddenState The last hidden state from the model
   * @param attentionMask The attention mask
   * @param seqLength Sequence length
   * @param dimension Embedding dimension
   * @returns The pooled embedding
   */
  private meanPooling(
    hiddenState: Float32Array | Float64Array | any, 
    attentionMask: number[], 
    seqLength: number, 
    dimension: number
  ): number[] {
    const embedding = new Array(dimension).fill(0);
    let validTokens = 0;
    
    // Sum embeddings for each token, weighted by attention mask
    for (let i = 0; i < seqLength; i++) {
      if (attentionMask[i] === 1) {
        for (let j = 0; j < dimension; j++) {
          embedding[j] += hiddenState[i * dimension + j];
        }
        validTokens++;
      }
    }
    
    // Average the summed embeddings
    if (validTokens > 0) {
      for (let j = 0; j < dimension; j++) {
        embedding[j] /= validTokens;
      }
    }
    
    return embedding;
  }
}
