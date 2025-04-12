import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { IVectorStorage } from '@mosaiq/platform-abstractions';
import { vectorToBinary, binaryToVector } from '@mosaiq/core';

/**
 * A local implementation of the IVectorStorage interface for the Electron environment
 * Provides vector storage and similarity search functionality
 */
export class LocalVectorAdapter implements IVectorStorage {
  private basePath: string;
  private metadataFile: string;
  private metadata: Map<string, Record<string, any>>;
  
  /**
   * Create a new LocalVectorAdapter
   * @param options Configuration options for the adapter
   */
  constructor(options: { storageDirName: string }) {
    // Use app.getPath('userData') to get the standard Electron app data directory
    this.basePath = path.join(app.getPath('userData'), options.storageDirName);
    this.metadataFile = path.join(this.basePath, 'metadata.json');
    this.metadata = new Map();
    
    // Ensure storage directory exists
    this.ensureDirectoryExists();
    
    // Load existing metadata
    this.loadMetadata();
  }
  
  /**
   * Store a vector embedding
   * @param id Unique identifier for the vector
   * @param vector The vector data as an array of numbers
   * @param metadata Optional metadata to associate with the vector
   */
  async storeVector(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    // Convert the vector to binary format for efficient storage
    const binaryData = vectorToBinary(vector);
    
    // Save the binary vector data
    const vectorPath = this.getVectorPath(id);
    fs.writeFileSync(vectorPath, binaryData);
    
    // Save metadata if provided
    if (metadata) {
      this.metadata.set(id, metadata);
      this.saveMetadata();
    }
  }
  
  /**
   * Retrieve a vector by its ID
   * @param id The vector's unique identifier
   * @returns The vector data and associated metadata, or null if not found
   */
  async getVector(id: string): Promise<{ vector: number[], metadata?: Record<string, any> } | null> {
    const vectorPath = this.getVectorPath(id);
    
    // Check if vector exists
    if (!fs.existsSync(vectorPath)) {
      return null;
    }
    
    try {
      // Read and convert the binary vector data
      const binaryData = fs.readFileSync(vectorPath);
      const vector = binaryToVector(new Uint8Array(binaryData));
      
      // Get metadata if it exists
      const metadata = this.metadata.get(id);
      
      return { vector, metadata };
    } catch (error) {
      console.error(`Error retrieving vector ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a vector and its metadata
   * @param id The vector's unique identifier
   */
  async deleteVector(id: string): Promise<void> {
    const vectorPath = this.getVectorPath(id);
    
    try {
      // Delete the vector file if it exists
      if (fs.existsSync(vectorPath)) {
        fs.unlinkSync(vectorPath);
      }
      
      // Remove metadata if it exists
      if (this.metadata.has(id)) {
        this.metadata.delete(id);
        this.saveMetadata();
      }
    } catch (error) {
      console.error(`Error deleting vector ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Find vectors similar to the provided query vector
   * @param queryVector The vector to compare against
   * @param limit Maximum number of results to return (default: 10)
   * @param threshold Minimum similarity score (0-1) (default: 0.7)
   * @returns Array of matches with similarity scores
   */
  async findSimilar(
    queryVector: number[], 
    limit: number = 10, 
    threshold: number = 0.7
  ): Promise<Array<{ 
    id: string, 
    similarity: number, 
    metadata?: Record<string, any> 
  }>> {
    // Normalize the query vector
    const normalizedQuery = this.normalizeVector(queryVector);
    
    // Get all vector IDs
    const vectorIds = await this.listVectorIds();
    
    // Calculate similarities and filter results
    const results: Array<{ id: string, similarity: number, metadata?: Record<string, any> }> = [];
    
    for (const id of vectorIds) {
      const vectorData = await this.getVector(id);
      
      if (vectorData) {
        // Calculate cosine similarity
        const normalizedVector = this.normalizeVector(vectorData.vector);
        const similarity = this.calculateCosineSimilarity(normalizedQuery, normalizedVector);
        
        // Add to results if above threshold
        if (similarity >= threshold) {
          results.push({
            id,
            similarity,
            metadata: vectorData.metadata
          });
        }
      }
    }
    
    // Sort by similarity (descending) and limit results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  /**
   * Get a list of all vector IDs in storage
   * @returns Array of vector IDs
   */
  async listVectorIds(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.basePath);
      
      // Filter out non-vector files (metadata.json and any other non-.vec files)
      return files
        .filter(file => file.endsWith('.vec'))
        .map(file => path.parse(file).name);
    } catch (error) {
      console.error('Error listing vector IDs:', error);
      return [];
    }
  }
  
  /**
   * Get the total count of vectors in storage
   * @returns Number of vectors
   */
  async getCount(): Promise<number> {
    const ids = await this.listVectorIds();
    return ids.length;
  }
  
  /**
   * Clear all vectors and metadata from storage
   */
  async clearAll(): Promise<void> {
    try {
      const ids = await this.listVectorIds();
      
      // Delete all vector files
      for (const id of ids) {
        const vectorPath = this.getVectorPath(id);
        if (fs.existsSync(vectorPath)) {
          fs.unlinkSync(vectorPath);
        }
      }
      
      // Clear metadata
      this.metadata.clear();
      this.saveMetadata();
    } catch (error) {
      console.error('Error clearing vector storage:', error);
      throw error;
    }
  }
  
  /**
   * Calculate the cosine similarity between two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Similarity score (0-1)
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    
    // For normalized vectors, the dot product equals the cosine similarity
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
    }
    
    return dotProduct;
  }
  
  /**
   * Normalize a vector to unit length
   * @param vector The input vector
   * @returns Normalized vector
   */
  private normalizeVector(vector: number[]): number[] {
    // Calculate the magnitude (Euclidean norm)
    let magnitude = 0;
    for (let i = 0; i < vector.length; i++) {
      magnitude += vector[i] * vector[i];
    }
    magnitude = Math.sqrt(magnitude);
    
    // Avoid division by zero
    if (magnitude === 0) {
      return vector.map(() => 0);
    }
    
    // Normalize
    return vector.map(value => value / magnitude);
  }
  
  /**
   * Ensure the storage directory exists
   */
  private ensureDirectoryExists(): void {
    try {
      if (!fs.existsSync(this.basePath)) {
        fs.mkdirSync(this.basePath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating vector storage directory:', error);
      throw error;
    }
  }
  
  /**
   * Load metadata from file
   */
  private loadMetadata(): void {
    try {
      if (fs.existsSync(this.metadataFile)) {
        const data = fs.readFileSync(this.metadataFile, 'utf-8');
        const parsed = JSON.parse(data);
        
        // Convert the object to a Map
        this.metadata = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading vector metadata:', error);
      // Initialize with empty metadata if loading fails
      this.metadata = new Map();
    }
  }
  
  /**
   * Save metadata to file
   */
  private saveMetadata(): void {
    try {
      // Convert the Map to an object for JSON serialization
      const data = Object.fromEntries(this.metadata);
      fs.writeFileSync(this.metadataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving vector metadata:', error);
    }
  }
  
  /**
   * Get the file path for a vector
   * @param id The vector's unique identifier
   * @returns Full path to the vector file
   */
  private getVectorPath(id: string): string {
    return path.join(this.basePath, `${id}.vec`);
  }
}
