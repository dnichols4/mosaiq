import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { IContentProcessor, ProcessedContent, ContentMetadata, ConceptClassification } from '@mosaiq/platform-abstractions';
import { ClassificationService, TaxonomyService } from '@mosaiq/core';
import { IVectorStorage } from '@mosaiq/platform-abstractions';
import { EventEmitter } from 'events';

/**
 * Classification progress event data
 */
export interface ClassificationProgressEvent {
  progress: number; // 0-100
  status: 'initializing' | 'processing' | 'completed' | 'error';
  error?: string;
  conceptsFound?: number;
}

/**
 * Implementation of content processor for Electron
 */
export class ElectronContentProcessor extends EventEmitter implements IContentProcessor {
  private classificationService: ClassificationService | null = null;
  private classificationInitialized: boolean = false;
  private classificationInitializing: boolean = false;
  
  /**
   * Create a new ElectronContentProcessor
   * @param taxonomyService Optional TaxonomyService for automatic classification
   * @param vectorStorage Optional VectorStorage for classification
   */
  constructor(
    private taxonomyService?: TaxonomyService,
    private vectorStorage?: IVectorStorage
  ) {
    super();
  }
  
  /**
   * Initialize the classification service if taxonomy and vector storage are available
   * @param force Force reinitialization even if already initialized
   * @returns Promise resolving to true if initialization was successful, false otherwise
   */
  async initializeClassification(force: boolean = false): Promise<boolean> {
    // If already initialized and not forced, return early
    if (this.classificationInitialized && !force) {
      return true;
    }
    
    // If already initializing, wait for it to complete
    if (this.classificationInitializing) {
      // Wait for initialization to complete (in a real implementation, use a proper promise)
      let attempts = 0;
      while (this.classificationInitializing && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return this.classificationInitialized;
    }
    
    this.classificationInitializing = true;
    
    try {
      // Emit initialization started event
      this.emit('classification-progress', {
        progress: 0,
        status: 'initializing'
      } as ClassificationProgressEvent);
      
      // Check prerequisites
      if (!this.taxonomyService || !this.vectorStorage) {
        throw new Error('Taxonomy service and vector storage are required for classification');
      }
      
      // Create classification service if needed
      if (!this.classificationService || force) {
        // Construct the absolute path to the MiniLM model directory
        const modelPath = path.join(__dirname, '..', '..', 'resources', 'models', 'minilm');

        // Check if the model path exists (optional but good practice)
        if (!fs.existsSync(modelPath)) {
          console.error(`MiniLM model path not found: ${modelPath}`);
          throw new Error(`MiniLM model directory not found at ${modelPath}`);
        }

        this.classificationService = new ClassificationService(
          this.taxonomyService,
          this.vectorStorage,
          {
            embeddingModelPath: modelPath,
          }
        );
      }
      
      // Emit progress event
      this.emit('classification-progress', {
        progress: 30,
        status: 'initializing'
      } as ClassificationProgressEvent);
      
      // Initialize the service
      await this.classificationService.initialize();
      
      // Emit completion event
      this.emit('classification-progress', {
        progress: 100,
        status: 'completed'
      } as ClassificationProgressEvent);
      
      this.classificationInitialized = true;
      console.log('Classification service initialized successfully for content processor');
      return true;
    } catch (error) {
      this.classificationService = null;
      this.classificationInitialized = false;
      
      // Emit error event
      this.emit('classification-progress', {
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      } as ClassificationProgressEvent);
      
      console.error('Failed to initialize classification service:', error);
      return false;
    } finally {
      this.classificationInitializing = false;
    }
  }
  
  /**
   * Process content from a URL
   */
  async processUrl(url: string): Promise<ProcessedContent> {
    try {
      // Fetch the URL content
      const response = await fetch(url);
      const html = await response.text();
      
      // Process the HTML
      return this.processHtml(html, url);
    } catch (error) {
      console.error('Error processing URL:', error);
      return {
        title: 'Error processing URL',
        excerpt: 'There was an error processing this URL.',
        content: '<p>Error: Could not process URL content.</p>'
      };
    }
  }
  
  /**
   * Process HTML content
   */
  async processHtml(html: string, baseUrl?: string): Promise<ProcessedContent> {
    try {
      // Use Mozilla's Readability for better content extraction
      const dom = new JSDOM(html, { url: baseUrl });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      // Parse with cheerio for additional metadata
      const $ = cheerio.load(html);
      
      // Extract metadata: author
      let author;
      const authorSelectors = [
        'meta[name="author"]',
        'meta[property="article:author"]',
        '.author',
        '.byline',
        '[rel="author"]'
      ];
      
      for (const selector of authorSelectors) {
        if (author) break;
        const authorElement = $(selector);
        if (authorElement.length) {
          author = authorElement.attr('content') || authorElement.text().trim();
        }
      }
      
      // Extract metadata: publication date
      let publishDate;
      const dateSelectors = [
        'meta[name="date"]',
        'meta[property="article:published_time"]',
        'time',
        '.published-date',
        '.post-date'
      ];
      
      for (const selector of dateSelectors) {
        if (publishDate) break;
        const dateElement = $(selector);
        if (dateElement.length) {
          publishDate = dateElement.attr('content') || 
                        dateElement.attr('datetime') || 
                        dateElement.text().trim();
        }
      }
      
      // Extract metadata: featured image
      let featuredImage;
      const imageSelectors = [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'link[rel="image_src"]'
      ];
      
      for (const selector of imageSelectors) {
        if (featuredImage) break;
        const imgElement = $(selector);
        if (imgElement.length) {
          featuredImage = imgElement.attr('content') || imgElement.attr('href');
        }
      }
      
      // If no featured image found in meta, try to get the first large image
      if (!featuredImage) {
        $('img').each((i, elem) => {
          const img = $(elem);
          const width = img.attr('width');
          const height = img.attr('height');
          
          // Only consider larger images
          if (width && height && parseInt(width) > 300 && parseInt(height) > 200) {
            featuredImage = img.attr('src');
            return false; // break the each loop
          }
        });
      }
      
      // Make sure all URLs are absolute
      if (featuredImage && !featuredImage.startsWith('http') && baseUrl) {
        const baseUrlObj = new URL(baseUrl);
        featuredImage = new URL(featuredImage, baseUrlObj.origin).toString();
      }
      
      // Process content for better reading experience
      let cleanContent = article?.content || '';
      const contentDoc = new JSDOM(cleanContent).window.document;
      
      // Process links to make them absolute and open in new tab
      if (baseUrl) {
        Array.from(contentDoc.querySelectorAll('a')).forEach(link => {
          // Make relative links absolute
          if (link.href && !link.href.startsWith('http')) {
            const baseUrlObj = new URL(baseUrl);
            link.href = new URL(link.href, baseUrlObj.origin).toString();
          }
          
          // Add target="_blank" for external links
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
      }
      
      // Process images to make URLs absolute
      if (baseUrl) {
        Array.from(contentDoc.querySelectorAll('img')).forEach(img => {
          if (img.src && !img.src.startsWith('http')) {
            const baseUrlObj = new URL(baseUrl);
            img.src = new URL(img.src, baseUrlObj.origin).toString();
          }
        });
      }
      
      // Extract excerpt
      let excerpt = article?.excerpt || '';
      if (!excerpt) {
        // Fallback to meta description
        excerpt = $('meta[name="description"]').attr('content') || 
                  $('meta[property="og:description"]').attr('content') || 
                  'No description available';
      }
      
      // Limit excerpt length
      if (excerpt.length > 200) {
        excerpt = excerpt.substring(0, 197) + '...';
      }
      
      return {
        title: article?.title || $('title').text().trim() || 'Untitled',
        author,
        publishDate,
        featuredImage,
        excerpt,
        content: contentDoc.body.innerHTML
      };
    } catch (error) {
      console.error('Error processing HTML:', error);
      return {
        title: 'Error processing content',
        excerpt: 'There was an error processing this content.',
        content: '<p>Error: Could not process HTML content.</p>'
      };
    }
  }
  
  /**
   * Process content from a file
   */
  async processFile(filePath: string): Promise<ProcessedContent> {
    try {
      // Read the file
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check file extension to determine processing
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.html' || ext === '.htm') {
        // Process as HTML
        return this.processHtml(content);
      } else if (ext === '.md') {
        // Process as Markdown
        return {
          title: path.basename(filePath, ext),
          excerpt: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          content: content
        };
      } else {
        // Treat as plain text
        return {
          title: path.basename(filePath),
          excerpt: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          content: `<pre>${content}</pre>`
        };
      }
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        title: 'Error processing file',
        excerpt: 'There was an error processing this file.',
        content: '<p>Error: Could not process file content.</p>'
      };
    }
  }
  
  /**
   * Extract metadata from processed content
   * @param content The processed content
   * @param options Optional extraction options
   * @returns The extracted metadata
   */
  async extractMetadata(
    content: ProcessedContent,
    options?: {
      includeClassification?: boolean,
      classificationOptions?: any,
      signal?: AbortSignal
    }
  ): Promise<ContentMetadata> {
    const { includeClassification = true, classificationOptions, signal } = options || {};
    
    try {
      // Calculate word count
      const wordCount = content.content
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim()
        .split(' ')
        .length;
      
      // Calculate reading time (avg reading speed: 200 words per minute)
      const readingTime = Math.ceil(wordCount / 200);
      
      // Simple language detection based on common words
      let language = 'unknown';
      const textContent = content.content.replace(/<[^>]*>/g, ' ').toLowerCase();
      
      const languageSignatures = {
        en: ['the', 'and', 'of', 'to', 'in'],
        es: ['el', 'la', 'de', 'en', 'y'],
        fr: ['le', 'la', 'de', 'et', 'des'],
        de: ['der', 'die', 'das', 'und', 'von']
      };
      
      let highestScore = 0;
      
      for (const [lang, words] of Object.entries(languageSignatures)) {
        let score = 0;
        for (const word of words) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = textContent.match(regex);
          if (matches) {
            score += matches.length;
          }
        }
        
        if (score > highestScore) {
          highestScore = score;
          language = lang;
        }
      }
      
      // Extract keywords (simple implementation)
      const keywords: string[] = [];
      const words = textContent.split(/\s+/);
      const wordFrequency: Record<string, number> = {};
      
      // Common words to ignore
      const stopWords = new Set([
        'the', 'and', 'of', 'to', 'in', 'a', 'is', 'that', 'it', 'with',
        'for', 'as', 'are', 'be', 'this', 'was', 'on', 'at', 'by', 'from'
      ]);
      
      // Count word frequency, excluding stop words and short words
      for (const word of words) {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
        }
      }
      
      // Get top keywords
      const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
      
      keywords.push(...sortedWords);
      
      // Base metadata without classification
      let metadata: ContentMetadata = {
        title: content.title,
        author: content.author,
        publishDate: content.publishDate,
        featuredImage: content.featuredImage,
        excerpt: content.excerpt,
        readingTime,
        wordCount,
        language,
        keywords,
        concepts: []
      };
      
      // Add automatic concept classification if enabled
      if (includeClassification) {
        // Check if operation was aborted
        if (signal?.aborted) {
          return metadata;
        }
        
        try {
          // Make sure classification service is initialized
          if (!this.classificationService || !this.classificationService.isReady()) {
            const initialized = await this.initializeClassification();
            if (!initialized) {
              // Return metadata without classifications
              return metadata;
            }
          }
          
          // Check if operation was aborted
          if (signal?.aborted) {
            return metadata;
          }
          
          // Perform classification with provided options
          const concepts = await this.classifyContent(
            content.title,
            textContent,
            classificationOptions
          );
          
          // Add concepts to metadata
          metadata.concepts = concepts;
          console.log(`Classified content with ${concepts.length} concepts`);
        } catch (error) {
          console.error('Error during content classification:', error);
          // Return metadata without classifications on error
        }
      }
      
      return metadata;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      
      // Return basic metadata on error
      return {
        title: content.title,
        author: content.author,
        publishDate: content.publishDate,
        featuredImage: content.featuredImage,
        excerpt: content.excerpt,
        readingTime: 1,
        wordCount: 0,
        language: 'unknown',
        keywords: [],
        concepts: []
      };
    }
  }
  
  /**
   * Clean HTML content for classification
   * Removes HTML tags and extracts meaningful text
   */
  private cleanTextForClassification(htmlContent: string): string {
    // Remove HTML tags
    let cleanText = htmlContent.replace(/<[^>]*>/g, ' ');
    
    // Remove multiple spaces and normalize whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // Remove URLs
    cleanText = cleanText.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, '');
    
    // Remove email addresses
    cleanText = cleanText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    
    // Remove excessive punctuation and special characters
    cleanText = cleanText.replace(/[^\w\s.,!?;:-]/g, ' ');
    
    // Remove multiple spaces again
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  }

  /**
   * Manually classify content
   * @param title Content title
   * @param text Content text
   * @param options Optional classification options
   * @returns Concept classifications or empty array if classification is not available
   */
  async classifyContent(
    title: string, 
    text: string,
    options?: { 
      confidenceThreshold?: number, 
      maxConcepts?: number,
      signal?: AbortSignal
    }
  ): Promise<ConceptClassification[]> {
    const { confidenceThreshold, maxConcepts, signal } = options || {};
    
    // Make sure classification service is initialized
    if (!this.classificationService || !this.classificationService.isReady()) {
      this.emit('classification-progress', {
        progress: 10,
        status: 'initializing'
      } as ClassificationProgressEvent);
      
      const initialized = await this.initializeClassification();
      if (!initialized) {
        throw new Error('Failed to initialize classification service');
      }
    }
    
    if (!this.classificationService || !this.classificationService.isReady()) {
      throw new Error('Classification service is not available');
    }
    
    try {
      // Check if operation was aborted
      if (signal?.aborted) {
        throw new Error('Classification operation was aborted');
      }
      
      // Emit progress event
      this.emit('classification-progress', {
        progress: 25,
        status: 'processing'
      } as ClassificationProgressEvent);
      
      // Perform classification
      const classificationOptions: any = {};
      if (confidenceThreshold !== undefined) {
        classificationOptions.confidenceThreshold = confidenceThreshold;
      }
      if (maxConcepts !== undefined) {
        classificationOptions.maxConcepts = maxConcepts;
      }
      
      // Check if operation was aborted
      if (signal?.aborted) {
        throw new Error('Classification operation was aborted');
      }
      
      // Clean the text content for better classification
      const cleanTitle = title.trim();
      const cleanText = this.cleanTextForClassification(text);
      
      console.log(`[Classification Debug] Original text length: ${text.length}`);
      console.log(`[Classification Debug] Clean text length: ${cleanText.length}`);
      console.log(`[Classification Debug] Clean text preview: "${cleanText.substring(0, 200)}..."`);
      
      // Perform classification with cleaned content
      const concepts = await this.classificationService.classifyContent(cleanTitle, cleanText, classificationOptions);
      
      // Emit progress completion event
      this.emit('classification-progress', {
        progress: 100,
        status: 'completed',
        conceptsFound: concepts.length
      } as ClassificationProgressEvent);
      
      return concepts;
    } catch (error) {
      // Emit error event
      this.emit('classification-progress', {
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      } as ClassificationProgressEvent);
      
      console.error('Error during content classification:', error);
      if (signal?.aborted) {
        throw new Error('Classification operation was aborted');
      }
      throw error;
    }
  }
  
  /**
   * Check if classification is available
   * @returns True if classification is available, false otherwise
   */
  isClassificationAvailable(): boolean {
    return this.classificationInitialized && 
      !!this.classificationService && 
      this.classificationService.isReady();
  }
  
  /**
   * Get the classification service initialization status
   * @returns The initialization status
   */
  getClassificationStatus(): {
    initialized: boolean;
    initializing: boolean;
  } {
    return {
      initialized: this.classificationInitialized,
      initializing: this.classificationInitializing
    };
  }
  
  /**
   * Release resources used by the processor
   */
  async dispose(): Promise<void> {
    if (this.classificationService) {
      await this.classificationService.dispose();
      this.classificationService = null;
      this.classificationInitialized = false;
      this.classificationInitializing = false;
    }
  }
}