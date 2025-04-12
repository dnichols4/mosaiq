import * as fs from 'fs';
import * as path from 'path';
import { LocalVectorAdapter } from '../LocalVectorAdapter';

// Mock the Electron app module
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/app/data/path')
  }
}));

// Mock filesystem operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  unlinkSync: jest.fn()
}));

describe('LocalVectorAdapter', () => {
  let adapter: LocalVectorAdapter;
  const storageDirName = 'test-vectors';
  const testVectorId = 'test-vector-1';
  const testVector = [0.1, 0.2, 0.3, 0.4, 0.5];
  const testMetadata = { label: 'test', category: 'testing' };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock existsSync to return true for directory existence check
    (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
      if (path.endsWith(storageDirName)) {
        return true; // Directory exists
      }
      return false; // Files don't exist by default
    });
    
    // Mock readdirSync to return empty array by default
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    
    // Create adapter instance
    adapter = new LocalVectorAdapter({ storageDirName });
  });
  
  describe('constructor', () => {
    test('should create directory if it does not exist', () => {
      // Mock directory doesn't exist
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Create new adapter
      new LocalVectorAdapter({ storageDirName });
      
      // Check if directory was created
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(storageDirName),
        { recursive: true }
      );
    });
    
    test('should not create directory if it exists', () => {
      // Directory already exists (default mock)
      
      // Create new adapter
      new LocalVectorAdapter({ storageDirName });
      
      // Check directory was not created
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });
  
  describe('storeVector', () => {
    test('should save vector data and metadata', async () => {
      await adapter.storeVector(testVectorId, testVector, testMetadata);
      
      // Should write vector file
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${testVectorId}.vec`),
        expect.any(Uint8Array)
      );
      
      // Should write metadata file
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('metadata.json'),
        expect.any(String),
        'utf-8'
      );
    });
    
    test('should save vector without metadata', async () => {
      await adapter.storeVector(testVectorId, testVector);
      
      // Should write vector file
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${testVectorId}.vec`),
        expect.any(Uint8Array)
      );
      
      // Should not write metadata file
      expect(fs.writeFileSync).not.toHaveBeenCalledWith(
        expect.stringContaining('metadata.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });
  
  describe('getVector', () => {
    test('should return null if vector does not exist', async () => {
      // File doesn't exist (default mock)
      const result = await adapter.getVector('nonexistent');
      expect(result).toBeNull();
    });
    
    test('should retrieve vector data and metadata', async () => {
      // Mock file exists
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      
      // Mock binary data (4 bytes per float)
      const buffer = new ArrayBuffer(testVector.length * 4);
      const view = new Float32Array(buffer);
      testVector.forEach((val, i) => view[i] = val);
      
      // Mock filesystem read
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(Buffer.from(buffer));
      
      // Mock metadata in the adapter (set internally)
      (adapter as any).metadata.set(testVectorId, testMetadata);
      
      // Get the vector
      const result = await adapter.getVector(testVectorId);
      
      // Verify result
      expect(result).not.toBeNull();
      expect(result?.vector.length).toBe(testVector.length);
      expect(result?.metadata).toEqual(testMetadata);
      
      // Verify each vector value (with floating point tolerance)
      testVector.forEach((val, i) => {
        expect(result?.vector[i]).toBeCloseTo(val, 5);
      });
    });
  });
  
  describe('findSimilar', () => {
    test('should find similar vectors based on cosine similarity', async () => {
      // Mock vector IDs in storage
      const ids = ['vec1', 'vec2', 'vec3'];
      (fs.readdirSync as jest.Mock).mockReturnValueOnce(
        ids.map(id => `${id}.vec`)
      );
      
      // Mock getVector to return test vectors with different similarities
      const mockVectors = {
        'vec1': [0.5, 0.5, 0.5, 0.5], // Higher similarity
        'vec2': [0.1, 0.1, 0.1, 0.1], // Lower similarity
        'vec3': [0.8, 0.8, 0.8, 0.8]  // Highest similarity
      };
      
      // Mock the getVector method
      jest.spyOn(adapter, 'getVector').mockImplementation(async (id) => {
        return {
          vector: mockVectors[id as keyof typeof mockVectors],
          metadata: { id }
        };
      });
      
      // Search query
      const queryVector = [0.7, 0.7, 0.7, 0.7];
      
      // Find similar vectors
      const results = await adapter.findSimilar(queryVector, 2, 0.5);
      
      // Should return 2 results (limit)
      expect(results.length).toBe(2);
      
      // Results should be sorted by similarity (descending)
      expect(results[0].id).toBe('vec3'); // Highest similarity
      expect(results[1].id).toBe('vec1'); // Second highest
      
      // vec2 should be excluded due to threshold
      expect(results.some(r => r.id === 'vec2')).toBe(false);
    });
  });
  
  describe('deleteVector and clearAll', () => {
    test('should delete a specific vector', async () => {
      // Mock file exists
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      
      // Mock metadata in the adapter
      (adapter as any).metadata.set(testVectorId, testMetadata);
      
      // Delete the vector
      await adapter.deleteVector(testVectorId);
      
      // Should delete the file
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining(`${testVectorId}.vec`)
      );
      
      // Should update metadata (remove entry)
      expect((adapter as any).metadata.has(testVectorId)).toBe(false);
      
      // Should save metadata file
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('metadata.json'),
        expect.any(String),
        'utf-8'
      );
    });
    
    test('should clear all vectors', async () => {
      // Mock multiple vector files
      const vectorFiles = ['vec1.vec', 'vec2.vec', 'vec3.vec'];
      (fs.readdirSync as jest.Mock).mockReturnValueOnce(vectorFiles);
      
      // Clear all vectors
      await adapter.clearAll();
      
      // Should delete each file
      expect(fs.unlinkSync).toHaveBeenCalledTimes(vectorFiles.length);
      vectorFiles.forEach(file => {
        expect(fs.unlinkSync).toHaveBeenCalledWith(
          expect.stringContaining(file)
        );
      });
      
      // Should clear metadata
      expect((adapter as any).metadata.size).toBe(0);
      
      // Should save empty metadata
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('metadata.json'),
        expect.stringMatching(/^\{\}$/),
        'utf-8'
      );
    });
  });
});
