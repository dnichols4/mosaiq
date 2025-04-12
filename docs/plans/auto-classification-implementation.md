# Automatic Taxonomy Classification: Implementation Approach

## 1\. Overview

This document outlines the approach for implementing automatic taxonomy classification in the Mosaiq application. The feature will analyze content items and assign relevant concepts from the custom knowledge taxonomy, enabling better content organization and discovery.

## 2\. Architecture Components

### 2.1 Core Services

**TaxonomyService**

*   Responsible for loading and managing the SKOS taxonomy structure
*   Provides methods to query concepts, relationships, and navigate the hierarchy
*   Caches taxonomy in memory for efficient access

**EmbeddingService**

*   Handles generation of vector embeddings for both content and taxonomy concepts
*   Implements a unified interface for different embedding backends
*   Initially uses MiniLM model for local, privacy-respecting embeddings
*   Designed to support future upgrade paths to more advanced models

**ClassificationService**

*   Coordinates the classification process using a hybrid approach
*   Combines text-based analysis and vector-based similarity
*   Manages confidence scoring and threshold filtering
*   Handles user feedback and classification improvement

**Content Processing Integration**

*   Extends the existing content service to incorporate automatic classification
*   Seamlessly adds classification during content import
*   Provides methods to update and manage classifications

### 2.2 User Interface Components

**ConceptTag**

*   Displays a single concept classification with confidence indicator
*   Visual differentiation based on confidence level
*   Supports user interaction (selection, removal)

**ClassificationReview**

*   Interface for users to review and modify concept classifications
*   Allows verification of automatic classifications
*   Supports adding custom concepts and removing incorrect ones
*   Displays concept details and definitions

## 3\. Embedding Strategy

### 3.1 Initial Implementation with MiniLM

The implementation will use the all-MiniLM-L6-v2 model for generating embeddings:

**Characteristics**:

*   384-dimensional embeddings
*   ~50MB model size
*   Can run locally in the Electron environment
*   Good balance of quality and performance

**Benefits**:

*   Maintains privacy (no data leaves the application)
*   Works offline
*   Reasonable performance on consumer hardware
*   No API fees or rate limits

**Implementation Notes**:

*   Use ONNX runtime for efficient model inference
*   Implement caching mechanisms to avoid regenerating embeddings
*   Run embedding generation in background processes to prevent UI blocking

### 3.2 Future Embedding Upgrade Path

The architecture is designed to support future upgrades to more powerful models:

*   **MPNet-based models** (768 dimensions) for improved accuracy
*   **OpenAI Embeddings API** for state-of-the-art classification (optional cloud feature)
*   Switchable embedding backends through a unified interface

## 4\. Classification Algorithm

The classification process uses a hybrid approach combining multiple techniques:

### 4.1 Text-Based Classification

**Term Matching**:

*   Extract key terms from content text
*   Match against concept labels and definitions
*   Consider term frequency and location (title vs. body)

**Scoring Factors**:

*   Exact concept label matches (highest weight)
*   Key term matches from concept definitions
*   Position of matches (title matches weighted higher)
*   Frequency of matches (with diminishing returns)

### 4.2 Vector-Based Classification

**Content Embedding**:

*   Generate embedding for content text
*   Weight title more heavily in the embedding

**Concept Matching**:

*   Compare content embedding against pre-computed concept embeddings
*   Calculate cosine similarity scores
*   Rank concepts by similarity

### 4.3 Combined Classification

**Score Fusion**:

*   Combine text-based and vector-based scores (60/40 weighting)
*   Apply confidence normalization

**Filtering**:

*   Filter by minimum confidence threshold (configurable, default 0.6)
*   Limit to maximum number of concepts (configurable, default 5)
*   Consider taxonomy relationships in final selection

## 5\. User Experience Flow

**Initial Classification**:

*   Content is automatically classified when added to the system
*   Concepts are assigned with confidence scores

**Classification Display**:

*   Concepts shown as tags with visual confidence indicators
*   Higher confidence = stronger visual indicators
*   User-verified concepts visually distinguished

**User Review**:

*   Users can view, verify, add, or remove concept classifications
*   Concept details shown on selection (definition, taxonomy location)
*   Classification confidence shown to help user decision-making

**Feedback Loop**:

*   User verifications are recorded and maintained
*   Verified classifications persist through reclassification events
*   Future versions can use feedback to improve the classification model

## 6\. Integration with Existing Code

### 6.1 ContentService Extension

*   Add concept classification fields to ContentItem interface
*   Extend save methods to include automatic classification
*   Add methods for updating classifications
*   Implement batch reclassification capability

### 6.2 UI Component Integration

*   Add classification elements to content detail views
*   Add classification review panel to reader interface
*   Expose classification management capabilities through UI

### 6.3 Adapters & Infrastructure

*   Extend ElectronContentProcessor to incorporate classification
*   Leverage existing vector storage capabilities
*   Add model loading and management infrastructure

## 7\. Performance Considerations

### 7.1 Memory Management

*   Taxonomy with embeddings may require ~10-20MB of memory
*   MiniLM model requires ~100-200MB when loaded
*   Implement lazy loading where possible
*   Consider worker threads for embedding generation

### 7.2 Initialization Optimization

*   Load taxonomy at application startup
*   Initialize embedding model asynchronously
*   Generate concept embeddings in background
*   Cache embeddings to avoid regeneration

### 7.3 Classification Performance

*   Classification should complete within 1-2 seconds for typical content
*   Use background processing for batch operations
*   Implement caching to avoid redundant processing
*   Optimize vector operations for similarity calculation

## 8\. Initialization and Setup

### 8.1 Required Resources

*   MiniLM model file in ONNX format (~50MB)
*   Tokenizer vocabulary and configuration files
*   Taxonomy JSON file with concept definitions

### 8.2 Initialization Sequence

1.  Load taxonomy from JSON file
2.  Initialize embedding model
3.  Load or generate concept embeddings
4.  Initialize classification service
5.  Register with content service

### 8.3 Build and Packaging

*   Include model files in application package
*   Add necessary runtime dependencies (ONNX runtime)
*   Update build scripts to include model files

## 9\. Future Enhancements

### 9.1 Advanced Model Support

*   Implement MPNet embedding service for improved accuracy
*   Add optional OpenAI embedding API integration
*   Create model selection and configuration UI

### 9.2 Learning from Feedback

*   Track user verifications and corrections
*   Adjust scoring based on historical accuracy
*   Implement concept relationship weighting

### 9.3 Classification Improvements

*   Add semantic relationship consideration in classification
*   Implement domain-specific classification profiles
*   Add context-aware classification options

## 10\. Implementation Plan

### 10.1 Phase 1: Core Infrastructure

1.  Implement TaxonomyService for taxonomy loading and access
2.  Create EmbeddingService with MiniLM implementation
3.  Develop basic ClassificationService with text-based analysis
4.  Extend ContentItem interface to support classifications

### 10.2 Phase 2: Classification Implementation

1.  Implement vector embedding generation for concepts
2.  Develop hybrid classification algorithm
3.  Integrate with content processing pipeline
4.  Add basic UI components for concept display

### 10.3 Phase 3: User Experience

1.  Implement classification review interface
2.  Add user feedback collection
3.  Develop concept browsing and selection UI
4.  Create batch reclassification tools

## Conclusion

This implementation approach provides a robust framework for automatic taxonomy classification while maintaining the application's local-first, privacy-respecting design. The hybrid classification approach balances accuracy and performance, while the modular architecture enables future enhancements and model upgrades.

The initial implementation with MiniLM provides a practical starting point, with clear upgrade paths as requirements evolve. The design accommodates user feedback and customization, allowing the classification system to improve over time.