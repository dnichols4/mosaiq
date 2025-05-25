import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { IStorageProvider } from '@mosaiq/platform-abstractions';

/**
 * Adapter for file system to implement IStorageProvider for content storage
 */
export class FileSystemContentAdapter implements IStorageProvider {
  private basePath: string;
  
  constructor(options: { storageDirName: string }) {
    // Use app.getPath('userData') to get the standard Electron app data directory
    this.basePath = path.join(app.getPath('userData'), options.storageDirName);
    
    // Ensure storage directory exists
    this.ensureDirectoryExists();
  }
  
  /**
   * Get content from a file
   */
  async get<T>(key: string): Promise<T | null> {
    const filePath = this.getFilePath(key);
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return content as unknown as T;
      }
      return null;
    } catch (error) {
      console.error(`Error reading file for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Save content to a file
   */
  async set<T>(key: string, data: T): Promise<void> {
    const filePath = this.getFilePath(key);
    
    try {
      const content = typeof data === 'string' ? data : JSON.stringify(data);
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      console.error(`Error writing file for key ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a file
   */
  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file for key ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if a file exists
   */
  async has(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    return fs.existsSync(filePath);
  }
  
  /**
   * Delete all files in the storage directory
   */
  async clear(): Promise<void> {
    try {
      const files = fs.readdirSync(this.basePath);
      
      for (const file of files) {
        fs.unlinkSync(path.join(this.basePath, file));
      }
    } catch (error) {
      console.error('Error clearing storage directory:', error);
      throw error;
    }
  }
  
  /**
   * Get all file keys (filenames) in the storage directory
   */
  async keys(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.basePath);
      return files.map(file => path.parse(file).name);
    } catch (error) {
      console.error('Error getting keys from storage directory:', error);
      return [];
    }
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
      console.error('Error creating storage directory:', error);
      throw error;
    }
  }
  
  /**
   * Get the full file path for a key
   */
  private getFilePath(key: string): string {
    return path.join(this.basePath, `${key}.md`);
  }
}
