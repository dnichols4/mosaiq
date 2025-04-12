/**
 * Utility functions for data serialization and deserialization
 * Handles conversion between different data formats and storage representations
 */

/**
 * Serialize a complex object to a JSON string with special handling
 * for specific data types (e.g., Date, Map, Set)
 * 
 * @param data The data to serialize
 * @returns A JSON string representation of the data
 */
export function serialize<T>(data: T): string {
  return JSON.stringify(data, replacer);
}

/**
 * Deserialize a JSON string to its original complex object structure
 * with proper type reconstruction
 * 
 * @param jsonString The JSON string to deserialize
 * @returns The reconstructed data object
 */
export function deserialize<T>(jsonString: string): T {
  return JSON.parse(jsonString, reviver);
}

/**
 * Replacer function for JSON.stringify that handles special types
 */
function replacer(key: string, value: any): any {
  // Handle Date objects
  if (value instanceof Date) {
    return {
      __type: 'Date',
      iso: value.toISOString()
    };
  }
  
  // Handle Map objects
  if (value instanceof Map) {
    return {
      __type: 'Map',
      entries: Array.from(value.entries())
    };
  }
  
  // Handle Set objects
  if (value instanceof Set) {
    return {
      __type: 'Set',
      values: Array.from(value.values())
    };
  }
  
  // Handle ArrayBuffer (for binary data like vectors)
  if (value instanceof ArrayBuffer) {
    return {
      __type: 'ArrayBuffer',
      data: Array.from(new Uint8Array(value))
    };
  }
  
  // Handle TypedArrays (for vector data)
  if (
    value instanceof Float32Array || 
    value instanceof Float64Array
  ) {
    return {
      __type: value.constructor.name,
      data: Array.from(value)
    };
  }
  
  // Handle binary data represented as Buffer in Node.js
  if (value && typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
    return {
      __type: 'Buffer',
      data: value.data
    };
  }
  
  // Handle regular expressions
  if (value instanceof RegExp) {
    return {
      __type: 'RegExp',
      source: value.source,
      flags: value.flags
    };
  }
  
  return value;
}

/**
 * Reviver function for JSON.parse that reconstructs special types
 */
function reviver(key: string, value: any): any {
  // Skip if not an object or null
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  
  // Handle typed objects
  if (value.__type) {
    switch (value.__type) {
      case 'Date':
        return new Date(value.iso);
        
      case 'Map':
        return new Map(value.entries);
        
      case 'Set':
        return new Set(value.values);
        
      case 'ArrayBuffer':
        return new Uint8Array(value.data).buffer;
        
      case 'Float32Array':
        return new Float32Array(value.data);
        
      case 'Float64Array':
        return new Float64Array(value.data);
        
      case 'Buffer':
        return Buffer.from(value.data);
        
      case 'RegExp':
        return new RegExp(value.source, value.flags);
    }
  }
  
  return value;
}

/**
 * Convert a vector represented as an array of numbers to a binary format
 * for more efficient storage
 * 
 * @param vector The vector as an array of numbers
 * @returns The binary representation as a Uint8Array
 */
export function vectorToBinary(vector: number[]): Uint8Array {
  const buffer = new ArrayBuffer(vector.length * 4); // 4 bytes per float
  const view = new Float32Array(buffer);
  
  for (let i = 0; i < vector.length; i++) {
    view[i] = vector[i];
  }
  
  return new Uint8Array(buffer);
}

/**
 * Convert a binary representation back to a vector
 * 
 * @param binary The binary data as a Uint8Array
 * @returns The vector as an array of numbers
 */
export function binaryToVector(binary: Uint8Array): number[] {
  const view = new Float32Array(binary.buffer);
  return Array.from(view);
}

/**
 * Serialize RDF data to a string format
 * Uses the N3 library for RDF serialization
 * 
 * @param data The RDF data to serialize
 * @param format The output format (e.g., 'turtle', 'n-triples')
 * @returns A promise resolving to the serialized RDF string
 */
export async function serializeRDF(data: any, format: string = 'turtle'): Promise<string> {
  // This function will be expanded when RDF functionality is implemented
  // Currently acts as a placeholder for the interface
  return JSON.stringify(data);
}

/**
 * Deserialize an RDF string to structured data
 * 
 * @param rdfString The RDF string to parse
 * @param format The input format
 * @returns A promise resolving to the parsed RDF data
 */
export async function deserializeRDF(rdfString: string, format: string = 'turtle'): Promise<any> {
  // This function will be expanded when RDF functionality is implemented
  // Currently acts as a placeholder for the interface
  return JSON.parse(rdfString);
}
