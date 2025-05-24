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
   * Internal method to tokenize text into a list of token strings.
   * Does not add special tokens or truncate.
   * @param text The text to tokenize.
   * @returns Array of token strings.
   */
  _tokenize(text: string): string[] {
    const normalizedText = text.trim().toLowerCase();
    return this.internalBasicTokenize(normalizedText);
  }

  /**
   * Converts a list of tokens into their corresponding IDs.
   * @param tokens Array of token strings.
   * @returns Array of token IDs.
   */
  convertTokensToIds(tokens: string[]): number[] {
    return tokens.map(token => this.getTokenId(token));
  }

  /**
   * Prepares model input from a slice/list of token IDs.
   * Adds special tokens (CLS, SEP), pads to maxLength, and creates attention mask.
   * @param tokenIds Slice of token IDs.
   * @param maxLength The target maximum length for the sequence.
   * @returns Model-ready input object.
   */
  prepareInputFromIds(tokenIds: number[], maxLength: number): {
    inputIds: number[];
    attentionMask: number[];
    tokenTypeIds: number[];
  } {
    // Truncate if necessary (account for [CLS] and [SEP])
    const maxTokensForInput = maxLength - 2;
    const truncatedTokenIds = tokenIds.length > maxTokensForInput 
                            ? tokenIds.slice(0, maxTokensForInput) 
                            : tokenIds;

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
   * Tokenize a text for embedding generation (legacy, for single, short segments)
   * @param text The text to tokenize
   * @param maxLength Maximum sequence length
   * @returns The tokenized inputs
   */
  tokenize(text: string, maxLength: number = 128): {
    inputIds: number[];
    attentionMask: number[];
    tokenTypeIds: number[];
  } {
    const tokens = this._tokenize(text);
    const tokenIds = this.convertTokensToIds(tokens);
    return this.prepareInputFromIds(tokenIds, maxLength);
  }
  
  /**
   * Internal basic tokenization for BERT-like models.
   * Splits text into wordpieces with ## prefixes.
   * 
   * @param text The text to tokenize
   * @returns Array of token strings
   */
  private internalBasicTokenize(text: string): string[] {
    // Basic splitting on whitespace and punctuation
    const words = text.trim().toLowerCase().split(/\s+/) // Ensure text is normalized here
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
