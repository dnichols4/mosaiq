/**
 * Interface for storage providers
 * Abstracts the underlying storage mechanisms for different platforms
 */
export interface IStorageProvider {
  /**
   * Read data from storage
   * @param key The key to read from
   * @returns The data stored at the key, or null if not found
   */
  get<T>(key: string): Promise<T | null>;
  
  /**
   * Write data to storage
   * @param key The key to write to
   * @param data The data to store
   */
  set<T>(key: string, data: T): Promise<void>;
  
  /**
   * Delete data from storage
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;
  
  /**
   * Check if a key exists in storage
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Clear all data from storage
   */
  clear(): Promise<void>;
  
  /**
   * Get all keys in storage
   * @returns An array of all keys
   */
  keys(): Promise<string[]>;
}
