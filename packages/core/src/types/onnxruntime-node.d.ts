declare module 'onnxruntime-node' {
  export class InferenceSession {
    static create(modelPath: string, options?: any): Promise<InferenceSession>;
    run(feeds: any, options?: any): Promise<any>; // Adjust 'any' if more specific types are known for feeds/results
    release(): Promise<void>;
    // Add other methods/properties if known and needed, otherwise 'any' is a safe default for return types
  }

  export class Tensor {
    constructor(type: string, data: any, dims: readonly number[]);
    // Add other Tensor properties/methods if known
  }

  // Add other exports from 'onnxruntime-node' if they are used and their types can be approximated
  // For now, focus on what MiniLMEmbeddingService.ts uses: InferenceSession and Tensor.
}
