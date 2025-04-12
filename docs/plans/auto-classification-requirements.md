# Automatic Taxonomy Classification Feature

## Overview

The automatic taxonomy classification feature will enhance the Mosaiq application by automatically analyzing content items and assigning relevant concepts from the predefined knowledge taxonomy. This will enable better content organization, discovery, and relationship mapping without requiring manual tagging.

## Business Requirements

### Core Requirements

**Automatic Classification**:

*   The system shall automatically classify a knowledge/content item with one to many concepts from the custom taxonomy.
*   Classification should occur when new content is added and when content is updated.
*   Each classification should include a confidence score.

**Taxonomy Integration**:

*   Use the existing taxonomy defined in `resources/taxonomy/custom_knowledge_taxonomy.json`.
*   Support the SKOS-based structure with top-level concepts and nested subconcepts.

**Multi-concept Classification**:

*   Content should be classified with multiple relevant concepts when appropriate.
*   A minimum confidence threshold should be configurable to control classification precision.

**User Experience**:

*   Display assigned concepts in the UI when viewing content.
*   Allow users to accept, reject, or modify automatic classifications.
*   Provide visual indication of confidence levels for suggested classifications.

**Search and Filtering**:

*   Enable content filtering based on assigned taxonomy concepts.
*   Support searching for content by concept name or related terms.

### Additional Requirements

**Performance**:

*   Classification process should complete within 5 seconds for typical content.
*   The process should run asynchronously and not block the UI.

**Storage**:

*   Persist concept classifications with content metadata.
*   Include confidence scores and timestamps with classifications.

**Extensibility**:

*   Allow for future integration with more advanced AI models.
*   Support updating the taxonomy structure without breaking existing classifications.

## Technical Requirements

### Data Model Extensions

**ContentItem Extension**:

**Taxonomy Access**:

*   Create utility functions to parse and access the taxonomy structure.
*   Cache the taxonomy in memory for efficient access.

### Implementation Approach

The implementation will use a hybrid approach combining text-based similarity matching and vector embeddings:

**Term Frequency Analysis**:

*   Extract key terms from content text.
*   Match these terms against concept labels and definitions.
*   Assign preliminary weights based on frequency and location in text.

**Vector Embeddings with MiniLM Model**:

*   Use a lightweight MiniLM embedding model (`all-MiniLM-L6-v2`) that can run locally.
*   Leverage the existing `IVectorStorage` infrastructure.
*   Generate embeddings for each taxonomy concept (label + definition).
*   Generate embeddings for content text.
*   Calculate similarity between content and concepts using cosine similarity.

**Tiered Embedding Approach**:

*   Start with local MiniLM model (384 dimensions) for offline-capable, privacy-focused embeddings.
*   Design for future integration with more powerful models like MPNet (`all-mpnet-base-v2`) or OpenAI embeddings.
*   Allow configurable model selection based on user preference and availability.

**Confidence Scoring**:

*   Combine term frequency scores and embedding similarity scores.
*   Apply a scoring algorithm to produce final confidence values.
*   Filter by minimum confidence threshold.

**User Feedback Loop**:

*   Store user-verified classifications.
*   Use feedback to improve classification over time.

## Architecture

### Components

**TaxonomyService**:

*   Loads and parses the taxonomy file.
*   Provides methods to access concept details.
*   Caches taxonomy for efficient access.

**ClassificationService**:

*   Performs automatic classification of content.
*   Manages vector embeddings for taxonomy concepts.
*   Provides methods to suggest classifications and calculate confidence scores.

**UI Components**:

*   ConceptTag - Display a concept with confidence indication.
*   ConceptSelector - Allow browsing and selecting concepts.
*   ClassificationReview - Interface for reviewing suggested classifications.

### Integration Points

**ContentService**:

*   Extend to include automatic classification when content is saved.
*   Add methods to update content classifications.

**ElectronContentProcessor**:

*   Enhance metadata extraction to include concept analysis.
*   Generate initial classification suggestions during content processing.

**LocalVectorAdapter**:

*   Use for storing concept embeddings and content embeddings.
*   Leverage similarity search for concept matching.

## Implementation Plan

### Phase 1: Core Infrastructure

1.  Create `TaxonomyService` to load and manage the taxonomy.
2.  Extend `ContentItem` interface and storage to include concept classifications.
3.  Implement basic term frequency analysis for initial classification.
4.  Update UI to display concepts assigned to content.

### Phase 2: Vector-Based Classification

1.  Generate and store embeddings for all taxonomy concepts.
2.  Implement content embedding generation in `ContentProcessor`.
3.  Create similarity matching logic in `ClassificationService`.
4.  Combine text-based and vector-based approaches for improved accuracy.

### Phase 3: User Experience & Feedback

1.  Implement user interface for reviewing and modifying classifications.
2.  Add a feedback mechanism to improve classification over time.
3.  Enhance search and filtering capabilities to use concept classifications.

## Code Implementation

### Key Files to Create/Modify

**New Files**:

*   `D:\Workspace\mosaiq\packages\core\src\services\TaxonomyService.ts`
*   `D:\Workspace\mosaiq\packages\core\src\services\ClassificationService.ts`
*   `D:\Workspace\mosaiq\packages\common-ui\src\components\ConceptTag.tsx`
*   `D:\Workspace\mosaiq\packages\common-ui\src\components\ClassificationReview.tsx`

**Files to Modify**:

*   `D:\Workspace\mosaiq\packages\core\src\services\ContentService.ts`
*   `D:\Workspace\mosaiq\packages\desktop-app\src\main\adapters\ElectronContentProcessor.ts`
*   Relevant UI components for displaying content items

## Technical Challenges & Considerations

**Embedding Model Integration**:

*   **Local Model Packaging**: Bundle the MiniLM model with the application (~50MB).
*   **Model Loading Performance**: Initialize the embedding model at application startup to avoid delays during classification.
*   **Memory Considerations**: The MiniLM model requires ~100-200MB of RAM when loaded.
*   **ONNX Runtime Integration**: Use the ONNX runtime for efficient model inference in the Electron environment.

**Vector Embedding Quality**:

*   MiniLM provides a good balance of quality and size but has limitations with domain-specific terminology.
*   Design the system to allow upgrading to more powerful models (MPNet or OpenAI embeddings) as an option.
*   Consider a confidence adjustment factor based on the model being used.

**Performance**:

*   Generating embeddings can be resource-intensive, even with smaller models.
*   Implement background processing with worker threads for embedding generation.
*   Implement aggressive caching of embeddings for both content and concepts.
*   Consider batch processing for initial taxonomy embedding generation.

**Taxonomy Updates**:

*   Design for graceful handling when taxonomy is updated.
*   Ensure backward compatibility for existing classifications.
*   Implement a versioning system for embeddings to avoid mixing embeddings from different models.

**Accuracy vs. Coverage**:

*   Balance precision (avoiding incorrect classifications) with recall (catching all relevant classifications).
*   Use configurable thresholds to adjust this balance based on user preference.
*   Allow higher thresholds for the lighter MiniLM model to compensate for potential accuracy differences.

## Future Enhancements

**Advanced Embedding Models**:

*   Implement optional integration with more powerful models like `all-mpnet-base-v2` (768 dimensions).
*   Add support for cloud-based embeddings like OpenAI's `text-embedding-3-small` as an optional feature.
*   Develop a model management system to switch between models and manage their lifecycles.

**Learning from User Feedback**:

*   Implement a mechanism to learn from user corrections and improve classification over time.
*   Use verified classifications to fine-tune or adapt the embedding approach.

**Domain-Specific Classification**:

*   Allow for domain-specific classification models that can be plugged in for different knowledge domains.
*   Support for custom-trained domain-specific embedding models.

**Related Concepts Suggestion**:

*   Suggest related concepts based on taxonomy relationships (broader/narrower).
*   Implement "semantic neighbors" feature using embedding space proximity.

**Custom Taxonomy Extension**:

*   Enable users to extend the taxonomy with custom concepts.
*   Automatically generate embeddings for new concepts as they're added.

## Testing Strategy

**Unit Testing**:

*   Test individual classification algorithms and utility functions.
*   Verify taxonomy parsing and access functions.

**Integration Testing**:

*   Test end-to-end classification process with sample content.
*   Verify correct storage and retrieval of classifications.

**Performance Testing**:

*   Benchmark classification speed with various content sizes.
*   Test with large taxonomies to ensure scalability.

**User Acceptance Testing**:

*   Evaluate classification accuracy against human judgment.
*   Gather feedback on UI for reviewing and modifying classifications.

```typescript
interface ConceptClassification {
  conceptId: string;       // SKOS concept identifier from taxonomy
  confidence: number;      // Value between 0-1 indicating confidence
  classifiedAt: string;    // ISO timestamp
  userVerified: boolean;   // Whether a user has verified this classification
}

// Extended ContentItem interface
interface ContentItem {
  // ... existing properties
  concepts?: ConceptClassification[];
}
```