import * as fs from 'fs';

/**
 * A minimalist BERT tokenizer implementation
 * Used for tokenizing text for the MiniLM embedding model
 */
export class BertTokenizer {
  private vocab: Map<string, number>;
  private ids_to_tokens: Map<number, string>;
  private padToken = '[PAD]';
  private unkToken = '[UNK]';
  private clsToken = '[CLS]';
  private sepToken = '[SEP]';
  private padTokenId: number;
  private unkTokenId: number;
  private clsTokenId: number;
  private sepTokenId: number;
  
  /**
   * Create a new BertTokenizer
   * @param vocabPath Path to the vocabulary file
   */
  constructor(vocabPath: string) {
    // Load vocabulary
    const vocabText = fs.readFileSync(vocabPath, 'utf-8');
    const vocabLines = vocabText.split('\n').filter(line => line.trim().length > 0);
    
    // Create token-to-id and id-to-token maps
    this.vocab = new Map();
    this.ids_to_tokens = new Map();
    
    vocabLines.forEach((token, index) => {
      this.vocab.set(token, index);
      this.ids_to_tokens.set(index, token);
    });
    
    // Store special token IDs
    this.padTokenId = this.vocab.get(this.padToken) || 0;
    this.unkTokenId = this.vocab.get(this.unkToken) || 1;
    this.clsTokenId = this.vocab.get(this.clsToken) || 2;
    this.sepTokenId = this.vocab.get(this.sepToken) || 3;
  }
  
  /**
   * Tokenize a text for embedding generation
   * @param text The text to tokenize
   * @param maxLength Maximum sequence length
   * @returns The tokenized inputs
   */
  tokenize(text: string, maxLength: number = 128): {
    inputIds: number[];
    attentionMask: number[];
    tokenTypeIds: number[];
  } {
    // Normalize whitespace and text
    const normalizedText = text.trim().toLowerCase();
    
    // Tokenize text
    const tokens = this.basicTokenize(normalizedText);
    
    // Convert tokens to IDs
    const tokenIds = tokens.map(token => this.getTokenId(token));
    
    // Truncate if necessary
    const truncatedLength = Math.min(tokenIds.length, maxLength - 2); // Account for [CLS] and [SEP]
    const truncatedTokenIds = tokenIds.slice(0, truncatedLength);
    
    // Create full input IDs with special tokens
    const inputIds = [
      this.clsTokenId,
      ...truncatedTokenIds,
      this.sepTokenId
    ];
    
    // Pad to max length
    const paddingLength = maxLength - inputIds.length;
    if (paddingLength > 0) {
      const padding = new Array(paddingLength).fill(this.padTokenId);
      inputIds.push(...padding);
    }
    
    // Create attention mask (1 for real tokens, 0 for padding)
    const attentionMask = inputIds.map(id => id === this.padTokenId ? 0 : 1);
    
    // Create token type IDs (all 0s for single segment)
    const tokenTypeIds = new Array(maxLength).fill(0);
    
    return {
      inputIds,
      attentionMask,
      tokenTypeIds
    };
  }
  
  /**
   * Basic tokenization for BERT-like models
   * Splits text into wordpieces with ## prefixes
   * 
   * @param text The text to tokenize
   * @returns Array of token strings
   */
  private basicTokenize(text: string): string[] {
    // Basic splitting on whitespace and punctuation
    const words = text.split(/\s+/)
      .flatMap(word => {
        // Handle punctuation
        return word.split(/([^\w\-]+)/).filter(part => part.length > 0);
      });
    
    // Apply wordpiece tokenization
    const tokens: string[] = [];
    for (const word of words) {
      if (this.vocab.has(word)) {
        // Word exists in vocabulary, add directly
        tokens.push(word);
      } else {
        // Try to split into wordpieces
        let remaining = word;
        let isBad = false;
        let subTokens: string[] = [];
        
        while (remaining.length > 0) {
          let currentLongest = '';
          let currentLongestId = this.unkTokenId;
          
          // Try to find the longest subword
          for (let endPos = 1; endPos <= remaining.length; endPos++) {
            const subword = remaining.substring(0, endPos);
            const tokenId = this.vocab.get(subword) || 
                          (subTokens.length > 0 ? this.vocab.get('##' + subword) : undefined);
            
            if (tokenId !== undefined) {
              currentLongest = subword;
              currentLongestId = tokenId;
            }
          }
          
          // If no matching subword, mark as bad
          if (currentLongestId === this.unkTokenId) {
            isBad = true;
            break;
          }
          
          // Add the longest match
          if (subTokens.length > 0) {
            // Add ## prefix for continuations in output tokens
            subTokens.push('##' + currentLongest);
          } else {
            subTokens.push(currentLongest);
          }
          
          // Remove the used portion
          remaining = remaining.substring(currentLongest.length);
        }
        
        // Add subTokens or UNK
        if (isBad) {
          tokens.push(this.unkToken);
        } else {
          tokens.push(...subTokens);
        }
      }
    }
    
    return tokens;
  }
  
  /**
   * Get token ID from the vocabulary
   * @param token The token string
   * @returns The token ID or UNK ID if not found
   */
  private getTokenId(token: string): number {
    return this.vocab.get(token) ?? this.unkTokenId;
  }
}
