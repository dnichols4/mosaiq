# Knowledge & Learning Management Application

## Architecture Document v1.5

### Revision History

| Version | Date | Changes |
| --- | --- | --- |
| 1.0 | 2025-03-21 | Initial document creation |
| 1.1 | 2025-03-21 | Added Content Processing section |
| 1.2 | 2025-03-26 | Updated to reflect current implementation |
| 1.3 | 2025-04-10 | Updated based on review of code base |
| 1.4 | 2025-04-11 | Updated to include platform dialog and file picker abstractions |
| 1.5 | 2025-04-11 | Updated to include vector storage and serialization implementations |
| 1.6 | 2025-04-13 | Updated AI Processing Layer details and current implementation status to include classification and embedding services |
| 1.7 | 2025-04-13 | Updated to include classification integration with content processing pipeline |

### 1\. System Overview

A cross-platform desktop application for Knowledge & Learning Management focused on content consumption, annotation, and concept relationship discovery. The architecture follows a modular, local-first approach prioritizing user privacy and offline functionality.

### 2\. Architectural Approach

The project is organized as a monorepo using npm workspaces with the following packages:

*   common-ui: Shared UI components
*   core: Core business logic
*   desktop-app: Electron desktop application
*   platform-abstractions: Platform abstraction layer

#### 2.1 Core Architecture Pattern

*   Layered architecture with clear separation of concerns
*   Event-driven communication between components
*   Local-first data persistence with optional cloud sync

#### 2.2 High-Level Components

##### 2.2.1 Frontend / UI Layer

*   Cross-platform desktop interface
*   Component-based UI architecture
*   Responsive layout supporting multiple content formats

##### 2.2.2 Application Logic Layer

*   Business logic for application flow
*   State management and data flow control
*   Event handling and component communication

##### 2.2.3 Content Processing Layer

*   HTML parsing and cleanup for readable view
*   Document format conversion
*   Content extraction from various sources
*   Preservation of semantic structure while removing clutter
*   Typography and layout system for reading view

##### 2.2.4 AI Processing Layer

*   Concept extraction and analysis through TextBasedClassifier
*   Local embedding generation via MiniLM model
*   Hybrid AI processing combining text-based and vector-based classification
*   Classification confidence scoring and threshold filtering
*   Term extraction with position-aware weighting
*   Automatic classification during content import and save operations
*   Background classification processing with progress reporting
*   Batch reclassification capabilities for multiple content items
*   Classification cancellation and status reporting
*   Learning path generation (planned)
*   Phase 3 implementation completed with integrated classification pipeline

##### 2.2.5 Data Management Layer

*   Local content storage
*   Metadata management with concept classification data structures
*   Relationship graph storage
*   Vector database for semantic search - Implemented via IVectorStorage and LocalVectorAdapter
*   Concept classification storage with confidence scores
*   Taxonomy service for SKOS concept management
*   Caching mechanisms for embeddings and taxonomy concepts
*   Data serialization utilities - Implemented with complex object serialization
*   Sync mechanism (optional)

#### 2.3 Integration Points

*   Content import APIs
*   Export interfaces
*   Cloud sync endpoints (optional)
*   Plugin system interfaces (future)

### 3\. Technology Stack

#### 3.0 Package Structure

*   Monorepo with npm workspaces
*   TypeScript configuration with separate tsconfig files per package
*   Webpack for bundling the renderer process
*   Concurrently for running parallel build processes

#### 3.1 Frontend

*   Electron framework for cross-platform desktop app
*   React for UI components
*   Lightweight markdown/text rendering system
*   Custom annotation overlay system

#### 3.2 Application Logic

*   TypeScript for type safety
*   State management with Zustand
*   Event bus for component communication
*   Electron IPC for main-renderer process communication

#### 3.3 Content Processing

*   HTML/DOM manipulation libraries (Cheerio, JSDOM)
*   Mozilla's Readability for content extraction
*   Custom text cleaning and formatting pipeline
*   EPUB and PDF parsing libraries (in development)
*   Image handling and optimization

#### 3.4 AI Processing

*   MiniLM embedding model integration via ONNX runtime
*   Text-based classification with term extraction and frequency analysis
*   Hybrid classification combining text and vector approaches
*   Vector embeddings for concept relationships (implemented via IVectorStorage)
*   Vector operations library for similarity search (implemented with cosine similarity)
*   Confidence score fusion algorithms for classification
*   Position-aware term weighting (title/first paragraph/body)
*   Configurable classification parameters and thresholds
*   Local LLM integration (planned for future phases)
*   Optional cloud LLM APIs (planned for future phases)

#### 3.5 Storage

*   Filesystem-based content storage (.md files) - Implemented via FileSystemContentAdapter
*   Electron Store for application settings and metadata - Implemented via ElectronStorageAdapter
*   Local database for metadata and relationships (planned)
*   Vector storage for embeddings - Implemented via LocalVectorAdapter
*   Data serialization with type preservation - Implemented
*   Encrypted storage utilities (planned)

### 4\. Key Architectural Decisions

#### 4.1 Local-First Approach

*   All data stored locally by default
*   Full functionality without internet connection
*   Optional cloud features as enhancement only

#### 4.2 Content Storage Format

*   Human-readable markdown for content
*   Separate annotation storage linked to content
*   Portable file format for interoperability

#### 4.3 Content Processing Strategy

*   Multi-stage pipeline for content cleaning
*   Customizable reading view with user preferences
*   Preservation of essential semantic elements
*   Fallback mechanisms for parsing failures
*   Progressive enhancement for different content types

#### 4.4 AI Implementation Strategy

*   Layered AI approach (local for basic features, cloud for advanced)
*   Progressive enhancement with AI capabilities
*   User-controlled AI feature activation
*   Implementation planned for Phase 2

#### 4.5 Data Graph Representation

*   Concept nodes with relationship edges
*   Weighted connections based on user interaction
*   Bidirectional linking between content

### 5\. System Interfaces

#### 5.1 External Interfaces

*   Content import connectors
*   Export formats
*   Cloud sync API (optional)
*   Local filesystem access

#### 5.2 Internal Interfaces

*   UI to application logic events
*   Application to AI processing calls
*   Storage read/write operations
*   Relationship graph queries
*   Platform dialog and file picker interfaces:
    * `IDialogService` - Platform-independent dialog operations
    * `IFilePickerService` - Platform-independent file selection operations

### 6\. Performance Considerations

#### 6.1 Memory Management

*   Lazy loading of content
*   Virtual rendering for large documents
*   Efficient graph traversal for relationships

#### 6.2 Processing Optimization

*   Background AI processing
*   Incremental relationship updates
*   Cached search results and suggestions

### 7\. Security and Privacy

#### 7.1 Data Protection

*   Local encryption for sensitive data
*   No data collection by default
*   Transparency in any cloud features

#### 7.2 AI Processing Privacy

*   Local AI processing prioritized
*   Anonymized data for cloud processing
*   Clear user consent for any data sharing

### 8\. Extensibility Framework

#### 8.0 Current Implementation Status

The application is currently in active development with the following implementation status:

*   Basic Electron application structure implemented with main and renderer processes
*   React UI framework with component architecture in place
*   Content reading view implemented with Mozilla's Readability for content extraction
*   Content processing pipeline implemented with HTML cleaning and extraction
*   Local storage mechanism using Electron Store for metadata and filesystem for content
*   Vector storage mechanism implemented for AI embeddings with similarity search
*   Data serialization utilities for complex types and binary vector data
*   Platform abstraction interfaces defined and implemented for the desktop environment
*   Core services implemented for content and settings management
*   IPC communication between main and renderer processes established
*   Platform-independent dialog and file picker abstractions implemented:
    * `PlatformDialog` components for message, confirmation, and prompt dialogs
    * File picker components for selecting files, directories, and save locations
    * Electron-specific implementations with IPC communication
*   UI components enhanced with slider interfaces for reading settings:
    * `SettingsSlider` component for intuitive option selection
    * Updated reading settings panel with sliders for font size, line height, and content width
*   AI classification infrastructure implemented:
    * `TaxonomyService` for SKOS taxonomy management
    * `ClassificationService` with hybrid classification approach
    * `TextBasedClassifier` for term extraction and matching
    * `EmbeddingService` with MiniLM model implementation
    * Vector similarity search for semantic content classification
*   PDF and EPUB support planned but not yet implemented
*   Data graph visualization and relationship management planned but not yet implemented
*   Phase 1, 2, and 3 of auto-classification implementation completed

#### 8.1 Component Extensibility

*   Interface-based component system
*   Plugin architecture (Phase 2)
*   Custom view system
*   React Context API used for platform service dependencies:
    * DialogProvider for platform dialog services
    * FilePickerProvider for file selection services 
*   Current implementation uses React components with props for customization
*   Component abstraction via adapter pattern for platform-specific services

#### 8.2 AI Extensibility

*   Modular AI model integration
*   Customizable AI processing parameters
*   Multiple model support

#### 8.3 RDF and Knowledge Graph Support

*   Support for RDF (Resource Description Framework) data model planned for knowledge representation
*   Integration with N3.js for RDF parsing and manipulation
*   RDF-based graph storage for semantic relationships between content (planned)