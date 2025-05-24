import { TaxonomyService, TaxonomyConcept, ConceptClassification } from './TaxonomyService';

/**
 * Represents a term extracted from content with frequency and position information
 */
interface ExtractedTerm {
  term: string;
  frequency: number;
  positions: number[]; // 0 = title, >0 = paragraph numbers
  normalized: string;
}

/**
 * Position weights for term scoring
 */
interface PositionWeights {
  title: number;    // Weight for terms in title
  firstPara: number; // Weight for terms in first paragraph
  body: number;      // Weight for terms in body
}

/**
 * Match between a concept and extracted terms
 */
interface ConceptMatch {
  concept: TaxonomyConcept;
  score: number;
  matchedTerms: Array<{term: string, weight: number}>;
}

/**
 * Service for classifying content using text-based analysis
 * Uses term frequency and concept term matching
 */
export class TextBasedClassifier {
  private taxonomyService: TaxonomyService;
  private defaultWeights: PositionWeights = {
    title: 3.0,
    firstPara: 1.5,
    body: 1.0
  };
  private stopWords: Set<string>;
  
  /**
   * Create a new TextBasedClassifier
   * @param taxonomyService The taxonomy service to use
   */
  constructor(taxonomyService: TaxonomyService) {
    this.taxonomyService = taxonomyService;
    this.stopWords = this.initializeStopWords();
  }
  
  /**
   * Classify content using text-based analysis
   * 
   * @param title The content title
   * @param text The content text
   * @param options Optional classification options
   * @returns Array of concept classifications with confidence scores
   */
  async classifyContent(
    title: string,
    text: string,
    options: {
      maxConcepts?: number,
      confidenceThreshold?: number,
      positionWeights?: PositionWeights
    } = {}
  ): Promise<ConceptClassification[]> {
    // Set default options
    const {
      maxConcepts = 5,
      confidenceThreshold = 0.6,
      positionWeights = this.defaultWeights
    } = options;
    
    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    
    // Extract terms from content
    const extractedTerms = this.extractTerms(title, paragraphs);
    
    // Match terms against concepts
    const conceptMatches = await this.matchTermsToConcepts(extractedTerms, positionWeights, confidenceThreshold);
    
    // Calculate confidence scores
    const classifications = this.calculateConfidence(conceptMatches, confidenceThreshold, maxConcepts);
    
    return classifications;
  }
  
  /**
   * Extract terms from content, tracking frequency and position
   * 
   * @param title The content title
   * @param paragraphs Array of content paragraphs
   * @returns Array of extracted terms with metadata
   */
  private extractTerms(title: string, paragraphs: string[]): ExtractedTerm[] {
    const termMap = new Map<string, ExtractedTerm>();
    
    // Process title (position 0)
    this.processTextSegment(title, 0, termMap);
    
    // Process paragraphs (positions 1+)
    paragraphs.forEach((para, index) => {
      this.processTextSegment(para, index + 1, termMap);
    });
    
    return Array.from(termMap.values());
  }
  
  /**
   * Process a text segment to extract terms
   * 
   * @param text The text segment to process
   * @param position The position index (0 for title, >0 for paragraphs)
   * @param termMap The map of terms being built
   */
  private processTextSegment(text: string, position: number, termMap: Map<string, ExtractedTerm>): void {
    // Normalize and tokenize the text
    const normalizedText = text.toLowerCase().trim();
    
    // Basic tokenization with handling for punctuation, special characters
    const tokens = normalizedText
      .replace(/[^\w\s-]/g, ' ') // Replace punctuation with space
      .split(/\s+/)              // Split on whitespace
      .filter(token => 
        token.length >= 3 &&   // Ignore very short tokens
        !this.stopWords.has(token) // Ignore stopwords
      );
    
    // Extract single tokens
    for (const token of tokens) {
      this.addOrUpdateTerm(token, position, termMap);
    }
    
    // Extract bigrams (pairs of adjacent words)
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      this.addOrUpdateTerm(bigram, position, termMap);
    }
    
    // Extract trigrams (triplets of adjacent words) for longer phrases
    for (let i = 0; i < tokens.length - 2; i++) {
      const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
      this.addOrUpdateTerm(trigram, position, termMap);
    }
  }
  
  /**
   * Add or update a term in the term map
   * 
   * @param term The term to add or update
   * @param position The position where the term appears
   * @param termMap The map of terms being built
   */
  private addOrUpdateTerm(term: string, position: number, termMap: Map<string, ExtractedTerm>): void {
    const normalized = term.toLowerCase().trim();
    
    if (termMap.has(normalized)) {
      // Update existing term
      const extractedTerm = termMap.get(normalized)!;
      extractedTerm.frequency += 1;
      if (!extractedTerm.positions.includes(position)) {
        extractedTerm.positions.push(position);
      }
    } else {
      // Add new term
      termMap.set(normalized, {
        term: term,
        normalized: normalized,
        frequency: 1,
        positions: [position]
      });
    }
  }
  
  /**
   * Match extracted terms against taxonomy concepts
   * 
   * @param terms The extracted terms
   * @param weights Position weights for scoring
   * @returns Array of concept matches with scores
   */
  private async matchTermsToConcepts(
    terms: ExtractedTerm[],
    weights: PositionWeights,
    confidenceThreshold: number // Added confidenceThreshold
  ): Promise<ConceptMatch[]> {
    const concepts = this.taxonomyService.getAllConcepts();
    const conceptMatches: ConceptMatch[] = [];
    
    // For each concept, find matching terms and calculate a score
    for (const concept of concepts) {
      const matchResult = this.scoreConceptMatch(concept, terms, weights);
      
      if (matchResult.score > 0) {
        conceptMatches.push(matchResult);
      }
    }
    
    // Apply bonus for related concepts
    const relatedScoreBonusFactor = 0.1; // 10% bonus
    const relatedScoreThresholdFactor = 0.5; // Related concept's score must be at least 50% of the main confidence threshold
    const relatedConceptsThreshold = confidenceThreshold * relatedScoreThresholdFactor;

    for (const match of conceptMatches) {
      if (match.concept.related && match.concept.related.length > 0) {
        for (const relatedConceptId of match.concept.related) {
          // Find the related concept's match in the current list of matches
          const relatedMatch = conceptMatches.find(cm => cm.concept.id === relatedConceptId);
          
          if (relatedMatch && relatedMatch.score > relatedConceptsThreshold) {
            // Apply a bonus to the current match's score based on the related match's score
            match.score += (relatedMatch.score * relatedScoreBonusFactor);
          }
        }
      }
    }
    
    // Sort by score in descending order
    return conceptMatches.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Score how well a concept matches against extracted terms
   * 
   * @param concept The concept to match
   * @param terms The extracted terms
   * @param weights Position weights for scoring
   * @returns A concept match with score and matched terms
   */
  private scoreConceptMatch(
    concept: TaxonomyConcept,
    terms: ExtractedTerm[],
    weights: PositionWeights
  ): ConceptMatch {
    let score = 0;
    const matchedTerms: Array<{term: string, weight: number}> = [];
    
    // Create normalized versions of concept label and definition
    const normalizedLabel = concept.prefLabel.toLowerCase();
    const normalizedDefinition = concept.definition.toLowerCase();
    
    // Extract key terms from concept definition
    const conceptKeyTerms = this.extractConceptKeyTerms(normalizedDefinition);
    
    // Check each term for matches
    for (const term of terms) {
      // Calculate term weight based on position and frequency
      const positionWeight = this.calculatePositionWeight(term.positions, weights);
      const frequencyWeight = Math.log1p(term.frequency); // Logarithmic weight to prevent dominance by frequent terms
      let termWeight = positionWeight * frequencyWeight;
      
      // Check for exact or partial matches
      let matchingScore = 0;
      
      // Exact label match (highest weight)
      if (normalizedLabel === term.normalized) {
        matchingScore = 1.0 * termWeight;
      }
      // Label contains term or term contains label
      else if (normalizedLabel.includes(term.normalized) || term.normalized.includes(normalizedLabel)) {
        matchingScore = 0.8 * termWeight;
      }
      // Term matches a key term from definition
      else if (conceptKeyTerms.some(keyTerm => 
        keyTerm === term.normalized || 
        keyTerm.includes(term.normalized) ||
        term.normalized.includes(keyTerm)
      )) {
        matchingScore = 0.6 * termWeight;
      }
      // Term appears in definition
      else if (normalizedDefinition.includes(term.normalized)) {
        matchingScore = 0.4 * termWeight;
      }
      
      // Add to score if there was a match
      if (matchingScore > 0) {
        score += matchingScore;
        matchedTerms.push({
          term: term.term,
          weight: matchingScore
        });
      }
    }
    
    return {
      concept,
      score,
      matchedTerms
    };
  }
  
  /**
   * Calculate position-based weight for a term
   * 
   * @param positions The positions where the term appears
   * @param weights Position weights configuration
   * @returns The calculated position weight
   */
  private calculatePositionWeight(positions: number[], weights: PositionWeights): number {
    let weight = 0;
    
    // Check each position
    for (const position of positions) {
      // Title
      if (position === 0) {
        weight += weights.title;
      }
      // First paragraph
      else if (position === 1) {
        weight += weights.firstPara;
      }
      // Body paragraphs
      else {
        weight += weights.body;
      }
    }
    
    return weight;
  }
  
  /**
   * Extract key terms from a concept definition
   * 
   * @param definition The concept definition
   * @returns Array of key terms
   */
  private extractConceptKeyTerms(definition: string): string[] {
    // Normalize and tokenize the definition
    const tokens = definition
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => 
        token.length >= 3 && 
        !this.stopWords.has(token)
      );
    
    // Get unique tokens to avoid duplicates
    const uniqueTokens = Array.from(new Set(tokens));
    
    // Extract bigrams for key phrases
    const bigrams: string[] = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      bigrams.push(bigram);
    }
    
    // Combine tokens and bigrams
    return [...uniqueTokens, ...bigrams];
  }
  
  /**
   * Calculate confidence scores from concept matches
   * 
   * @param matches The concept matches
   * @param threshold Minimum confidence threshold
   * @param maxConcepts Maximum number of concepts to return
   * @returns Array of concept classifications
   */
  private calculateConfidence(
    matches: ConceptMatch[],
    threshold: number,
    maxConcepts: number
  ): ConceptClassification[] {
    // If no matches, return empty array
    // If no matches, return empty array
    if (matches.length === 0) {
      return [];
    }

    // Sort matches by raw score first
    const sortedMatches = matches.sort((a, b) => b.score - a.score);

    // Filter by threshold (now applying to raw scores) and limit to max concepts
    const filteredMatches = sortedMatches
      .filter(match => match.score >= threshold) 
      .slice(0, maxConcepts);

    // Convert to ConceptClassification objects, using raw score as confidence
    return filteredMatches.map(match => ({
      conceptId: match.concept.id,
      confidence: match.score, // Use raw score as confidence
      classifiedAt: new Date().toISOString(),
      userVerified: false
    }));
  }
  
  /**
   * Initialize a set of common stop words to filter out
   * @returns Set of stop words
   */
  private initializeStopWords(): Set<string> {
    const stopWordsList = [
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 
      'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
      'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 
      'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 
      'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 
      'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 
      'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 
      'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 
      'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 
      'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 
      'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 
      'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 
      'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 
      'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 
      'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 
      'yourselves'
    ];
    
    return new Set(stopWordsList);
  }
}
