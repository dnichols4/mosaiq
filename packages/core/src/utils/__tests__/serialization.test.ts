import { 
  serialize, 
  deserialize, 
  vectorToBinary, 
  binaryToVector 
} from '../serialization';

describe('Serialization Utilities', () => {
  describe('serialize and deserialize', () => {
    test('should handle primitive values', () => {
      const testCases = [
        123,
        'test string',
        true,
        null,
        undefined
      ];
      
      for (const value of testCases) {
        const serialized = serialize(value);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(value);
      }
    });
    
    test('should handle complex objects', () => {
      const obj = {
        name: 'Test',
        value: 42,
        nested: {
          key: 'value',
          list: [1, 2, 3]
        }
      };
      
      const serialized = serialize(obj);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(obj);
    });
    
    test('should handle Date objects', () => {
      const date = new Date();
      const serialized = serialize(date);
      const deserialized = deserialize(serialized);
      
      expect(deserialized instanceof Date).toBe(true);
      expect((deserialized as Date).getTime()).toBe(date.getTime());
    });
    
    test('should handle Map objects', () => {
      const map = new Map<string, any>([
        ['key1', 'value1'],
        ['key2', 42],
        ['key3', { nested: true }]
      ]);
      
      const serialized = serialize(map);
      const deserialized = deserialize(serialized);
      
      expect(deserialized instanceof Map).toBe(true);
      const deserializedMap = deserialized as Map<any, any>;
      expect(deserializedMap.size).toBe(map.size);
      expect(deserializedMap.get('key1')).toBe('value1');
      expect(deserializedMap.get('key2')).toBe(42);
      expect(deserializedMap.get('key3')).toEqual({ nested: true });
    });
    
    test('should handle Set objects', () => {
      const set = new Set([1, 'two', { three: true }]);
      
      const serialized = serialize(set);
      const deserialized = deserialize(serialized);
      
      expect(deserialized instanceof Set).toBe(true);
      const deserializedSet = deserialized as Set<any>;
      expect(deserializedSet.size).toBe(set.size);
      expect(deserializedSet.has(1)).toBe(true);
      expect(deserializedSet.has('two')).toBe(true);
      
      // Objects in sets are compared by reference, so we need to check the values
      const values = Array.from(deserializedSet.values());
      expect(values).toEqual(expect.arrayContaining([1, 'two', { three: true }]));
    });
    
    test('should handle RegExp objects', () => {
      const regex = /test-pattern/gi;
      
      const serialized = serialize(regex);
      const deserialized = deserialize(serialized);
      
      expect(deserialized instanceof RegExp).toBe(true);
      const deserializedRegExp = deserialized as RegExp;
      expect(deserializedRegExp.source).toBe(regex.source);
      expect(deserializedRegExp.flags).toBe(regex.flags);
    });
  });
  
  describe('vectorToBinary and binaryToVector', () => {
    test('should convert vectors to binary and back', () => {
      const vector = [1.1, 2.2, 3.3, 4.4, 5.5];
      
      const binary = vectorToBinary(vector);
      expect(binary instanceof Uint8Array).toBe(true);
      
      const recoveredVector = binaryToVector(binary);
      
      // Float precision may cause small differences, so we use a comparison with tolerance
      expect(recoveredVector.length).toBe(vector.length);
      for (let i = 0; i < vector.length; i++) {
        expect(recoveredVector[i]).toBeCloseTo(vector[i], 5);
      }
    });
    
    test('should handle empty vectors', () => {
      const vector: number[] = [];
      
      const binary = vectorToBinary(vector);
      expect(binary instanceof Uint8Array).toBe(true);
      expect(binary.length).toBe(0);
      
      const recoveredVector = binaryToVector(binary);
      expect(recoveredVector).toEqual([]);
    });
    
    test('should handle vectors with zeros', () => {
      const vector = [0, 0, 0, 0, 0];
      
      const binary = vectorToBinary(vector);
      const recoveredVector = binaryToVector(binary);
      
      expect(recoveredVector).toEqual(vector);
    });
  });
});
