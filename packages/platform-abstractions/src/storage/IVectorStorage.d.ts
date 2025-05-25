/**
 * Interface for vector storage operations
 * Manages embeddings and vector operations for semantic search and AI features
 */
export interface IVectorStorage {
    /**
     * Store a vector embedding with an associated ID
     * @param id The unique identifier for the embedding
     * @param vector The vector embedding data (array of numbers)
     * @param metadata Optional metadata associated with the vector
     */
    storeVector(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
    /**
     * Retrieve a vector by its ID
     * @param id The unique identifier
     * @returns The vector data and associated metadata
     */
    getVector(id: string): Promise<{
        vector: number[];
        metadata?: Record<string, any>;
    } | null>;
    /**
     * Delete a vector by its ID
     * @param id The unique identifier
     */
    deleteVector(id: string): Promise<void>;
    /**
     * Find similar vectors using cosine similarity
     * @param queryVector The vector to compare against
     * @param limit The maximum number of results to return
     * @param threshold The minimum similarity score (0-1)
     * @returns Array of matches with IDs, similarity scores, and metadata
     */
    findSimilar(queryVector: number[], limit?: number, threshold?: number): Promise<Array<{
        id: string;
        similarity: number;
        metadata?: Record<string, any>;
    }>>;
    /**
     * List all vector IDs in storage
     * @returns Array of vector IDs
     */
    listVectorIds(): Promise<string[]>;
    /**
     * Get the total count of vectors in storage
     * @returns The number of stored vectors
     */
    getCount(): Promise<number>;
    /**
     * Clear all vectors from storage
     */
    clearAll(): Promise<void>;
}
//# sourceMappingURL=IVectorStorage.d.ts.map