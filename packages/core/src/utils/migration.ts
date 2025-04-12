import { ContentItem } from '../services/ContentService';
import { ConceptClassification } from '../services/TaxonomyService';
import { IStorageProvider } from '@mosaiq/platform-abstractions';

/**
 * Migrates content items to support concept classifications
 * This adds the concepts field to any content items that don't have it
 * 
 * @param metadataStorage Storage provider for content metadata
 * @returns Promise resolving to the count of migrated items
 */
export async function migrateContentToSupportConcepts(
  metadataStorage: IStorageProvider
): Promise<number> {
  try {
    // Get all content items
    const items = await metadataStorage.get<Record<string, ContentItem>>('contentItems') || {};
    let migratedCount = 0;
    let hasChanges = false;
    
    // Check each item for missing concepts field
    for (const id in items) {
      if (!items[id].concepts) {
        items[id].concepts = [];
        migratedCount++;
        hasChanges = true;
      }
    }
    
    // Only save if there were changes
    if (hasChanges) {
      await metadataStorage.set('contentItems', items);
    }
    
    return migratedCount;
  } catch (error) {
    console.error('Error migrating content items:', error);
    throw error;
  }
}

/**
 * Validates concept classifications based on the taxonomy
 * This ensures all referenced concepts exist in the taxonomy
 * 
 * @param conceptIds Array of concept IDs from classifications
 * @param validConceptIds Set of valid concept IDs from taxonomy
 * @returns Array of invalid concept IDs
 */
export function validateConceptIds(
  conceptIds: string[],
  validConceptIds: Set<string>
): string[] {
  return conceptIds.filter(id => !validConceptIds.has(id));
}
