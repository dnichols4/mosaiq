import { TaxonomyService, TaxonomyConcept } from './TaxonomyService';
import path from 'path';

describe('TaxonomyService', () => {
  let taxonomyService: TaxonomyService;
  
  beforeAll(async () => {
    // Create a TaxonomyService instance with the path to the test taxonomy file
    const taxonomyPath = path.join('resources', 'taxonomy', 'custom_knowledge_taxonomy.json');
    taxonomyService = new TaxonomyService(taxonomyPath);
    
    // Load the taxonomy
    await taxonomyService.loadTaxonomy();
  });
  
  test('should load taxonomy correctly', () => {
    expect(taxonomyService.getAllConcepts().length).toBeGreaterThan(0);
    expect(taxonomyService.getTopLevelConcepts().length).toBeGreaterThan(0);
  });
  
  test('should get concept by ID', () => {
    const concept = taxonomyService.getConcept('physics');
    
    expect(concept).toBeDefined();
    expect(concept?.prefLabel).toBe('Physics');
    expect(concept?.definition).toContain('study of matter');
  });
  
  test('should get concept by label', () => {
    const concept = taxonomyService.getConceptByLabel('Physics');
    
    expect(concept).toBeDefined();
    expect(concept?.id).toBe('physics');
  });
  
  test('should get child concepts', () => {
    const childConcepts = taxonomyService.getChildConcepts('physical_sciences');
    
    expect(childConcepts.length).toBeGreaterThan(0);
    // Check that physics is among the child concepts
    expect(childConcepts.some(c => c.id === 'physics')).toBe(true);
  });
  
  test('should get parent concept', () => {
    const parentConcept = taxonomyService.getParentConcept('physics');
    
    expect(parentConcept).toBeDefined();
    expect(parentConcept?.id).toBe('physical_sciences');
  });
  
  test('should get ancestor concepts', () => {
    const ancestors = taxonomyService.getAncestorConcepts('physics');
    
    expect(ancestors.length).toBeGreaterThan(0);
    // Check the hierarchy: physics -> physical_sciences -> science_technology
    expect(ancestors[0].id).toBe('physical_sciences');
  });
  
  test('should search concepts', () => {
    const results = taxonomyService.searchConcepts('energy');
    
    expect(results.length).toBeGreaterThan(0);
    // Physics should be found since its definition mentions energy
    expect(results.some(c => c.id === 'physics')).toBe(true);
  });
  
  test('should export taxonomy', () => {
    const exported = taxonomyService.exportTaxonomy();
    
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('string');
    
    // Should be parseable JSON
    const parsed = JSON.parse(exported);
    expect(parsed.concepts).toBeDefined();
    expect(Array.isArray(parsed.concepts)).toBe(true);
  });
});
