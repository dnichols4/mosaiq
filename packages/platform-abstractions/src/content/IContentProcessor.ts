/**
 * Interface for content processing operations
 * Abstracts content manipulation and extraction logic
 */
export interface IContentProcessor {
  /**
   * Process content from a URL
   * @param url The URL to process
   * @returns The processed content
   */
  processUrl(url: string): Promise<ProcessedContent>;
  
  /**
   * Process HTML content directly
   * @param html The HTML content to process
   * @param baseUrl Optional base URL for resolving relative links
   * @returns The processed content
   */
  processHtml(html: string, baseUrl?: string): Promise<ProcessedContent>;
  
  /**
   * Process content from a file
   * @param filePath The path to the file
   * @returns The processed content
   */
  processFile(filePath: string): Promise<ProcessedContent>;
  
  /**
   * Extract metadata from processed content
   * @param content The content to extract metadata from
   * @param options Optional extraction options
   * @returns The extracted metadata
   */
  extractMetadata(
    content: ProcessedContent,
    options?: {
      includeClassification?: boolean,
      classificationOptions?: any,
      signal?: AbortSignal
    }
  ): Promise<ContentMetadata>;
  
  /**
   * Classify content using available classification services
   * @param title Content title
   * @param text Content text
   * @param options Optional classification options
   * @returns Concept classifications
   */
  classifyContent(
    title: string,
    text: string,
    options?: {
      confidenceThreshold?: number,
      maxConcepts?: number,
      signal?: AbortSignal
    }
  ): Promise<ConceptClassification[]>;
  
  /**
   * Initialize classification services
   * @param force Force reinitialization
   * @returns True if initialization succeeded
   */
  initializeClassification(force?: boolean): Promise<boolean>;
}

/**
 * Interface representing processed content
 */
export interface ProcessedContent {
  /**
   * The title of the content
   */
  title: string;
  
  /**
   * The author of the content (if available)
   */
  author?: string;
  
  /**
   * The publication date of the content (if available)
   */
  publishDate?: string;
  
  /**
   * URL to the featured image (if available)
   */
  featuredImage?: string;
  
  /**
   * A short excerpt or summary of the content
   */
  excerpt: string;
  
  /**
   * The main content body (HTML)
   */
  content: string;
}

/**
 * Interface for concept classification with confidence scoring
 */
export interface ConceptClassification {
  /**
   * SKOS concept identifier from taxonomy
   */
  conceptId: string;
  
  /**
   * Value between 0-1 indicating confidence
   */
  confidence: number;
  
  /**
   * ISO timestamp of when the classification was made
   */
  classifiedAt: string;
  
  /**
   * Whether a user has verified this classification
   */
  userVerified: boolean;
}

/**
 * Interface representing content metadata
 */
export interface ContentMetadata {
  /**
   * The title of the content
   */
  title: string;
  
  /**
   * The author of the content (if available)
   */
  author?: string;
  
  /**
   * The publication date of the content (if available)
   */
  publishDate?: string;
  
  /**
   * URL to the featured image (if available)
   */
  featuredImage?: string;
  
  /**
   * A short excerpt or summary of the content
   */
  excerpt: string;
  
  /**
   * Estimated reading time in minutes
   */
  readingTime?: number;
  
  /**
   * Keywords or tags extracted from the content
   */
  keywords?: string[];
  
  /**
   * Word count of the content
   */
  wordCount?: number;
  
  /**
   * Language of the content
   */
  language?: string;
  
  /**
   * Automatically assigned taxonomy concepts
   */
  concepts?: ConceptClassification[];
}
