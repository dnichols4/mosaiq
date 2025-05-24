import { IEmbeddingService } from './IEmbeddingService';
import * as path from 'path';

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
   * @param modelPath Custom path to the model directory
   */
  constructor(modelPath: string) {
    if (!modelPath) {
      throw new Error('MiniLMEmbeddingService: modelPath is required.');
    }
    this.modelPath = modelPath;
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
    const overlapSize = 32;
    const chunkSize = this.maxSequenceLength; // This is the effective length with CLS/SEP for the model

    try {
      const tokens = this.tokenizer._tokenize(text);
      const allTokenIds = this.tokenizer.convertTokensToIds(tokens);

      // Max tokens the model can take excluding CLS and SEP
      const maxContentTokens = chunkSize - 2; 

      if (allTokenIds.length <= maxContentTokens) {
        // Text is short enough, process as a single chunk
        const modelInput = this.tokenizer.prepareInputFromIds(allTokenIds, chunkSize);
        
        const inputIdsTensor = new this.ort.Tensor('int64', modelInput.inputIds, [1, modelInput.inputIds.length]);
        const attentionMaskTensor = new this.ort.Tensor('int64', modelInput.attentionMask, [1, modelInput.attentionMask.length]);
        const tokenTypeIdsTensor = new this.ort.Tensor('int64', modelInput.tokenTypeIds, [1, modelInput.tokenTypeIds.length]);
        
        const feeds = {
          'input_ids': inputIdsTensor,
          'attention_mask': attentionMaskTensor,
          'token_type_ids': tokenTypeIdsTensor
        };
        
        const results = await this.session.run(feeds);
        const lastHiddenState = results['last_hidden_state'].data;
        
        return this.meanPooling(
          lastHiddenState, 
          modelInput.attentionMask, 
          chunkSize, // Use fixed chunk size (maxSequenceLength) for pooling
          this.dimension
        );
      } else {
        // Text is long, implement chunking
        const chunkEmbeddings: number[][] = [];
        
        for (let i = 0; i < allTokenIds.length; i += (maxContentTokens - overlapSize)) {
          const chunkContentTokenIds = allTokenIds.slice(i, i + maxContentTokens);
          
          if (chunkContentTokenIds.length === 0) continue; // Should not happen if loop condition is correct

          const modelInput = this.tokenizer.prepareInputFromIds(chunkContentTokenIds, chunkSize);
          
          const inputIdsTensor = new this.ort.Tensor('int64', modelInput.inputIds, [1, modelInput.inputIds.length]);
          const attentionMaskTensor = new this.ort.Tensor('int64', modelInput.attentionMask, [1, modelInput.attentionMask.length]);
          const tokenTypeIdsTensor = new this.ort.Tensor('int64', modelInput.tokenTypeIds, [1, modelInput.tokenTypeIds.length]);

          const feeds = {
            'input_ids': inputIdsTensor,
            'attention_mask': attentionMaskTensor,
            'token_type_ids': tokenTypeIdsTensor
          };
          
          const results = await this.session.run(feeds);
          const lastHiddenState = results['last_hidden_state'].data;
          
          const chunkEmbedding = this.meanPooling(
            lastHiddenState, 
            modelInput.attentionMask, 
            chunkSize, // Use fixed chunk size (maxSequenceLength) for pooling
            this.dimension
          );
          chunkEmbeddings.push(chunkEmbedding);

          // Break if this chunk processed all remaining tokens
          if ((i + maxContentTokens) >= allTokenIds.length) {
            break;
          }
        }

        if (chunkEmbeddings.length === 0) {
          // This case should ideally not be reached if allTokenIds.length > maxContentTokens
          // But as a fallback, return zero vector or handle error
          console.warn("No chunk embeddings generated for a long text. This might indicate an issue.");
          return new Array(this.dimension).fill(0);
        }

        // Average the embeddings from all chunks
        const finalEmbedding = new Array(this.dimension).fill(0);
        for (const emb of chunkEmbeddings) {
          for (let j = 0; j < this.dimension; j++) {
            finalEmbedding[j] += emb[j];
          }
        }
        for (let j = 0; j < this.dimension; j++) {
          finalEmbedding[j] /= chunkEmbeddings.length;
        }
        return finalEmbedding;
      }
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
