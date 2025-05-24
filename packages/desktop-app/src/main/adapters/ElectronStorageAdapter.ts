import ElectronStore from 'electron-store';
import { IStorageProvider } from '@mosaiq/platform-abstractions';

/**
 * Adapter for Electron-store to implement IStorageProvider
 */
export class ElectronStorageAdapter implements IStorageProvider {
  private store: ElectronStore;
  
  constructor(options: { name: string }) {
    this.store = new ElectronStore({ name: options.name });
  }
  
  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    const value = this.store.get(key) as T | undefined;
    return value !== undefined ? value : null;
  }
  
  /**
   * Set a value in storage
   */
  async set<T>(key: string, data: T): Promise<void> {
    this.store.set(key, data);
  }
  
  /**
   * Delete a value from storage
   */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  /**
   * Check if a key exists in storage
   */
  async containsKey(key: string): Promise<boolean> {
    return this.store.has(key);
  }
  
  /**
   * Clear all values from storage
   */
  async clear(): Promise<void> {
    this.store.clear();
  }
  
  /**
   * Get all keys in storage
   */
  async keys(): Promise<string[]> {
    return Object.keys(this.store.store);
  }
}
