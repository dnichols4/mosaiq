import { promises as fs } from 'fs';
import path from 'path';
import { deserialize, serialize } from '../utils/serialization';

/**
 * Interface representing a taxonomy concept in the SKOS schema
 */
export interface TaxonomyConcept {
  id: string;
  prefLabel: string;
  definition: string;
  broader?: string;
  narrower?: string[];
  inScheme: string;
}

/**
 * Interface for concept classification with confidence scoring
 */
export interface ConceptClassification {
  conceptId: string;       // SKOS concept identifier from taxonomy
  confidence: number;      // Value between 0-1 indicating confidence
  classifiedAt: string;    // ISO timestamp
  userVerified: boolean;   // Whether a user has verified this classification
}

/**
 * Service responsible for loading and managing the knowledge taxonomy
 */
export class TaxonomyService {
  private concepts: Map<string, TaxonomyConcept> = new Map();
  private conceptsByLabel: Map<string, TaxonomyConcept> = new Map();
  private topLevelConcepts: TaxonomyConcept[] = [];
  private taxonomyPath: string;
  private taxonomyVersion: string = '';
  private loaded: boolean = false;

  /**
   * Create a TaxonomyService instance
   * @param taxonomyPath Path to the taxonomy JSON file (default: resources/taxonomy/custom_knowledge_taxonomy.json)
   */
  constructor(taxonomyPath: string = '') {
    this.taxonomyPath = taxonomyPath || path.join('resources', 'taxonomy', 'custom_knowledge_taxonomy.json');
  }

  /**
   * Load the taxonomy from the configured path
   */
  async loadTaxonomy(): Promise<void> {
    try {
      // Load the taxonomy file
      const data = await fs.readFile(this.taxonomyPath, 'utf8');
      const taxonomyData = JSON.parse(data);
      
      // Parse the taxonomy graph
      await this.parseTaxonomyData(taxonomyData);
      
      // Mark as loaded
      this.loaded = true;
      
      console.log(`Taxonomy loaded with ${this.concepts.size} concepts`);
    } catch (error) {
      console.error('Error loading taxonomy:', error);
      throw error;
    }
  }

  /**
   * Parse the SKOS taxonomy data
   * @param taxonomyData The raw taxonomy data
   */
  private async parseTaxonomyData(taxonomyData: any): Promise<void> {
    if (!taxonomyData || !taxonomyData['@graph']) {
      throw new Error('Invalid taxonomy data format');
    }

    const graph = taxonomyData['@graph'];
    
    // First pass: extract all concepts
    for (const node of graph) {
      if (node['@type'] === 'skos:ConceptScheme') {
        // Extract scheme information
        this.taxonomyVersion = node['skos:prefLabel'] || 'Unknown';
        continue;
      }
      
      if (node['@type'] === 'skos:Concept') {
        const id = this.extractIdFromUri(node['@id']);
        const prefLabel = node['skos:prefLabel'];
        const definition = node['skos:definition'];
        const inScheme = this.extractIdFromUri(node['skos:inScheme']['@id']);
        
        // Create concept object
        const concept: TaxonomyConcept = {
          id,
          prefLabel,
          definition,
          inScheme,
          narrower: []
        };
        
        // Store concept by ID and label
        this.concepts.set(id, concept);
        this.conceptsByLabel.set(prefLabel.toLowerCase(), concept);
      }
    }
    
    // Second pass: establish relationships
    for (const node of graph) {
      if (node['@type'] === 'skos:Concept') {
        const id = this.extractIdFromUri(node['@id']);
        const concept = this.concepts.get(id);
        
        if (!concept) continue;
        
        // Handle broader relationship
        if (node['skos:broader']) {
          const broaderId = this.extractIdFromUri(node['skos:broader']['@id']);
          concept.broader = broaderId;
          
          // Update the broader concept's narrower array
          const broaderConcept = this.concepts.get(broaderId);
          if (broaderConcept && broaderConcept.narrower) {
            broaderConcept.narrower.push(id);
          }
        }
        
        // Handle narrower relationships
        if (node['skos:narrower']) {
          const narrower = Array.isArray(node['skos:narrower']) 
            ? node['skos:narrower'] 
            : [node['skos:narrower']];
          
          concept.narrower = narrower.map((n: any) => this.extractIdFromUri(n['@id']));
        }
        
        // Identify top-level concepts
        if (node['skos:topConceptOf'] || 
            (concept.broader === undefined && node['skos:inScheme'])) {
          this.topLevelConcepts.push(concept);
        }
      }
    }
  }

  /**
   * Extract the ID portion from a URI
   * @param uri The URI to process
   * @returns The extracted ID
   */
  private extractIdFromUri(uri: string): string {
    // Handle URIs like "ex:concept_name"
    if (uri && uri.includes(':')) {
      return uri.split(':')[1];
    }
    return uri;
  }

  /**
   * Get a concept by its ID
   * @param id The concept ID
   * @returns The concept or undefined if not found
   */
  getConcept(id: string): TaxonomyConcept | undefined {
    this.ensureLoaded();
    return this.concepts.get(id);
  }

  /**
   * Get a concept by its preferred label
   * @param label The concept's preferred label
   * @returns The concept or undefined if not found
   */
  getConceptByLabel(label: string): TaxonomyConcept | undefined {
    this.ensureLoaded();
    return this.conceptsByLabel.get(label.toLowerCase());
  }

  /**
   * Get all concepts
   * @returns Array of all concepts
   */
  getAllConcepts(): TaxonomyConcept[] {
    this.ensureLoaded();
    return Array.from(this.concepts.values());
  }

  /**
   * Get top-level concepts
   * @returns Array of top-level concepts
   */
  getTopLevelConcepts(): TaxonomyConcept[] {
    this.ensureLoaded();
    return [...this.topLevelConcepts];
  }

  /**
   * Get child concepts of a specified concept
   * @param conceptId The parent concept ID
   * @returns Array of child concepts
   */
  getChildConcepts(conceptId: string): TaxonomyConcept[] {
    this.ensureLoaded();
    const concept = this.concepts.get(conceptId);
    
    if (!concept || !concept.narrower) {
      return [];
    }
    
    return concept.narrower
      .map(id => this.concepts.get(id))
      .filter((c): c is TaxonomyConcept => c !== undefined);
  }

  /**
   * Get the parent concept of a specified concept
   * @param conceptId The child concept ID
   * @returns The parent concept or undefined
   */
  getParentConcept(conceptId: string): TaxonomyConcept | undefined {
    this.ensureLoaded();
    const concept = this.concepts.get(conceptId);
    
    if (!concept || !concept.broader) {
      return undefined;
    }
    
    return this.concepts.get(concept.broader);
  }

  /**
   * Get ancestor concepts (the path to root) for a given concept
   * @param conceptId The concept ID
   * @returns Array of ancestor concepts from immediate parent to root
   */
  getAncestorConcepts(conceptId: string): TaxonomyConcept[] {
    this.ensureLoaded();
    const ancestors: TaxonomyConcept[] = [];
    let currentId = conceptId;
    
    // Traverse up the hierarchy
    while (true) {
      const concept = this.concepts.get(currentId);
      if (!concept || !concept.broader) {
        break;
      }
      
      const parent = this.concepts.get(concept.broader);
      if (!parent) {
        break;
      }
      
      ancestors.push(parent);
      currentId = parent.id;
    }
    
    return ancestors;
  }

  /**
   * Export the taxonomy to a serialized format for storage
   * @returns A serialized representation of the taxonomy
   */
  exportTaxonomy(): string {
    this.ensureLoaded();
    
    const taxonomyData = {
      version: this.taxonomyVersion,
      concepts: Array.from(this.concepts.values()),
      topLevelConcepts: this.topLevelConcepts.map(c => c.id)
    };
    
    return serialize(taxonomyData);
  }

  /**
   * Check if the taxonomy is loaded, throw an error if not
   */
  private ensureLoaded(): void {
    if (!this.loaded) {
      throw new Error('Taxonomy has not been loaded. Call loadTaxonomy() first.');
    }
  }

  /**
   * Get the taxonomy version
   * @returns The taxonomy version string
   */
  getTaxonomyVersion(): string {
    this.ensureLoaded();
    return this.taxonomyVersion;
  }

  /**
   * Search for concepts by text query
   * @param query The search query
   * @returns Array of matching concepts
   */
  searchConcepts(query: string): TaxonomyConcept[] {
    this.ensureLoaded();
    
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const results: TaxonomyConcept[] = [];
    
    // Search in concept labels and definitions
    for (const concept of this.concepts.values()) {
      const labelMatch = concept.prefLabel.toLowerCase().includes(normalizedQuery);
      const definitionMatch = concept.definition.toLowerCase().includes(normalizedQuery);
      
      if (labelMatch || definitionMatch) {
        results.push(concept);
      }
    }
    
    return results;
  }
}
